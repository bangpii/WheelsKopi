"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Printer, ReceiptText, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import { rupiah } from "@/lib/dashboard-data";
import {
  applyPurchaseOrderToStock,
  purchaseFinanceEntry,
  upsertFinanceLedger,
} from "@/lib/integration";
import { todayInputDate } from "@/lib/transaction-data";
import type { ReceiptPORecord } from "@/lib/warehouse-data";
import type { PurchaseOrderDetail } from "@/lib/purchase-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";
const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";
const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const formatNumberInput = (val: string) => {
  const numberString = val.replace(/[^,\d]/g, "").toString();
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let out = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? "." : "";
    out += separator + ribuan.join(".");
  }
  return split[1] !== undefined ? out + "," + split[1] : out;
};
const parseFormattedNumber = (val: string) => Number(val.replace(/\./g, "")) || 0;
const money = (v: number) => rupiah.format(v);

function recalcOthers(po: PurchaseOrderDetail, shippingTotal: number, modalToko: number) {
  const qty = po.qty || 0;
  const shipFeePerSet = qty > 0 ? Math.round(shippingTotal / qty) : 0;
  const subModalPT = (po.rawPrice || 0) + shippingTotal;
  const modalPercent = qty > 0 ? subModalPT / qty : 0;
  const up = modalPercent - modalToko;
  const subTotal = subModalPT; // modal PT + ongkir
  const modalPerSet = modalPercent;
  return { shippingFee: shippingTotal, shipFeePerSet, subTotal, modalPerSet, modalToko, up };
}

export default function ReceiptPurchaseOrderPage() {
  const { purchaseOrders, setPurchaseOrders, receipts, setReceipts, setProducts, setFinanceStores } = useData();
  const can = useCan();
  const [isOpen, setIsOpen] = useState(false);
  const [viewing, setViewing] = useState<ReceiptPORecord | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    number: "",
    poNumber: "",
    supplier: "",
    address: "",
    date: "",
    status: "Pending" as "Pending" | "Completed",
    shippingFee: "",
    modalToko: "",
    notes: "",
  });

  const selectedOrder = useMemo(
    () => purchaseOrders.find((e) => e.number === form.poNumber),
    [purchaseOrders, form.poNumber],
  );
  const isOthers = selectedOrder?.category === "Others";

  const derived = useMemo(() => {
    if (!selectedOrder || selectedOrder.category !== "Others") return null;
    const shippingTotal = parseFormattedNumber(form.shippingFee);
    const modalToko = parseFormattedNumber(form.modalToko);
    return recalcOthers(selectedOrder, shippingTotal, modalToko);
  }, [selectedOrder, form.shippingFee, form.modalToko]);

  const openCreate = () => {
    setForm({ number: "", poNumber: "", supplier: "", address: "", date: todayInputDate(), status: "Pending", shippingFee: "", modalToko: "", notes: "" });
    setError("");
    setIsOpen(true);
  };

  const handlePoChange = (poNumber: string) => {
    const order = purchaseOrders.find((e) => e.number === poNumber);
    setForm((c) => ({
      ...c,
      poNumber,
      supplier: order?.supplier ?? c.supplier,
      address: order?.deliverTo ?? c.address,
      number: c.number || `RCP-${poNumber.replace("PO-", "")}`,
      shippingFee: order ? formatNumberInput(String(order.shippingFee || 0)) : c.shippingFee,
      modalToko: order ? formatNumberInput(String(order.modalToko || 0)) : c.modalToko,
    }));
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const order = purchaseOrders.find((e) => e.number === form.poNumber);
    if (!order) { setError("Pilih PO terlebih dahulu."); return; }
    if (form.status === "Completed" && order.received) {
      setError("PO ini sudah selesai diterima.");
      return;
    }

    const shippingTotal = parseFormattedNumber(form.shippingFee);
    const modalToko = parseFormattedNumber(form.modalToko);

    // Siapkan update PO (ongkir/modal/UP/dates) - bisa diisi walau Pending, final saat Completed
    const updatedOrder: PurchaseOrderDetail = (() => {
      if (order.category === "Others") {
        const r = recalcOthers(order, shippingTotal, modalToko);
        return {
          ...order,
          ...r,
          arrivalDate: new Date(form.date).toLocaleDateString("id-ID"),
          status: form.status === "Completed" ? "Completed" : "Pending",
          received: form.status === "Completed" ? true : order.received,
          notes: form.notes || order.notes,
        };
      }
      return {
        ...order,
        arrivalDate: new Date(form.date).toLocaleDateString("id-ID"),
        status: form.status === "Completed" ? "Completed" : "Pending",
        received: form.status === "Completed" ? true : order.received,
        notes: form.notes || order.notes,
      };
    })();

    const receipt: ReceiptPORecord = {
      id: `RCP-${Date.now()}`,
      number: form.number,
      poNumber: form.poNumber,
      supplier: form.supplier || order.supplier,
      address: form.address || order.deliverTo,
      date: new Date(form.date).toLocaleDateString("id-ID"),
      status: form.status,
      shippingFee: shippingTotal || undefined,
      notes: form.notes || undefined,
    };

    setReceipts((c) => [receipt, ...c]);

    if (form.status === "Completed" && !order.received) {
      // Selesai: update PO, tambah stok, catat finance (pakai nilai final ongkir/modal)
      setPurchaseOrders((c) => c.map((e) => (e.id === order.id ? updatedOrder : e)));
      setProducts((c) => applyPurchaseOrderToStock(c, updatedOrder));
      setFinanceStores((c) =>
        upsertFinanceLedger(c, {
          store: updatedOrder.deliverTo,
          date: updatedOrder.date,
          entries: [purchaseFinanceEntry(updatedOrder)],
        }),
      );
    } else {
      // Pending/draft penerimaan: simpan update ongkir/modal ke PO tanpa proses stok/finance
      setPurchaseOrders((c) => c.map((e) => (e.id === order.id ? updatedOrder : e)));
    }

    setIsOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Receipt Purchase Order</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Catat penerimaan PO. Status <b>Pending</b> = barang belum sampai (ongkir/UP bisa diisi nanti). Status <b>Selesai</b> = barang diterima, ongkir final, stok & finance ter-update realtime.
            </p>
          </div>
          {can("receipt", "input") && (
            <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
              <Plus className="size-4" />
              Create Receipt PO
            </button>
          )}
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number Receipt</th>
                  <th className={thClass}>Number PO</th>
                  <th className={thClass}>Supplier / Customer</th>
                  <th className={thClass}>Alamat</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="transition-colors hover:bg-muted/40">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <ReceiptText className="size-4" />
                        </span>
                        <span className="font-mono font-semibold">{receipt.number}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} font-mono text-muted-foreground`}>{receipt.poNumber}</td>
                    <td className={`${tdClass} font-medium`}>{receipt.supplier}</td>
                    <td className={`${tdClass} max-w-64 truncate text-muted-foreground`}>{receipt.address}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{receipt.date}</td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${receipt.status === "Completed" ? "bg-success-soft text-success" : "bg-warning/15 text-warning"}`}>
                        {receipt.status === "Completed" ? "Selesai" : "Pending"}
                      </span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90" title="Print receipt">
                          <Printer className="size-4" />
                        </button>
                        <button type="button" onClick={() => setViewing(receipt)} className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground" title="View receipt">
                          <Eye className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Create Receipt PO</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number Receipt</span>
                  <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={fieldClass} placeholder="RCP-2604" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number PO</span>
                  <select required value={form.poNumber} onChange={(e) => handlePoChange(e.target.value)} className={fieldClass}>
                    <option value="">Pilih nomor PO</option>
                    {purchaseOrders.map((order) => (
                      <option key={order.id} value={order.number}>
                        {order.number} — {order.supplier} ({order.received ? "Selesai" : order.status})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Status Penerimaan</span>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={fieldClass}>
                    <option value="Pending">Pending (barang belum sampai)</option>
                    <option value="Completed">Selesai (barang diterima)</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Tanggal Terima / Arrival</span>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Supplier / Customer</span>
                  <input required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Alamat / Deliver To</span>
                  <textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={fieldClass} />
                </label>
              </div>

              {selectedOrder && (
                <div className="rounded-xl border border-border/70 bg-background/40 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data PO (realtime)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div><span className="text-muted-foreground">Item</span><div className="font-medium">{selectedOrder.item}</div></div>
                    <div><span className="text-muted-foreground">Kategori</span><div className="font-medium">{selectedOrder.category}</div></div>
                    <div><span className="text-muted-foreground">Qty</span><div className="font-medium">{selectedOrder.qty}</div></div>
                    <div><span className="text-muted-foreground">Raw Price</span><div className="font-medium">{money(selectedOrder.rawPrice || 0)}</div></div>
                  </div>

                  {isOthers ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="space-y-1.5 text-sm">
                          <span className="font-medium">Shipping Fee Total / Ongkir (Rp)</span>
                          <input value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: formatNumberInput(e.target.value) })} className={fieldClass} placeholder="isi saat barang sampai/ongkir final" />
                          <span className="text-[11px] text-muted-foreground">Velg: ongkir dihitung per set (Qty {selectedOrder.qty})</span>
                        </label>
                        <label className="space-y-1.5 text-sm">
                          <span className="font-medium">Modal Toko (Rp)</span>
                          <input value={form.modalToko} onChange={(e) => setForm({ ...form, modalToko: formatNumberInput(e.target.value) })} className={fieldClass} />
                        </label>
                      </div>
                      {derived && (
                        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 rounded-lg bg-muted/40 p-3">
                          <div><span className="text-muted-foreground text-xs">Shipfee/Set</span><div className="font-semibold">{money(derived.shipFeePerSet)}</div></div>
                          <div><span className="text-muted-foreground text-xs">Sub Total (Modal PT)</span><div className="font-semibold">{money(derived.subTotal)}</div></div>
                          <div><span className="text-muted-foreground text-xs">Modal/Set</span><div className="font-semibold">{money(derived.modalPerSet)}</div></div>
                          <div><span className="text-muted-foreground text-xs">UP</span><div className="font-semibold text-primary">{money(derived.up)}</div></div>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">Simpan <b>Pending</b> jika ongkir/UP belum final; pilih <b>Selesai</b> saat barang sudah sampai untuk update PO, UP/harga, stok & finance.</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Ban/Sorted: ongkir ditangani di harga total; pilih <b>Selesai</b> saat barang diterima untuk menambah stok (Update Stok).</p>
                  )}
                </div>
              )}

              <label className="space-y-1.5 text-sm block">
                <span className="font-medium">Notes</span>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldClass} />
              </label>

              {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Simpan Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Receipt {viewing.number}</h2>
              <button type="button" onClick={() => setViewing(null)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["Number PO", viewing.poNumber],
                ["Supplier", viewing.supplier],
                ["Alamat", viewing.address],
                ["Tanggal", viewing.date],
                ["Status", viewing.status === "Completed" ? "Selesai" : "Pending"],
                ["Shipping Fee", viewing.shippingFee != null ? money(viewing.shippingFee) : "-"],
                ["Notes", viewing.notes || "-"],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted-foreground">{String(label)}</dt>
                  <dd className="text-right font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </AppShell>
  );
}

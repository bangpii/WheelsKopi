"use client";

import { useState } from "react";
import { Eye, Plus, Printer, ReceiptText, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { purchaseOrders } from "@/lib/operations-data";
import { receiptPOs as demoReceipts, type ReceiptPORecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

export default function ReceiptPurchaseOrderPage() {
  const [receipts, setReceipts] = useState<ReceiptPORecord[]>(demoReceipts);
  const [isOpen, setIsOpen] = useState(false);
  const [viewing, setViewing] = useState<ReceiptPORecord | null>(null);

  const [form, setForm] = useState({
    number: "",
    poNumber: "",
    supplier: "",
    address: "",
    date: "2026-10-30",
  });

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();

    setReceipts([
      {
        id: `RCP-${Date.now()}`,
        number: form.number,
        poNumber: form.poNumber,
        supplier: form.supplier,
        address: form.address,
        date: new Date(form.date).toLocaleDateString("id-ID"),
        status: "Completed",
      },
      ...receipts,
    ]);
    setIsOpen(false);
  };

  const handlePoChange = (poNumber: string) => {
    const order = purchaseOrders.find((entry) => entry.number === poNumber);
    setForm((current) => ({
      ...current,
      poNumber,
      supplier: order?.supplier ?? current.supplier,
      number: current.number || `RCP-${poNumber.replace("PO-", "")}`,
    }));
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Receipt Purchase Order</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Buat tanda terima untuk PO yang sudah dibayar, lengkap dengan nomor receipt dan status completed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ number: "", poNumber: "", supplier: "", address: "", date: "2026-10-30" });
              setIsOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            Create Receipt PO
          </button>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number Receipt</th>
                  <th className={thClass}>Number PO</th>
                  <th className={thClass}>Supplier / Customer</th>
                  <th className={thClass}>Alamat</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Status Receipt</th>
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
                      <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold text-success">{receipt.status}</span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20" title="Print receipt">
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 liquid-glass">
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
                  <input required value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} className={fieldClass} placeholder="RCP-2604" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number PO</span>
                  <select required value={form.poNumber} onChange={(event) => handlePoChange(event.target.value)} className={fieldClass}>
                    <option value="">Pilih nomor PO</option>
                    {purchaseOrders.map((order) => (
                      <option key={order.id} value={order.number}>
                        {order.number} — {order.supplier}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Supplier / Customer</span>
                  <input required value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Alamat Customer</span>
                  <textarea required rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Tanggal Pembayaran</span>
                  <input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={fieldClass} />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
                  Save as Draft
                </button>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Submit
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
                ["Status", viewing.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </AppShell>
  );
}

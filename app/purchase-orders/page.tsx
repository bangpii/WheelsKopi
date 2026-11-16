"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Check, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import { rupiah } from "@/lib/dashboard-data";
import {
  applyPurchaseOrderToStock,
  purchaseFinanceEntry,
  upsertFinanceLedger,
} from "@/lib/integration";
import {
  type PurchaseOrderCategory as Category,
  type PurchaseOrderDetail as PurchaseDetail,
} from "@/lib/purchase-data";

interface POColumn {
  key: string;
  label: string;
  banLabel?: string;
  hideForBan?: boolean;
  align?: "left" | "center" | "right";
  value: (row: PurchaseDetail) => string;
}

const money = (value: number) => rupiah.format(value);

const formatNumberInput = (val: string) => {
  const numberString = val.replace(/[^,\d]/g, "").toString();
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }
  return split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
};

const parseFormattedNumber = (val: string) => {
  return Number(val.replace(/\./g, "")) || 0;
};

const poColumns: POColumn[] = [
  { key: "bulan", label: "Bulan", value: (row) => row.bulan },
  { key: "date", label: "Date", value: (row) => row.date },
  { key: "deliverTo", label: "Deliver To", value: (row) => row.deliverTo },
  { key: "invoiceNumber", label: "Invoice Number", value: (row) => row.invoiceNumber || "-" },
  { key: "lunas", label: "Lunas", align: "center", value: (row) => row.lunas },
  { key: "kodeBarang", label: "Kode Barang", value: (row) => row.kodeBarang || "-" },
  { key: "supplier", label: "Supplier", value: (row) => row.supplier },
  { key: "merek", label: "Merek", value: (row) => row.merek },
  { key: "type", label: "Type", value: (row) => row.type },
  { key: "ring", label: "Ring", value: (row) => row.ring },
  { key: "wide", label: "Wide", banLabel: "Tapak", value: (row) => row.wide },
  { key: "hole", label: "Hole", banLabel: "Tinggi", value: (row) => row.hole },
  { key: "et", label: "ET", hideForBan: true, value: (row) => row.et },
  { key: "item", label: "Item", value: (row) => row.item },
  { key: "qty", label: "Qty", align: "right", value: (row) => String(row.qty) },
  { key: "standarPrice", label: "Standar Price", align: "right", value: (row) => money(row.standarPrice) },
  { key: "discount", label: "Discount (%)", align: "right", value: (row) => `${row.discount}%` },
  { key: "additionalDiscount", label: "Additional Disc", align: "right", value: (row) => money(row.additionalDiscount) },
  { key: "discTypeCash", label: "Disc Type/Cash (%)", align: "center", value: (row) => `${row.discTypeCash}%` },
  { key: "rawCase", label: "Total D'Price", align: "right", value: (row) => money(row.rawCase) }, 
  { key: "rawPrice", label: "Raw Price", align: "right", value: (row) => money(row.rawPrice) },
  { key: "rawPriceAfterDisc", label: "Raw Price (Disc)", align: "right", value: (row) => money(row.rawPriceAfterDisc) },
  { key: "sswDisc", label: "SSW Disc", align: "right", value: (row) => `${row.sswDisc}%` },
  { key: "shippingFee", label: "Shipping Fee", align: "right", value: (row) => money(row.shippingFee) },
  { key: "shipFeePerSet", label: "Shipfee/Set", align: "right", value: (row) => money(row.shipFeePerSet) },
  { key: "subTotal", label: "Sub Total", align: "right", value: (row) => money(row.subTotal) },
  { key: "modalPerSet", label: "Modal/Set", align: "right", value: (row) => money(row.modalPerSet) },
  { key: "paymentCash", label: "Payment Cash", align: "right", value: (row) => money(row.paymentCash) },
  { key: "up", label: "UP", align: "right", value: (row) => money(row.up) },
  { key: "modalToko", label: "Modal Toko", align: "right", value: (row) => money(row.modalToko) },
  { key: "arrivalDate", label: "Arrival Date", value: (row) => row.arrivalDate },
  { key: "stockOwner", label: "Owner", value: (row) => row.stockOwner },
  { key: "paymentDate", label: "Payment Date", value: (row) => row.paymentDate },
  { key: "nomorBon", label: "Nomor Bon", value: (row) => row.nomorBon },
  { key: "invoiceDate", label: "Invoice Date", value: (row) => row.invoiceDate },
  { key: "notes", label: "Notes", value: (row) => row.notes || "-" },
  { key: "status", label: "Status", align: "center", value: (row) => row.status },
];

interface DetailForm {
  category: string;
  selectedProductId: string;
  date: string;
  deliverTo: string;
  invoiceNumber: string;
  lunas: string;
  kodeBarang: string;
  supplier: string;
  merek: string;
  type: string;
  ring: string;
  wide: string;
  hole: string;
  et: string;
  item: string;
  qty: string;
  standarPrice: string;
  discount: string; 
  discTypeCash: string; 
  sswDisc: string;
  shippingFeePercent: string; 
  paymentCash: string;
  paymentTipe: string; 
  modalToko: string; 
  stockOwner: string; 
  arrivalDate: string;
  paymentDate: string;
  nomorBon: string;
  invoiceDate: string;
  notes: string;
  status: "Draft" | "Pending" | "Completed";
}

const emptyForm: DetailForm = {
  category: "Ban",
  selectedProductId: "",
  date: new Date().toISOString().slice(0, 10),
  deliverTo: "",
  invoiceNumber: "",
  lunas: "Lunas",
  kodeBarang: "",
  supplier: "",
  merek: "",
  type: "",
  ring: "",
  wide: "",
  hole: "",
  et: "",
  item: "Ban",
  qty: "1",
  standarPrice: "0",
  discount: "0",
  discTypeCash: "0",
  sswDisc: "2",
  shippingFeePercent: "0",
  paymentCash: "0",
  paymentTipe: "",
  modalToko: "0",
  stockOwner: "",
  arrivalDate: "",
  paymentDate: "",
  nomorBon: "",
  invoiceDate: "",
  notes: "",
  status: "Draft",
};

const inputClass = "w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
const readOnlyClass = `${inputClass} bg-muted cursor-not-allowed`;
const thClass = "whitespace-nowrap border-b border-border px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
const tdClass = "whitespace-nowrap border-b border-border/70 px-3 py-3 text-xs";

const toDisplayDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const monthOf = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { month: "long" });
};

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode; }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function PurchaseOrdersPage() {
  const {
    setProducts,
    products,
    suppliers,
    purchaseOrders: details,
    setPurchaseOrders: setDetails,
    setFinanceStores,
    storeNames,
  } = useData();

  const can = useCan();
  const [activeTab, setActiveTab] = useState<Category>("Ban");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseDetail | null>(null);
  const [form, setForm] = useState<DetailForm>(emptyForm);
  const [error, setError] = useState("");

  const update = (key: keyof DetailForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const visibleColumns = poColumns.filter(
    (column) => !(activeTab === "Ban" && column.hideForBan),
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return details.filter((row) => {
      if (row.category !== activeTab) return false;
      if (!normalized) return true;
      return [
        row.kodeBarang, row.supplier, row.merek, row.type,
        row.invoiceNumber, row.nomorBon, row.deliverTo, row.item,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [activeTab, details, query]);

  const counts = useMemo(
    () => ({
      Ban: details.filter((row) => row.category === "Ban").length,
      Others: details.filter((row) => row.category === "Others").length,
      Sorted: details.filter((row) => row.category === "Sorted").length,
    }),
    [details],
  );

  const availableProducts = useMemo(() => {
    return products.filter((p) => p.kategoriUtama === form.category);
  }, [products, form.category]);

  const handleSelectProduct = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    setForm((current) => ({
      ...current,
      selectedProductId: productId,
      supplier: p.supplier || "",
      item: p.namaBarang,
      merek: p.merekBan || p.merekProduk || "",
      type: p.typeBan || p.typeVelg || "",
      ring: p.ring || "",
      wide: p.ukuranTapak || p.wide || "",
      hole: p.ukuranTinggi || p.hole || "",
      et: p.et || "",
      standarPrice: formatNumberInput(String(p.standarPrice || 0)),
    }));
  };

  // ================= KALKULASI RUMUS =================
  const qty = Number(form.qty) || 0;
  const standarPrice = parseFormattedNumber(form.standarPrice);
  
  // KHUSUS VELG (OTHERS)
  const discountPercent = Number(form.discount) || 0;
  const discTypePercent = Number(form.discTypeCash) || 0;
  const discountAmount = standarPrice * (discountPercent / 100);
  const additionalDiscount = standarPrice + discountAmount;
  const totalDPrice = additionalDiscount * qty;
  const rawPrice = totalDPrice - (totalDPrice * (discTypePercent / 100));
  const rawPriceAfterDisc = rawPrice;
  const shippingFeePercentAmount = parseFormattedNumber(form.shippingFeePercent);
  const shippingFee = shippingFeePercentAmount * qty;
  const shipFeePerSet = qty > 0 ? Math.round(shippingFee / qty) : 0;
  const subModalPT = rawPrice + shippingFee;
  const modalPercent = qty > 0 ? subModalPT / qty : 0;
  const modalToko = parseFormattedNumber(form.modalToko);
  const up = modalPercent - modalToko;
  
  // UNTUK BAN & SORTED
  const totalHargaBanSorted = standarPrice; // Input "Harga Total"
  const hargaSatuan = qty > 0 ? totalHargaBanSorted / qty : 0; // Harga Total / Stok (Qty)

  // EXISTING KALKULASI
  const dealerPrice = Math.max(standarPrice - discountAmount, 0);
  const totalPrice = dealerPrice * qty;
  const sswDisc = Number(form.sswDisc) || 0;
  const subTotal = Math.max(totalPrice - additionalDiscount, 0) + shippingFee;
  const modalPerSet = qty > 0 ? Math.round(subTotal / qty) : 0;

  const openCreate = () => {
    setForm({
      ...emptyForm,
      category: activeTab,
      item: activeTab === "Ban" ? "Ban" : activeTab === "Others" ? "Velg" : "Parfum",
      deliverTo: storeNames[0] ?? "",
      selectedProductId: "",
      kodeBarang: "",
    });
    setError("");
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.supplier) { setError("Supplier wajib dipilih."); return; }
    if (!form.deliverTo) { setError("Deliver To wajib diisi."); return; }
    if (!form.nomorBon.trim()) { setError("Nomor Bon wajib diisi."); return; }
    if (qty <= 0) { setError("Qty/Stok wajib diisi lebih dari 0."); return; }

    const number = `PO-${form.nomorBon.trim()}`;

    const record: PurchaseDetail = {
      id: `PO-${form.nomorBon.trim()}-${Date.now()}`,
      number,
      category: form.category as Category,
      bulan: monthOf(form.date),
      date: toDisplayDate(form.date),
      deliverTo: form.deliverTo,
      invoiceNumber: form.invoiceNumber.trim(),
      lunas: form.lunas as PurchaseDetail["lunas"],
      kodeBarang: form.kodeBarang.trim(),
      supplier: form.supplier,
      merek: form.merek,
      type: form.type,
      ring: form.ring,
      wide: form.wide,
      hole: form.hole,
      et: form.et,
      item: form.item || form.category,
      qty, 
      standarPrice: form.category === "Others" ? standarPrice : totalHargaBanSorted, 
      discount: form.category === "Others" ? discountPercent : 0, 
      additionalDiscount: form.category === "Others" ? additionalDiscount : 0,
      cashbackPercent: 0, 
      dealerPrice: form.category === "Others" ? dealerPrice : totalHargaBanSorted, 
      totalPrice: form.category === "Others" ? totalPrice : totalHargaBanSorted, 
      discTypeCash: form.category === "Others" ? `${discTypePercent}` : "0", 
      rawCase: form.category === "Others" ? totalDPrice : totalHargaBanSorted, 
      sswDisc, 
      rawPrice: form.category === "Others" ? rawPrice : hargaSatuan, 
      rawPriceAfterDisc: form.category === "Others" ? rawPriceAfterDisc : hargaSatuan, 
      shippingFee: form.category === "Others" ? shippingFee : 0, 
      shipFeePerSet: form.category === "Others" ? shipFeePerSet : 0,
      subTotal: form.category === "Others" ? subTotal : totalHargaBanSorted, 
      modalPerSet: form.category === "Others" ? modalPerSet : hargaSatuan, 
      paymentCash: parseFormattedNumber(form.paymentCash),
      up: form.category === "Others" ? up : 0, 
      modalToko: form.category === "Others" ? modalToko : 0,
      arrivalDate: form.arrivalDate ? toDisplayDate(form.arrivalDate) : "-",
      stockOwner: form.stockOwner,
      paymentDate: form.paymentDate ? toDisplayDate(form.paymentDate) : "-",
      nomorBon: form.nomorBon,
      invoiceDate: form.invoiceDate ? toDisplayDate(form.invoiceDate) : toDisplayDate(form.date),
      notes: form.notes,
      status: form.status,
      received: form.status === "Completed",
    };

    setDetails((current) => [record, ...current]);
    setActiveTab(record.category);

    // Penerimaan barang/stok & finance diproses saat Selesai (Completed/received),
    // bisa dari sini atau dari halaman Receipt PO saat barang sampai.
    if (record.received) {
      setProducts((current) => applyPurchaseOrderToStock(current, record));
      setFinanceStores((current) =>
        upsertFinanceLedger(current, {
          store: record.deliverTo,
          date: record.date,
          entries: [purchaseFinanceEntry(record)],
        }),
      );
    }

    setIsOpen(false);
  };

  const completePO = (row: PurchaseDetail) => {
    if (row.received) return;
    const completed: PurchaseDetail = { ...row, status: "Completed", received: true };
    setDetails((current) => current.map((item) => (item.id === row.id ? completed : item)));
    setProducts((current) => applyPurchaseOrderToStock(current, completed));
    setFinanceStores((current) =>
      upsertFinanceLedger(current, {
        store: completed.deliverTo,
        date: completed.date,
        entries: [purchaseFinanceEntry(completed)],
      }),
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Hapus purchase order ini?")) return;
    const target = details.find((row) => row.id === id);
    if (target?.received) {
      setProducts((current) =>
        current.map((product) =>
          product.id === target.kodeBarang || product.namaBarang.toLowerCase() === target.item.toLowerCase()
            ? { ...product, stok: Math.max(0, product.stok - target.qty) }
            : product,
        ),
      );
    }
    setDetails((current) => current.filter((row) => row.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
            {(["Ban", "Others", "Sorted"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari PO..."
                className="h-10 w-56 rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-accent"
              />
            </div>
            {can("purchase-order", "input") && (
              <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90">
                <Plus className="size-4" /> Create Purchase Order
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[3800px] border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {visibleColumns.map((column) => (
                    <th key={column.key} className={`${thClass} ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}`}>
                      {activeTab === "Ban" && column.banLabel ? column.banLabel : column.label}
                    </th>
                  ))}
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Belum ada purchase order {activeTab}.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="transition hover:bg-muted/30">
                      {visibleColumns.map((column) => {
                        const value = column.value(row);
                        return (
                          <td key={column.key} className={`${tdClass} ${column.align === "right" ? "text-right font-mono tabular-nums" : column.align === "center" ? "text-center" : ""}`}>
                            {column.key === "lunas" ? (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${value === "Lunas" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{value}</span>
                            ) : column.key === "invoiceNumber" ? (
                              <span className="font-mono font-semibold">{value}</span>
                            ) : column.key === "merek" ? (
                              <span className="font-semibold">{value}</span>
                            ) : column.key === "status" ? (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${value === "Completed" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{value}</span>
                            ) : (value)}
                          </td>
                        );
                      })}
                      <td className={`${tdClass} text-center`}>
                        <div className="flex items-center justify-center gap-2">
                          {can("purchase-order", "edit") && (
                            <button type="button" onClick={() => completePO(row)} disabled={row.status === "Completed"} className="rounded-lg bg-success p-2 text-[#04150f] transition hover:bg-success/90 disabled:opacity-40" title="Complete PO">
                              <Check className="size-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => setSelected(row)} className="rounded-lg bg-muted p-2 text-muted-foreground transition hover:text-accent" title="Detail">
                            <Eye className="size-4" />
                          </button>
                          {can("purchase-order", "delete") && (
                            <button type="button" onClick={() => handleDelete(row.id)} className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700" title="Hapus">
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Create Purchase Order</h2>
                <p className="text-xs text-muted-foreground">Pilih barang dari data Distribusi, lalu lengkapi rincian PO.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* HEADER PO */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <Field label="Kategori">
                  <select
                    value={form.category}
                    onChange={(event) => {
                      const category = event.target.value;
                      setForm((current) => ({
                        ...current,
                        category,
                        selectedProductId: "",
                        item: category === "Ban" ? "Ban" : category === "Others" ? "Velg" : "Parfum",
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="Ban">Ban</option>
                    <option value="Others">Others (Velg)</option>
                    <option value="Sorted">Sorted</option>
                  </select>
                </Field>
                <Field label="Date" required>
                  <input type="date" required value={form.date} onChange={(event) => update("date", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Deliver To" required>
                  <select required value={form.deliverTo} onChange={(event) => update("deliverTo", event.target.value)} className={inputClass}>
                    <option value="">Pilih lokasi tujuan</option>
                    {storeNames.map((store) => <option key={store} value={store}>{store}</option>)}
                  </select>
                </Field>
                <Field label="Invoice Number">
                  <input value={form.invoiceNumber} onChange={(event) => update("invoiceNumber", event.target.value)} className={inputClass} placeholder="Opsional" />
                </Field>
                <Field label="Lunas">
                  <select value={form.lunas} onChange={(event) => update("lunas", event.target.value)} className={inputClass}>
                    <option value="Lunas">Lunas</option>
                    <option value="Tidak Lunas">Tidak Lunas</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(event) => update("status", event.target.value as any)} className={inputClass}>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending (barang belum sampai)</option>
                    <option value="Completed">Selesai (barang diterima)</option>
                  </select>
                </Field>
                <Field label="Nomor Bon" required>
                  <input value={form.nomorBon} onChange={(event) => update("nomorBon", event.target.value)} className={inputClass} placeholder="Wajib diisi" />
                </Field>
              </div>

              {/* DATA DARI DISTRIBUSI */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                <div className="sm:col-span-2 lg:col-span-4">
                  <h3 className="text-sm font-semibold text-accent mb-3">Pilih Barang dari Distribusi</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Item Terdaftar" required>
                      <select 
                        value={form.selectedProductId} 
                        onChange={(e) => handleSelectProduct(e.target.value)} 
                        className={inputClass}
                      >
                        <option value="">-- Pilih Barang --</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.namaBarang} ({p.id})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Kode Barang">
                      <input 
                        value={form.kodeBarang} 
                        onChange={(e) => update("kodeBarang", e.target.value)} 
                        className={inputClass} 
                        placeholder="Opsional..."
                      />
                    </Field>
                    <Field label="Item (Nama Barang)" required>
                      <select 
                        required
                        value={form.selectedProductId} 
                        onChange={(e) => handleSelectProduct(e.target.value)} 
                        className={inputClass}
                      >
                        <option value="">-- Pilih Item --</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.namaBarang}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Supplier" required>
                      <select required value={form.supplier} onChange={(event) => update("supplier", event.target.value)} className={inputClass}>
                        <option value="">Pilih supplier</option>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.name}>{supplier.name}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              {/* RINCIAN FORM (BEDA ANTARA VELG DAN BAN/SORTED) */}
              {form.category === "Others" ? (
                /* ================= FORM VELG / OTHERS ================= */
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Qty / Stok" required>
                    <input type="number" min={1} required value={form.qty} onChange={(event) => update("qty", event.target.value)} className={inputClass} />
                  </Field>
                  
                  <Field label="Standar Price (Rp)">
                    <input value={form.standarPrice} onChange={(event) => update("standarPrice", formatNumberInput(event.target.value))} className={inputClass} placeholder="1.000.000" />
                  </Field>
                  
                  <Field label="Discount (%)">
                    <input type="number" min={0} max={100} value={form.discount} onChange={(event) => update("discount", event.target.value)} className={inputClass} placeholder="0" />
                  </Field>
                  
                  <Field label="Additional Discount (Rp)">
                    <input readOnly value={formatNumberInput(String(additionalDiscount))} className={readOnlyClass} />
                  </Field>
                  
                  <Field label="Disc Type/Cash (%)">
                    <input type="number" min={0} max={100} value={form.discTypeCash} onChange={(event) => update("discTypeCash", event.target.value)} className={inputClass} />
                  </Field>
                  
                  <Field label="Total D'Price">
                    <input readOnly value={formatNumberInput(String(totalDPrice))} className={readOnlyClass} />
                  </Field>
                  
                  <Field label="Raw Price">
                    <input readOnly value={formatNumberInput(String(rawPrice))} className={readOnlyClass} />
                  </Field>
                  
                  <Field label="Raw Price (Disc)">
                    <input readOnly value={formatNumberInput(String(rawPriceAfterDisc))} className={readOnlyClass} />
                  </Field>

                  <Field label="Shipping Fee % (Rp)">
                    <input value={form.shippingFeePercent} onChange={(event) => update("shippingFeePercent", formatNumberInput(event.target.value))} className={inputClass} placeholder="0" />
                  </Field>

                  <Field label="Shipping Fee">
                    <input readOnly value={formatNumberInput(String(shippingFee))} className={readOnlyClass} />
                  </Field>

                  <Field label="Sub Modal PT">
                    <input readOnly value={formatNumberInput(String(subModalPT))} className={readOnlyClass} />
                  </Field>

                  <Field label="Modal %">
                    <input readOnly value={formatNumberInput(String(modalPercent))} className={readOnlyClass} />
                  </Field>

                  <Field label="Modal Toko">
                    <input value={form.modalToko} onChange={(event) => update("modalToko", formatNumberInput(event.target.value))} className={inputClass} />
                  </Field>

                  <Field label="UP">
                    <input readOnly value={formatNumberInput(String(up))} className={readOnlyClass} />
                  </Field>

                  <Field label="SSW Disc (%)">
                    <input type="number" min={0} max={100} value={form.sswDisc} onChange={(event) => update("sswDisc", event.target.value)} className={inputClass} />
                  </Field>
                  
                  <Field label="Payment Tipe">
                    <input value={form.paymentTipe} onChange={(event) => update("paymentTipe", event.target.value)} className={inputClass} placeholder="cth: Transfer" />
                  </Field>

                  <Field label="Payment Cash">
                    <input value={form.paymentCash} onChange={(event) => update("paymentCash", formatNumberInput(event.target.value))} className={inputClass} />
                  </Field>

                  <Field label="Owner">
                    <select value={form.stockOwner} onChange={(event) => update("stockOwner", event.target.value)} className={inputClass}>
                      <option value="">Pilih Owner</option>
                      <option value="BCA">BCA</option>
                      <option value="CV Koko Wheels">CV Koko Wheels</option>
                      <option value="Banpindo">Banpindo</option>
                    </select>
                  </Field>

                  <Field label="Payment Date">
                    <input type="date" value={form.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} className={inputClass} />
                  </Field>
                  
                  <Field label="Arrival Date">
                    <input type="date" value={form.arrivalDate} onChange={(event) => update("arrivalDate", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Invoice Date">
                    <input type="date" value={form.invoiceDate} onChange={(event) => update("invoiceDate", event.target.value)} className={inputClass} />
                  </Field>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <Field label="Notes">
                      <textarea rows={2} value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} />
                    </Field>
                  </div>
                </div>
              ) : (
                /* ================= FORM BAN / SORTED (SEDERHANA) ================= */
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Qty / Stok" required>
                    <input type="number" min={1} required value={form.qty} onChange={(event) => update("qty", event.target.value)} className={inputClass} />
                  </Field>
                  
                  <Field label="Harga Total (Rp)">
                    <input value={form.standarPrice} onChange={(event) => update("standarPrice", formatNumberInput(event.target.value))} className={inputClass} placeholder="1.000.000" />
                  </Field>
                  
                  <Field label="Harga Satuan (Otomatis)">
                    <input readOnly value={formatNumberInput(String(hargaSatuan))} className={`${readOnlyClass} font-semibold text-primary`} />
                  </Field>

                  <Field label="Owner">
                    <select value={form.stockOwner} onChange={(event) => update("stockOwner", event.target.value)} className={inputClass}>
                      <option value="">Pilih Owner</option>
                      <option value="BCA">BCA</option>
                      <option value="CV Koko Wheels">CV Koko Wheels</option>
                      <option value="Banpindo">Banpindo</option>
                    </select>
                  </Field>

                  <Field label="Payment Date">
                    <input type="date" value={form.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} className={inputClass} />
                  </Field>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <Field label="Notes">
                      <textarea rows={2} value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} />
                    </Field>
                  </div>
                </div>
              )}

              {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Batal</button>
                <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Simpan Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Detail Purchase Order</h2>
                <p className="text-xs text-muted-foreground">{selected.invoiceNumber || "-"} - {selected.deliverTo}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {poColumns.map((column) => (
                <div key={column.key} className="rounded-xl border border-border bg-background/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {selected.category === "Ban" && column.banLabel ? column.banLabel : column.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{column.value(selected)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
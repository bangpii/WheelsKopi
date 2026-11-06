"use client";

import { useState } from "react";
import { CircleDollarSign, Plus, Repeat2, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { stores } from "@/lib/master-data";
import { tradeIns as demoTradeIns, type TradeInRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const emptyForm = {
  store: stores[0].storeName,
  date: "2026-10-30",
  bonNumber: "",
  product: "",
  price: 0,
  notes: "",
};

export default function TradeSelloutPage() {
  const [rows, setRows] = useState<TradeInRecord[]>(demoTradeIns);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isOpen, setIsOpen] = useState(false);

  const keyword = search.trim().toLowerCase();

  const filtered = rows.filter(
    (row) =>
      keyword.length === 0 ||
      row.product.toLowerCase().includes(keyword) ||
      row.bonNumber.toLowerCase().includes(keyword) ||
      row.notes.toLowerCase().includes(keyword),
  );

  const total = filtered.reduce((sum, row) => sum + row.price, 0);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setRows([
      {
        id: `TT-${Date.now()}`,
        ...form,
        status: "Sold",
      },
      ...rows,
    ]);
    setForm({ ...emptyForm });
    setIsOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Report</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Report Trade Sellout</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Penjualan velg tukar tambah lengkap dengan nomor bon dan catatan velg baru pasangannya.
            </p>
          </div>
          <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" />
            Create Trade Sellout
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Repeat2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Unit Tukar Tambah</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{filtered.length} unit</p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Nilai Penjualan</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{rupiah.format(total)}</p>
            </div>
          </div>
        </div>

        <div className="surface flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">Catatan otomatis tampil bersama deskripsi velg saat dijual kembali.</p>
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari bon, velg, atau catatan..." className={`${fieldClass} pl-9`} />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Nomor Bon</th>
                  <th className={thClass}>Velg Second</th>
                  <th className={`${thClass} text-right`}>Price</th>
                  <th className={thClass}>Notes</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <td className={`${tdClass} font-medium`}>{row.store}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.date}</td>
                    <td className={`${tdClass} font-mono`}>{row.bonNumber}</td>
                    <td className={tdClass}>{row.product}</td>
                    <td className={`${tdClass} text-right font-mono font-semibold tabular-nums`}>{rupiah.format(row.price)}</td>
                    <td className={`${tdClass} max-w-80 whitespace-normal text-xs text-muted-foreground`}>{row.notes}</td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          row.status === "Sold" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <button type="button" onClick={() => setRows(rows.filter((entry) => entry.id !== row.id))} className="rounded-lg bg-danger-soft p-2 text-danger hover:bg-danger/20" title="Hapus">
                        <Trash2 className="size-4" />
                      </button>
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
              <h2 className="font-display text-lg font-semibold">Create Trade Sellout</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Store</span>
                  <select value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })} className={fieldClass}>
                    {stores.map((store) => (
                      <option key={store.id}>{store.storeName}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Date</span>
                  <input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Nomor Bon</span>
                  <input required value={form.bonNumber} onChange={(event) => setForm({ ...form, bonNumber: event.target.value })} className={fieldClass} placeholder="BON-TT-004" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Price</span>
                  <input type="number" min={0} required value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Velg Second</span>
                  <input required value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} className={fieldClass} placeholder="Velg HSR Ring 17 Second" />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Notes</span>
                  <textarea required rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={fieldClass} placeholder="Tukar tambah dengan velg baru..." />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

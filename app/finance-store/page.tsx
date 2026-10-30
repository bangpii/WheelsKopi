"use client";

import { useState } from "react";
import { Building2, Pencil, Plus, Printer, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { stores } from "@/lib/master-data";
import { financeStores as demoFinance, type FinanceStoreRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const emptyForm = {
  number: "",
  date: "2026-10-30",
  store: stores[0].storeName,
  totalSales: 0,
  totalDaily: 0,
};

export default function FinanceStorePage() {
  const [finance, setFinance] = useState<FinanceStoreRecord[]>(demoFinance);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<FinanceStoreRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const totalSales = finance.reduce((sum, row) => sum + row.totalSales, 0);
  const totalNet = finance.reduce((sum, row) => sum + row.totalDaily, 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, number: `KKW-${String(finance.length + 1).padStart(6, "0")}` });
    setIsOpen(true);
  };

  const openEdit = (row: FinanceStoreRecord) => {
    setEditing(row);
    setForm({
      number: row.number,
      date: row.date,
      store: row.store,
      totalSales: row.totalSales,
      totalDaily: row.totalDaily,
    });
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (editing) {
      setFinance(finance.map((row) => (row.id === editing.id ? { ...row, ...form } : row)));
    } else {
      setFinance([
        {
          id: `FS-${Date.now()}`,
          ...form,
          status: "Draft",
          createdAt: new Date().toLocaleDateString("id-ID"),
        },
        ...finance,
      ]);
    }

    setIsOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Finance Store</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Rekap pemasukan dan pengeluaran harian tiap toko. Total daily adalah pendapatan bersih setelah daily spend.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" />
            Create Finance Store
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Total Sales</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{rupiah.format(totalSales)}</p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Total Daily Bersih</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{rupiah.format(totalNet)}</p>
            </div>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Store</th>
                  <th className={`${thClass} text-right`}>Total Sales</th>
                  <th className={`${thClass} text-right`}>Total Daily</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Created At</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {finance.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <td className={`${tdClass} font-mono font-medium`}>{row.number}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.date}</td>
                    <td className={`${tdClass} font-medium`}>{row.store}</td>
                    <td className={`${tdClass} text-right font-mono tabular-nums`}>{rupiah.format(row.totalSales)}</td>
                    <td className={`${tdClass} text-right font-mono font-semibold text-success tabular-nums`}>{rupiah.format(row.totalDaily)}</td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          row.status === "Completed" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.createdAt}</td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => openEdit(row)} className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20" title="Edit sisa setoran">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground" title="Print">
                          <Printer className="size-4" />
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
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Finance Store" : "Create Finance Store"}</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number</span>
                  <input required value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Date</span>
                  <input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Store</span>
                  <select value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })} className={fieldClass}>
                    {stores.map((store) => (
                      <option key={store.id}>{store.storeName}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Total Sales</span>
                  <input type="number" min={0} required value={form.totalSales} onChange={(event) => setForm({ ...form, totalSales: Number(event.target.value) })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Total Daily Bersih</span>
                  <input type="number" min={0} required value={form.totalDaily} onChange={(event) => setForm({ ...form, totalDaily: Number(event.target.value) })} className={fieldClass} />
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

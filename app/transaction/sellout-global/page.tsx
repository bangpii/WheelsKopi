"use client";

import { useState } from "react";
import { Globe2, Pencil, Plus, Printer, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { selloutGlobals as demoGlobals, type SelloutGlobalRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const emptyForm = {
  number: "",
  date: "2026-10-30",
  store: "KKW",
  customer: "",
  discount: 0,
  grandTotal: 0,
};

export default function SelloutGlobalPage() {
  const [rows, setRows] = useState<SelloutGlobalRecord[]>(demoGlobals);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<SelloutGlobalRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, number: `SO-${String(rows.length + 2601).padStart(4, "0")}` });
    setIsOpen(true);
  };

  const openEdit = (row: SelloutGlobalRecord) => {
    setEditing(row);
    setForm({
      number: row.number,
      date: row.date,
      store: row.store,
      customer: row.customer,
      discount: row.discount,
      grandTotal: row.grandTotal,
    });
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (editing) {
      setRows(
        rows.map((row) =>
          row.id === editing.id
            ? { ...row, ...form, status: "Sold", history: [...row.history, `Diedit pada ${new Date().toLocaleDateString("id-ID")}`] }
            : row,
        ),
      );
    } else {
      setRows([
        {
          id: `SG-${Date.now()}`,
          ...form,
          status: "Sold",
          history: [`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`],
        },
        ...rows,
      ]);
    }

    setIsOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction Global</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Sellout Global</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Revisi transaksi sellout yang gagal atau berubah metode pembayaran pada hari yang sama.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" />
            Create Sellout
          </button>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Customer</th>
                  <th className={`${thClass} text-right`}>Discount</th>
                  <th className={`${thClass} text-right`}>Grand Total</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <Globe2 className="size-4" />
                        </span>
                        <span className="font-mono font-semibold">{row.number}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.date}</td>
                    <td className={`${tdClass} font-medium`}>{row.store}</td>
                    <td className={tdClass}>{row.customer}</td>
                    <td className={`${tdClass} text-right font-mono text-danger tabular-nums`}>
                      {row.discount > 0 ? `- ${rupiah.format(row.discount)}` : "-"}
                    </td>
                    <td className={`${tdClass} text-right font-mono font-semibold tabular-nums`}>{rupiah.format(row.grandTotal)}</td>
                    <td className={tdClass}>
                      <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold text-success">{row.status}</span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => openEdit(row)} className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20" title="Edit">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground" title="Print summary">
                          <Printer className="size-4" />
                        </button>
                        <button type="button" onClick={() => setRows(rows.filter((entry) => entry.id !== row.id))} className="rounded-lg bg-danger-soft p-2 text-danger hover:bg-danger/20" title="Hapus">
                          <Trash2 className="size-4" />
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
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Sellout Global" : "Create Sellout Global"}</h2>
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
                  <input required value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Customer</span>
                  <input required value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Discount</span>
                  <input type="number" min={0} value={form.discount} onChange={(event) => setForm({ ...form, discount: Number(event.target.value) })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Grand Total</span>
                  <input type="number" min={0} required value={form.grandTotal} onChange={(event) => setForm({ ...form, grandTotal: Number(event.target.value) })} className={fieldClass} />
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

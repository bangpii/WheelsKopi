"use client";

import { useState } from "react";
import { Pencil, Trash2, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { stores } from "@/lib/master-data";
import { dailySpends as demoSpends, type DailySpendRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

export default function DailySpendGlobalPage() {
  const [rows, setRows] = useState<DailySpendRecord[]>(demoSpends);
  const [editing, setEditing] = useState<DailySpendRecord | null>(null);
  const [form, setForm] = useState({ number: "", date: "", store: "", total: 0 });

  const openEdit = (row: DailySpendRecord) => {
    setEditing(row);
    setForm({ number: row.number, date: row.date, store: row.store, total: row.total });
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (!editing) {
      return;
    }

    setRows(
      rows.map((row) =>
        row.id === editing.id
          ? { ...row, ...form, history: [...row.history, `Direvisi pada ${new Date().toLocaleDateString("id-ID")}`] }
          : row,
      ),
    );
    setEditing(null);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction Global</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Daily Spend Global</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Revisi data daily spend yang sudah tercatat. Nomor daily boleh dikosongkan pada revisi.
          </p>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number Daily</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Store</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-warning-soft text-warning">
                          <Wallet className="size-4" />
                        </span>
                        <span className="font-mono font-medium">{row.number || "-"}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.date}</td>
                    <td className={`${tdClass} font-medium`}>{row.store}</td>
                    <td className={`${tdClass} text-right font-mono font-semibold tabular-nums`}>{rupiah.format(row.total)}</td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          row.status === "Approved" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => openEdit(row)} className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20" title="Revisi">
                          <Pencil className="size-4" />
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Revisi Daily Spend</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number Daily (opsional)</span>
                  <input value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} className={fieldClass} />
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
                  <span className="font-medium">Total</span>
                  <input type="number" min={0} required value={form.total} onChange={(event) => setForm({ ...form, total: Number(event.target.value) })} className={fieldClass} />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Simpan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Receipt, Trash2, Upload, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { stores } from "@/lib/master-data";
import { dailySpends as demoSpends, type DailySpendRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const emptyForm = {
  number: "",
  date: "2026-10-30",
  store: stores[0].storeName,
  total: 0,
  proof: "",
};

export default function DailySpendPage() {
  const [spends, setSpends] = useState<DailySpendRecord[]>(demoSpends);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<DailySpendRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const totalSpend = spends.reduce((sum, spend) => sum + spend.total, 0);
  const approved = spends.filter((spend) => spend.status === "Approved").length;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, number: `DS-${String(spends.length + 1).padStart(4, "0")}` });
    setIsOpen(true);
  };

  const openEdit = (spend: DailySpendRecord) => {
    setEditing(spend);
    setForm({
      number: spend.number,
      date: spend.date,
      store: spend.store,
      total: spend.total,
      proof: spend.proof,
    });
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (editing) {
      setSpends(
        spends.map((spend) =>
          spend.id === editing.id
            ? {
                ...spend,
                ...form,
                history: [...spend.history, `Diedit pada ${new Date().toLocaleDateString("id-ID")}`],
              }
            : spend,
        ),
      );
    } else {
      setSpends([
        {
          id: `DS-${Date.now()}`,
          ...form,
          status: "Draft",
          createdAt: new Date().toLocaleDateString("id-ID"),
          history: [`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`],
        },
        ...spends,
      ]);
    }

    setIsOpen(false);
  };

  const toggleStatus = (spend: DailySpendRecord) => {
    setSpends(
      spends.map((entry) =>
        entry.id === spend.id
          ? { ...entry, status: entry.status === "Approved" ? "Draft" : "Approved" }
          : entry,
      ),
    );
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Transaction</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Daily Spend</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Catat setiap pengeluaran harian toko beserta bukti nota. Setiap daily spend harus disetujui finance.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Total Pengeluaran</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{rupiah.format(totalSpend)}</p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Disetujui</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{approved} dari {spends.length}</p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Receipt className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Menunggu</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{spends.length - approved} nota</p>
            </div>
          </div>
        </div>

        <div className="surface flex items-center justify-between p-4">
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" />
            Create Daily Spend
          </button>
          <p className="text-xs text-muted-foreground">Bukti nota wajib dilampirkan sebelum approval.</p>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Number Daily</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Store</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Bukti</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Created At</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {spends.map((spend) => (
                  <tr key={spend.id} className="transition-colors hover:bg-muted/40">
                    <td className={`${tdClass} font-mono font-medium`}>{spend.number}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{spend.date}</td>
                    <td className={`${tdClass} font-medium`}>{spend.store}</td>
                    <td className={`${tdClass} text-right font-mono font-semibold tabular-nums`}>{rupiah.format(spend.total)}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{spend.proof || "-"}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => toggleStatus(spend)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          spend.status === "Approved" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                        }`}
                      >
                        {spend.status}
                      </button>
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{spend.createdAt}</td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => openEdit(spend)} className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20" title="Edit">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" onClick={() => setSpends(spends.filter((entry) => entry.id !== spend.id))} className="rounded-lg bg-danger-soft p-2 text-danger hover:bg-danger/20" title="Hapus">
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
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Daily Spend" : "Create Daily Spend"}</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Number Daily</span>
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
                  <span className="font-medium">Total</span>
                  <input type="number" min={0} required value={form.total} onChange={(event) => setForm({ ...form, total: Number(event.target.value) })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Bukti Nota</span>
                  <span className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/70 px-3 py-2.5 text-sm text-muted-foreground">
                    <Upload className="size-4" />
                    {form.proof || "Pilih file bukti (demo)"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          setForm({ ...form, proof: file.name });
                        }
                      }}
                    />
                  </span>
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

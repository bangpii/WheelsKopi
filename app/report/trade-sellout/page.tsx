"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { useData } from "@/lib/context/data-context";
import { storeNames } from "@/lib/master-data";
import {
  displayDate,
  todayInputDate,
  type TradeRecord,
} from "@/lib/transaction-data";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

interface TradeForm {
  store: string;
  date: string;
  bonNumber: string;
  product: string;
  price: string;
  notes: string;
  status: "Available" | "Sold";
}

const emptyForm: TradeForm = {
  store: storeNames[0],
  date: "",
  bonNumber: "",
  product: "",
  price: "0",
  notes: "",
  status: "Available",
};

export default function TradeSelloutPage() {
  const { trades: records, setTrades: setRecords } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TradeForm>(emptyForm);
  const [error, setError] = useState("");


  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.bonNumber.trim() || !form.product.trim()) {
      setError("Nomor bon dan produk wajib diisi.");
      return;
    }

    const record: TradeRecord = {
      id: `TT-${records.length + 1}-${form.bonNumber}`,
      store: form.store,
      date: displayDate(form.date),
      bonNumber: form.bonNumber.trim(),
      product: form.product.trim(),
      price: Number(form.price) || 0,
      notes: form.notes,
      status: form.status,
    };

    const next = [record, ...records];
    setRecords(next);
    setIsOpen(false);
  };

  const toggleStatus = (id: string) => {
    const next = records.map((row) =>
      row.id === id
        ? {
            ...row,
            status: row.status === "Sold" ? ("Available" as const) : ("Sold" as const),
          }
        : row,
    );
    setRecords(next);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Report
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Trade Sellout
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Barang tukar-tambah dari sales invoice. Jika barang TT kembali
              terjual, qty/status barang akan berkurang dan masuk pembukuan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ ...emptyForm, date: todayInputDate() });
              setError("");
              setIsOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            Tambah Trade
          </button>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Bon Number</th>
                  <th className={thClass}>Product</th>
                  <th className={`${thClass} text-right`}>Price</th>
                  <th className={thClass}>Notes</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada barang trade sellout.
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={tdClass}>{row.store}</td>
                      <td className={tdClass}>{row.date}</td>
                      <td className={`${tdClass} font-mono font-semibold`}>
                        {row.bonNumber}
                      </td>
                      <td className={`${tdClass} font-medium`}>{row.product}</td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.price)}
                      </td>
                      <td className={`${tdClass} max-w-[260px] truncate`}>
                        {row.notes || "-"}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            row.status === "Sold"
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(row.id)}
                          className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          {row.status === "Sold" ? "Set Available" : "Set Sold"}
                        </button>
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Tambah Trade Sellout
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-danger"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Store</span>
                  <select
                    value={form.store}
                    onChange={(event) =>
                      setForm({ ...form, store: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((store) => (
                      <option key={store}>{store}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Date</span>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Bon Number</span>
                  <input
                    required
                    value={form.bonNumber}
                    onChange={(event) =>
                      setForm({ ...form, bonNumber: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Price</span>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Product</span>
                  <input
                    required
                    value={form.product}
                    onChange={(event) =>
                      setForm({ ...form, product: event.target.value })
                    }
                    placeholder="Velg second / barang TT"
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Notes</span>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                    className={`${fieldClass} resize-none`}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as TradeForm["status"],
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </label>
              </div>

              {error && (
                <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
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

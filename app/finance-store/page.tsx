"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Eye,
  Lock,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import {
  LEDGER_TYPE_LABEL,
  createLedgerEntry,
  ledgerFromRecord,
  ledgerTotals,
} from "@/lib/finance-store";
import { storeNames } from "@/lib/master-data";
import {
  FINANCE_STORE_STORAGE_KEY,
  displayDate,
  type FinanceLedgerEntry,
  type FinanceLedgerType,
  type FinanceStoreDayRecord,
} from "@/lib/transaction-data";
import { useLocalList } from "@/lib/use-local-list";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

interface LedgerFormEntry {
  id: string;
  type: FinanceLedgerType;
  ref: string;
  description: string;
  amount: string;
  source: string;
}

interface FinanceForm {
  store: string;
  date: string;
  ledger: LedgerFormEntry[];
}

const emptyForm = (): FinanceForm => ({
  store: storeNames[0],
  date: "2026-11-09",
  ledger: [
    {
      ...createLedgerEntry("payment"),
      amount: "0",
    },
  ],
});

function formAmount(entry: LedgerFormEntry) {
  return Number(entry.amount) || 0;
}

function formToLedger(entries: LedgerFormEntry[]): FinanceLedgerEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    ref: entry.ref.trim(),
    description:
      entry.description.trim() || LEDGER_TYPE_LABEL[entry.type],
    amount: formAmount(entry),
    source: entry.source.trim(),
  }));
}

const ledgerTypes = Object.keys(LEDGER_TYPE_LABEL) as FinanceLedgerType[];

export default function FinanceStorePage() {
  const { items: records, update } = useLocalList<FinanceStoreDayRecord>(
    FINANCE_STORE_STORAGE_KEY,
  );
  const [store, setStore] = useState("Semua Store");
  const [date, setDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceStoreDayRecord | null>(null);
  const [detail, setDetail] = useState<FinanceStoreDayRecord | null>(null);
  const [form, setForm] = useState<FinanceForm>({
    store: storeNames[0],
    date: "2026-11-09",
    ledger: [],
  });
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return records.filter((row) => {
      const matchStore = store === "Semua Store" || row.store === store;
      const matchDate = !date || row.date === displayDate(date);
      return matchStore && matchDate;
    });
  }, [records, store, date]);

  const totals = filtered.reduce(
    (acc, row) => {
      const rowTotals = ledgerTotals(ledgerFromRecord(row));
      return {
        payments: acc.payments + rowTotals.payments,
        purchases: acc.purchases + rowTotals.purchases,
        sales: acc.sales + rowTotals.sales,
        spends: acc.spends + rowTotals.spends,
        adjustments: acc.adjustments + rowTotals.adjustments,
        remainder: acc.remainder + rowTotals.remainder,
      };
    },
    {
      payments: 0,
      purchases: 0,
      sales: 0,
      spends: 0,
      adjustments: 0,
      remainder: 0,
    },
  );

  const formTotals = ledgerTotals(
    form.ledger.map((entry) => ({
      ...entry,
      amount: formAmount(entry),
    })),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setIsOpen(true);
  };

  const openEdit = (row: FinanceStoreDayRecord) => {
    if (row.status === "Closed") return;

    setEditing(row);
    setForm({
      store: row.store,
      date: row.date,
      ledger: ledgerFromRecord(row).map((entry) => ({
        ...entry,
        amount: String(entry.amount),
      })),
    });
    setError("");
    setIsOpen(true);
  };

  const updateLedgerEntry = (
    id: string,
    patch: Partial<Omit<LedgerFormEntry, "id">>,
  ) => {
    setForm((current) => ({
      ...current,
      ledger: current.ledger.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  };

  const addLedgerEntry = () => {
    setForm((current) => ({
      ...current,
      ledger: [
        ...current.ledger,
        { ...createLedgerEntry("payment"), amount: "0" },
      ],
    }));
  };

  const removeLedgerEntry = (id: string) => {
    setForm((current) => ({
      ...current,
      ledger: current.ledger.filter((entry) => entry.id !== id),
    }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.store.trim()) {
      setError("Store wajib dipilih.");
      return;
    }

    if (form.ledger.length === 0) {
      setError("Tambahkan minimal satu rincian transaksi.");
      return;
    }

    for (let index = 0; index < form.ledger.length; index += 1) {
      const entry = form.ledger[index];
      const amount = formAmount(entry);

      if (!amount) {
        setError(`Nominal rincian ${index + 1} wajib diisi.`);
        return;
      }

      if (entry.type !== "adjustment" && amount < 0) {
        setError(`Nominal rincian ${index + 1} tidak boleh negatif.`);
        return;
      }
    }

    const ledger = formToLedger(form.ledger);
    const recordTotals = ledgerTotals(ledger);
    const details = ledger
      .map((entry) => entry.description)
      .filter(Boolean)
      .join("; ");

    const record: FinanceStoreDayRecord = {
      id: editing?.id ?? `FS-${Date.now()}-${form.store}`,
      store: form.store,
      date: displayDate(form.date),
      payments: recordTotals.payments,
      purchases: recordTotals.purchases,
      sales: recordTotals.sales,
      spends: recordTotals.spends,
      remainder: recordTotals.remainder,
      details,
      ledger,
      status: editing?.status ?? "Open",
      createdAt: editing?.createdAt ?? new Date().toLocaleDateString("id-ID"),
    };

    update(
      editing
        ? records.map((row) => (row.id === editing.id ? record : row))
        : [record, ...records],
    );
    setIsOpen(false);
  };

  const closeDay = (row: FinanceStoreDayRecord) => {
    if (row.status === "Closed") return;

    const ledger = ledgerFromRecord(row);
    const recordTotals = ledgerTotals(ledger);
    const closedAt = new Date().toLocaleString("id-ID");
    const closedBy = "Kepala Toko";
    const closedRecord: FinanceStoreDayRecord = {
      ...row,
      ...recordTotals,
      ledger,
      status: "Closed",
      closedAt,
      closedBy,
      snapshot: {
        ...recordTotals,
        ledger,
        closedAt,
        closedBy,
      },
    };

    update(
      records.map((item) => (item.id === row.id ? closedRecord : item)),
    );

    if (detail?.id === row.id) setDetail(closedRecord);
  };

  const detailLedger = detail ? ledgerFromRecord(detail) : [];

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Transaction
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Finance Store
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pilih toko dan tanggal untuk melihat payment diterima, purchase,
              sales, spend, dan remainder (sisa uang toko). Rincian transaksi
              disimpan sebagai ledger, lalu dikunci saat hari ditutup.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            Create Finance Store
          </button>
        </header>

        <div className="surface flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={store}
              onChange={(event) => setStore(event.target.value)}
              className={fieldClass}
            >
              <option>Semua Store</option>
              {storeNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                Reset tanggal
              </button>
            )}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {filtered.length} hari • sisa {rupiah.format(totals.remainder)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Payment",
              value: totals.payments,
              icon: Wallet,
              tone: "primary",
            },
            {
              label: "Purchase",
              value: totals.purchases,
              icon: Building2,
              tone: "warning",
            },
            {
              label: "Sales",
              value: totals.sales,
              icon: Building2,
              tone: "success",
            },
            {
              label: "Spend",
              value: totals.spends,
              icon: Wallet,
              tone: "danger",
            },
            {
              label: "Remainder",
              value: totals.remainder,
              icon: Wallet,
              tone: "primary",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="surface flex items-center gap-4 p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="font-display mt-1 text-lg font-semibold tabular-nums">
                    {rupiah.format(card.value)}
                  </p>
                  {card.label === "Remainder" && totals.adjustments !== 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      termasuk penyesuaian{" "}
                      {rupiah.format(totals.adjustments)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Date</th>
                  <th className={`${thClass} text-right`}>Payment</th>
                  <th className={`${thClass} text-right`}>Purchase</th>
                  <th className={`${thClass} text-right`}>Sales</th>
                  <th className={`${thClass} text-right`}>Spend</th>
                  <th className={`${thClass} text-right`}>Remainder</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data finance store.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-medium`}>{row.store}</td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.payments)}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.purchases)}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.sales)}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.spends)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold`}
                      >
                        {rupiah.format(row.remainder)}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            row.status === "Closed"
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <div className="flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetail(row)}
                            className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground"
                            title="Detail transaksi"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            disabled={row.status === "Closed"}
                            className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20 disabled:opacity-40"
                            title={
                              row.status === "Closed"
                                ? "Transaksi sudah ditutup"
                                : "Edit"
                            }
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => closeDay(row)}
                            disabled={row.status === "Closed"}
                            className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                            title="Close transaksi"
                          >
                            <Lock className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground"
                            title="Print"
                          >
                            <Printer className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="hidden border-t border-border p-8 print:block">
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-semibold">Finance Store - {store}</p>
                <p className="text-muted-foreground">
                  {date || "Semua tanggal"}
                </p>
              </div>
              <div className="text-right">
                <p>TTD Kepala Toko</p>
                <div className="mt-12 border-t border-foreground/40 pt-2">
                  ____________________
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {editing ? "Edit Finance Store" : "Create Finance Store"}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Store</span>
                  <select
                    value={form.store}
                    onChange={(event) =>
                      setForm({ ...form, store: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((name) => (
                      <option key={name}>{name}</option>
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Rincian Transaksi</p>
                    <p className="text-xs text-muted-foreground">
                      Total payment, purchase, sales, spend, dan remainder
                      dihitung otomatis dari ledger.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addLedgerEntry}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                  >
                    <Plus className="size-3.5" />
                    Tambah Baris
                  </button>
                </div>

                {form.ledger.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border bg-background/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Baris {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLedgerEntry(entry.id)}
                        disabled={form.ledger.length === 1}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger disabled:opacity-30"
                        title="Hapus baris"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span className="font-medium">Jenis</span>
                        <select
                          value={entry.type}
                          onChange={(event) =>
                            updateLedgerEntry(entry.id, {
                              type: event.target.value as FinanceLedgerType,
                            })
                          }
                          className={fieldClass}
                        >
                          {ledgerTypes.map((type) => (
                            <option key={type} value={type}>
                              {LEDGER_TYPE_LABEL[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="font-medium">
                          Nominal (Rp)
                          {entry.type === "adjustment" && " +/-"}
                        </span>
                        <input
                          type="number"
                          value={entry.amount}
                          onChange={(event) =>
                            updateLedgerEntry(entry.id, {
                              amount: event.target.value,
                            })
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="font-medium">Ref</span>
                        <input
                          value={entry.ref}
                          onChange={(event) =>
                            updateLedgerEntry(entry.id, {
                              ref: event.target.value,
                            })
                          }
                          placeholder="No. invoice / bon"
                          className={fieldClass}
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span className="font-medium">Source</span>
                        <input
                          value={entry.source}
                          onChange={(event) =>
                            updateLedgerEntry(entry.id, {
                              source: event.target.value,
                            })
                          }
                          placeholder="Kasir / transfer / manual"
                          className={fieldClass}
                        />
                      </label>
                      <label className="space-y-1 text-xs sm:col-span-2">
                        <span className="font-medium">Description</span>
                        <input
                          value={entry.description}
                          onChange={(event) =>
                            updateLedgerEntry(entry.id, {
                              description: event.target.value,
                            })
                          }
                          placeholder="Keterangan transaksi"
                          className={fieldClass}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs sm:grid-cols-5">
                {[
                  ["Payment", formTotals.payments],
                  ["Purchase", formTotals.purchases],
                  ["Sales", formTotals.sales],
                  ["Spend", formTotals.spends],
                  ["Remainder", formTotals.remainder],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-mono font-semibold">
                      {rupiah.format(Number(value))}
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Detail Finance Store
              </h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-muted-foreground hover:text-danger"
              >
                <X className="size-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["Store", detail.store],
                ["Date", detail.date],
                ["Payment", rupiah.format(detail.payments)],
                ["Purchase", rupiah.format(detail.purchases)],
                ["Sales", rupiah.format(detail.sales)],
                ["Spend", rupiah.format(detail.spends)],
                ["Remainder", rupiah.format(detail.remainder)],
                ["Status", detail.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-border/60 pb-2"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Ledger</p>
              <div className="max-h-64 overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Jenis</th>
                      <th className="px-3 py-2">Ref / Source</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {detailLedger.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2">
                          {LEDGER_TYPE_LABEL[entry.type]}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {entry.ref || "-"}
                          {entry.source ? ` · ${entry.source}` : ""}
                        </td>
                        <td className="px-3 py-2">{entry.description}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {rupiah.format(entry.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detail.status === "Closed" && (
              <div className="mt-4 rounded-xl bg-success-soft p-3 text-xs text-success">
                <p className="font-semibold">Transaksi sudah ditutup</p>
                <p>
                  {detail.closedAt || "-"} oleh {detail.closedBy || "-"}. Data
                  terkunci dan tidak bisa diedit.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

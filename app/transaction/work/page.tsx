"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import {
  SELLOUT_STORAGE_KEY,
  type SelloutRecord,
} from "@/lib/transaction-data";
import { useLocalList } from "@/lib/use-local-list";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

export default function WorkPage() {
  const { items: records, update: setRecords } = useLocalList<SelloutRecord>(SELLOUT_STORAGE_KEY);
  const [tab, setTab] = useState<"Menunggu Approval" | "Siap Invoice">(
    "Menunggu Approval",
  );


  const filtered = useMemo(
    () => records.filter((row) => row.status === tab),
    [records, tab],
  );

  const approve = (id: string) => {
    const next = records.map((row) =>
      row.id === id ? { ...row, status: "Siap Invoice" as const } : row,
    );
    setRecords(next);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Transaction
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Halaman Kerja
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kepala toko mengecek barang yang akan dibuat bon. Setelah disetujui,
            sellout siap diproses menjadi invoice.
          </p>
        </header>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
          {(["Menunggu Approval", "Siap Invoice"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === item
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item} (
              {records.filter((row) => row.status === item).length})
            </button>
          ))}
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Nomor</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Mobil</th>
                  <th className={thClass}>License Plat</th>
                  <th className={thClass}>Produk</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada sellout dengan status {tab}.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-mono font-semibold`}>
                        {row.number}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={`${tdClass} font-medium`}>{row.customer}</td>
                      <td className={tdClass}>{row.store}</td>
                      <td className={tdClass}>{row.car}</td>
                      <td className={`${tdClass} font-mono`}>
                        {row.licensePlate}
                      </td>
                      <td className={tdClass}>
                        {row.items
                          .map((item) => `${item.name} x${item.qty}`)
                          .join(", ")}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {rupiah.format(row.total)}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            row.status === "Siap Invoice"
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {row.status === "Menunggu Approval" ? (
                          <button
                            type="button"
                            onClick={() => approve(row.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <ClipboardCheck className="size-3.5" />
                            Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { stockMovements } from "@/lib/operations-data";

type MovementFilter = "Semua" | "Masuk" | "Keluar" | "Penyesuaian";

const filters: MovementFilter[] = ["Semua", "Masuk", "Keluar", "Penyesuaian"];

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const typeStyles = {
  Masuk: "bg-success-soft text-success",
  Keluar: "bg-danger-soft text-danger",
  Penyesuaian: "bg-warning-soft text-warning",
} satisfies Record<"Masuk" | "Keluar" | "Penyesuaian", string>;

const typeIcons = {
  Masuk: ArrowDownLeft,
  Keluar: ArrowUpRight,
  Penyesuaian: SlidersHorizontal,
} as const;

export default function MovementPage() {
  const [filter, setFilter] = useState<MovementFilter>("Semua");
  const [search, setSearch] = useState("");

  const keyword = search.trim().toLowerCase();

  const filtered = stockMovements.filter((movement) => {
    const matchesFilter = filter === "Semua" || movement.type === filter;

    const matchesKeyword =
      keyword.length === 0 ||
      movement.product.toLowerCase().includes(keyword) ||
      movement.sku.toLowerCase().includes(keyword) ||
      movement.reference.toLowerCase().includes(keyword);

    return matchesFilter && matchesKeyword;
  });

  const totalIn = stockMovements
    .filter((movement) => movement.type === "Masuk")
    .reduce((sum, movement) => sum + movement.qty, 0);

  const totalOut = stockMovements
    .filter((movement) => movement.type === "Keluar")
    .reduce((sum, movement) => sum + movement.qty, 0);

  const totalAdjust = stockMovements
    .filter((movement) => movement.type === "Penyesuaian")
    .reduce((sum, movement) => sum + movement.qty, 0);

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Transaction
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Stock Movement
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Jejak keluar-masuk stok per produk, lengkap dengan referensi
            dokumen, stok sebelum dan sesudah.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <ArrowDownLeft className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Stok Masuk
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                +{totalIn} unit
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <ArrowUpRight className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Stok Keluar
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                -{totalOut} unit
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <SlidersHorizontal className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Penyesuaian
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {totalAdjust > 0 ? "+" : ""}
                {totalAdjust} unit
              </p>
            </div>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari produk, SKU, atau referensi..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                    filter === option
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                <ArrowLeftRight className="size-3" />
                {filtered.length} mutasi
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Produk</th>
                  <th className={thClass}>Tipe</th>
                  <th className={`${thClass} text-center`}>Qty</th>
                  <th className={`${thClass} text-center`}>Sebelum</th>
                  <th className={`${thClass} text-center`}>Sesudah</th>
                  <th className={thClass}>Referensi</th>
                  <th className={thClass}>User</th>
                  <th className={thClass}>Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada mutasi stok yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((movement) => {
                    const Icon = typeIcons[movement.type];

                    return (
                      <tr
                        key={movement.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className={`${tdClass} text-muted-foreground`}>
                          {movement.date}
                        </td>
                        <td className={tdClass}>
                          <p className="font-medium">{movement.product}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {movement.sku}
                          </p>
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${typeStyles[movement.type]}`}
                          >
                            <Icon className="size-3" />
                            {movement.type}
                          </span>
                        </td>
                        <td
                          className={`${tdClass} text-center font-mono font-semibold tabular-nums ${
                            movement.qty >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {movement.qty > 0 ? "+" : ""}
                          {movement.qty}
                        </td>
                        <td
                          className={`${tdClass} text-center font-mono text-muted-foreground tabular-nums`}
                        >
                          {movement.before}
                        </td>
                        <td
                          className={`${tdClass} text-center font-mono font-semibold tabular-nums`}
                        >
                          {movement.after}
                        </td>
                        <td className={`${tdClass} font-mono text-xs`}>
                          {movement.reference}
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {movement.user}
                        </td>
                        <td
                          className={`${tdClass} max-w-[260px] truncate text-muted-foreground`}
                        >
                          {movement.notes}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  Percent,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { monthlyPerformance, profitRows } from "@/lib/operations-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

export default function ReportProfitPage() {
  const [search, setSearch] = useState("");

  const keyword = search.trim().toLowerCase();

  const filtered = profitRows.filter(
    (row) =>
      keyword.length === 0 ||
      row.product.toLowerCase().includes(keyword) ||
      row.category.toLowerCase().includes(keyword) ||
      row.city.toLowerCase().includes(keyword),
  );

  const revenue = monthlyPerformance.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );

  const cogs = monthlyPerformance.reduce((sum, month) => sum + month.cogs, 0);

  const profit = monthlyPerformance.reduce(
    (sum, month) => sum + month.profit,
    0,
  );

  const margin = revenue === 0 ? 0 : (profit / revenue) * 100;

  const maxProfit = Math.max(
    ...monthlyPerformance.map((month) => month.profit),
  );

  const byCategory = Array.from(
    profitRows.reduce((groups, row) => {
      const current = groups.get(row.category) ?? {
        category: row.category,
        revenue: 0,
        profit: 0,
        qty: 0,
      };

      current.revenue += row.revenue;
      current.profit += row.profit;
      current.qty += row.qty;
      groups.set(row.category, current);

      return groups;
    }, new Map<string, { category: string; revenue: number; profit: number; qty: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.profit - a.profit);

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Report
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Report Profit
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Laba kotor dari selisih omzet dan harga pokok penjualan, dirinci per
            bulan, kategori, dan produk.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Omzet
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(revenue)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <TrendingDown className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                HPP
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(cogs)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Laba Kotor
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(profit)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Percent className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Margin
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {margin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="surface p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Laba Bulanan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Perbandingan laba kotor enam bulan terakhir.
            </p>
            <div className="mt-5 flex h-44 items-end gap-3">
              {monthlyPerformance.map((month) => (
                <div
                  key={month.month}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {(month.profit / 1_000_000).toFixed(1)}jt
                  </span>
                  <div className="flex h-32 w-full items-end rounded-lg bg-muted/50">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-success to-success/50"
                      style={{
                        height: `${Math.round((month.profit / maxProfit) * 100)}%`,
                      }}
                      title={rupiah.format(month.profit)}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Laba per Kategori
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Kontribusi laba kotor tiap kategori.
            </p>
            <div className="mt-5 space-y-4">
              {byCategory.map((row) => {
                const share =
                  profit === 0 ? 0 : Math.round((row.profit / profit) * 100);

                return (
                  <div key={row.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{row.category}</span>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {share}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-success"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {rupiah.format(row.profit)} · {row.qty} unit
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                Profit per Produk
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Diurutkan dari laba terbesar.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari produk, kategori, kota..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Produk</th>
                  <th className={thClass}>Kategori</th>
                  <th className={thClass}>Kota</th>
                  <th className={`${thClass} text-center`}>Qty</th>
                  <th className={`${thClass} text-right`}>Omzet</th>
                  <th className={`${thClass} text-right`}>HPP</th>
                  <th className={`${thClass} text-right`}>Laba</th>
                  <th className={`${thClass} text-right`}>Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada produk yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const rowMargin =
                      row.revenue === 0 ? 0 : (row.profit / row.revenue) * 100;

                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className={`${tdClass} font-medium`}>
                          {row.product}
                        </td>
                        <td className={tdClass}>
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium">
                            {row.category}
                          </span>
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {row.city}
                        </td>
                        <td
                          className={`${tdClass} text-center font-mono tabular-nums`}
                        >
                          {row.qty}
                        </td>
                        <td
                          className={`${tdClass} text-right font-mono tabular-nums`}
                        >
                          {rupiah.format(row.revenue)}
                        </td>
                        <td
                          className={`${tdClass} text-right font-mono text-muted-foreground tabular-nums`}
                        >
                          {rupiah.format(row.cogs)}
                        </td>
                        <td
                          className={`${tdClass} text-right font-mono font-semibold text-success tabular-nums`}
                        >
                          {rupiah.format(row.profit)}
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <span className="rounded-full bg-success-soft px-2.5 py-1 font-mono text-xs font-semibold text-success tabular-nums">
                            {rowMargin.toFixed(1)}%
                          </span>
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

"use client";

import {
  Building2,
  CircleDollarSign,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { monthlyPerformance, selloutEntries } from "@/lib/operations-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

export default function ReportSelloutPage() {
  const totalRevenue = monthlyPerformance.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );

  const totalOrders = monthlyPerformance.reduce(
    (sum, month) => sum + month.orders,
    0,
  );

  const totalQty = selloutEntries.reduce((sum, entry) => sum + entry.qty, 0);
  const averageOrder = Math.round(totalRevenue / totalOrders);

  const maxRevenue = Math.max(
    ...monthlyPerformance.map((month) => month.revenue),
  );

  const byCity = Array.from(
    selloutEntries.reduce((groups, entry) => {
      const current = groups.get(entry.city) ?? {
        city: entry.city,
        revenue: 0,
        qty: 0,
        orders: 0,
      };

      current.revenue += entry.qty * entry.unitPrice;
      current.qty += entry.qty;
      current.orders += 1;
      groups.set(entry.city, current);

      return groups;
    }, new Map<string, { city: string; revenue: number; qty: number; orders: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.revenue - a.revenue);

  const byCategory = Array.from(
    selloutEntries.reduce((groups, entry) => {
      const current = groups.get(entry.category) ?? {
        category: entry.category,
        revenue: 0,
        qty: 0,
      };

      current.revenue += entry.qty * entry.unitPrice;
      current.qty += entry.qty;
      groups.set(entry.category, current);

      return groups;
    }, new Map<string, { category: string; revenue: number; qty: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.revenue - a.revenue);

  const cityRevenue = byCity.reduce((sum, row) => sum + row.revenue, 0);
  const categoryRevenue = byCategory.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Report
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Report Sellout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Rekap penjualan per bulan, kota, dan kategori produk selama enam
            bulan terakhir.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Omzet
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(totalRevenue)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <ReceiptText className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Order
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {totalOrders} order
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <ShoppingBag className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Qty Terjual
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {totalQty} unit
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Rata-rata Order
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(averageOrder)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="surface p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Omzet Bulanan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Perbandingan omzet dan jumlah order per bulan.
            </p>
            <div className="mt-5 flex h-44 items-end gap-3">
              {monthlyPerformance.map((month) => (
                <div
                  key={month.month}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {(month.revenue / 1_000_000).toFixed(0)}jt
                  </span>
                  <div className="flex h-32 w-full items-end rounded-lg bg-muted/50">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-primary to-primary/55"
                      style={{
                        height: `${Math.round((month.revenue / maxRevenue) * 100)}%`,
                      }}
                      title={rupiah.format(month.revenue)}
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
              Kontribusi Kategori
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Porsi omzet per kategori produk.
            </p>
            <div className="mt-5 space-y-4">
              {byCategory.map((row) => {
                const share =
                  categoryRevenue === 0
                    ? 0
                    : Math.round((row.revenue / categoryRevenue) * 100);

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
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {rupiah.format(row.revenue)} · {row.qty} unit
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="surface overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Penjualan per Kota
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Distribusi omzet berdasarkan kota customer.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Kota</th>
                  <th className={`${thClass} text-center`}>Order</th>
                  <th className={`${thClass} text-center`}>Qty</th>
                  <th className={`${thClass} text-right`}>Omzet</th>
                  <th className={thClass}>Porsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {byCity.map((row) => {
                  const share =
                    cityRevenue === 0
                      ? 0
                      : Math.round((row.revenue / cityRevenue) * 100);

                  return (
                    <tr
                      key={row.city}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className={`${tdClass} font-medium`}>{row.city}</td>
                      <td
                        className={`${tdClass} text-center font-mono tabular-nums`}
                      >
                        {row.orders}
                      </td>
                      <td
                        className={`${tdClass} text-center font-mono tabular-nums`}
                      >
                        {row.qty}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {rupiah.format(row.revenue)}
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground tabular-nums">
                            {share}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Rekap Bulanan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Omzet, order, dan rata-rata nilai order.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Bulan</th>
                  <th className={`${thClass} text-center`}>Order</th>
                  <th className={`${thClass} text-right`}>Omzet</th>
                  <th className={`${thClass} text-right`}>Rata-rata Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {monthlyPerformance.map((month) => (
                  <tr
                    key={month.month}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className={`${tdClass} font-medium`}>
                      {month.month} 2026
                    </td>
                    <td
                      className={`${tdClass} text-center font-mono tabular-nums`}
                    >
                      {month.orders}
                    </td>
                    <td
                      className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                    >
                      {rupiah.format(month.revenue)}
                    </td>
                    <td
                      className={`${tdClass} text-right font-mono text-muted-foreground tabular-nums`}
                    >
                      {rupiah.format(Math.round(month.revenue / month.orders))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

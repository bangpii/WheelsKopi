"use client";

import { useMemo } from "react";
import {
  Building2,
  CircleDollarSign,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";
import { buildReportData } from "@/lib/report-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

export default function ReportSelloutPage() {
  const { sellouts, products } = useData();
  const report = useMemo(
    () => buildReportData(sellouts, products),
    [sellouts, products],
  );

  const {
    revenue: totalRevenue,
    orders: totalOrders,
    qty: totalQty,
    days,
    stores: byStore,
    categories: byCategory,
  } = report;

  const averageOrder =
    totalOrders === 0 ? 0 : Math.round(totalRevenue / totalOrders);
  const maxRevenue = Math.max(1, ...days.map((day) => day.revenue));
  const cityRevenue = byStore.reduce((sum, row) => sum + row.revenue, 0);
  const categoryRevenue = byCategory.reduce(
    (sum, row) => sum + row.revenue,
    0,
  );

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
            Rekap penjualan harian per toko dan kategori produk dari transaksi
            sellout tanggal 1-8.
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
              Omzet Harian
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Perbandingan omzet dan jumlah order per hari.
            </p>
            <div className="mt-5 flex h-44 items-end gap-3">
              {days.map((day) => (
                <div
                  key={day.key}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {(day.revenue / 1_000_000).toFixed(0)}jt
                  </span>
                  <div className="flex h-32 w-full items-end rounded-lg bg-muted/50">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-primary to-primary/55"
                      style={{
                        height: `${Math.round((day.revenue / maxRevenue) * 100)}%`,
                      }}
                      title={rupiah.format(day.revenue)}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {day.label}
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
              Penjualan per Toko
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Distribusi omzet berdasarkan toko.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Toko</th>
                  <th className={`${thClass} text-center`}>Order</th>
                  <th className={`${thClass} text-center`}>Qty</th>
                  <th className={`${thClass} text-right`}>Omzet</th>
                  <th className={thClass}>Porsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {byStore.map((row) => {
                  const share =
                    cityRevenue === 0
                      ? 0
                      : Math.round((row.revenue / cityRevenue) * 100);

                  return (
                    <tr
                      key={row.store}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className={`${tdClass} font-medium`}>{row.store}</td>
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
              Rekap Harian
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Omzet, order, dan rata-rata nilai order per hari.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Tanggal</th>
                  <th className={`${thClass} text-center`}>Order</th>
                  <th className={`${thClass} text-right`}>Omzet</th>
                  <th className={`${thClass} text-right`}>Rata-rata Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {days.map((day) => (
                  <tr
                    key={day.key}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className={`${tdClass} font-medium`}>
                      {day.label}
                    </td>
                    <td
                      className={`${tdClass} text-center font-mono tabular-nums`}
                    >
                      {day.orders}
                    </td>
                    <td
                      className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                    >
                      {rupiah.format(day.revenue)}
                    </td>
                    <td
                      className={`${tdClass} text-right font-mono text-muted-foreground tabular-nums`}
                    >
                      {rupiah.format(day.orders === 0 ? 0 : Math.round(day.revenue / day.orders))}
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

"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  ReceiptText,
  Search,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { monthlyPerformance, selloutEntries } from "@/lib/operations-data";

const statusOptions = ["Semua Status", "Lunas", "Piutang"];

const paymentOptions = [
  "Semua Pembayaran",
  "Cash",
  "Transfer",
  "QRIS",
  "Tempo",
];

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

export default function SelloutPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");
  const [payment, setPayment] = useState("Semua Pembayaran");

  const keyword = search.trim().toLowerCase();

  const filtered = selloutEntries.filter((entry) => {
    const matchesKeyword =
      keyword.length === 0 ||
      entry.invoice.toLowerCase().includes(keyword) ||
      entry.customer.toLowerCase().includes(keyword) ||
      entry.product.toLowerCase().includes(keyword);

    const matchesStatus = status === "Semua Status" || entry.status === status;

    const matchesPayment =
      payment === "Semua Pembayaran" || entry.payment === payment;

    return matchesKeyword && matchesStatus && matchesPayment;
  });

  const totalRevenue = filtered.reduce(
    (sum, entry) => sum + entry.qty * entry.unitPrice,
    0,
  );

  const totalQty = filtered.reduce((sum, entry) => sum + entry.qty, 0);

  const receivable = filtered
    .filter((entry) => entry.status === "Piutang")
    .reduce((sum, entry) => sum + entry.qty * entry.unitPrice, 0);

  const averageOrder =
    filtered.length === 0 ? 0 : Math.round(totalRevenue / filtered.length);

  const maxRevenue = Math.max(
    ...monthlyPerformance.map((month) => month.revenue),
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Transaction
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Sellout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Riwayat penjualan keluar dari distributor ke toko, bengkel, dan
            komunitas beserta status pembayaran.
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
                {rupiah.format(totalRevenue)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
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
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <ReceiptText className="size-5" />
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
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Piutang
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(receivable)}
              </p>
            </div>
          </div>
        </div>

        <section className="surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                Tren Omzet
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enam bulan terakhir dari data penjualan.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold text-success">
              <TrendingUp className="size-3" />
              +18,2%
            </span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
            {monthlyPerformance.map((month) => (
              <div
                key={month.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-32 w-full items-end rounded-lg bg-muted/50">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-primary to-primary/55 transition-all duration-500"
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

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari invoice, customer, atau produk..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                {paymentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {filtered.length} transaksi
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Invoice</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Produk</th>
                  <th className={`${thClass} text-center`}>Qty</th>
                  <th className={`${thClass} text-right`}>Harga</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Pembayaran</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className={`${tdClass} font-mono font-medium`}>
                        {entry.invoice}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {entry.date}
                      </td>
                      <td className={tdClass}>
                        <p className="font-medium">{entry.customer}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {entry.city}
                        </p>
                      </td>
                      <td className={tdClass}>
                        <p>{entry.product}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {entry.category}
                        </p>
                      </td>
                      <td
                        className={`${tdClass} text-center font-mono tabular-nums`}
                      >
                        {entry.qty}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {rupiah.format(entry.unitPrice)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold text-primary tabular-nums`}
                      >
                        {rupiah.format(entry.qty * entry.unitPrice)}
                      </td>
                      <td className={tdClass}>
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium">
                          {entry.payment}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            entry.status === "Lunas"
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {entry.status}
                        </span>
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

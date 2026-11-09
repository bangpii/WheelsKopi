"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileText, Printer, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { useData } from "@/lib/context/data-context";
import {
  type SelloutRecord,
} from "@/lib/transaction-data";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

export default function InvoicePage() {
  const { sellouts: records, setSellouts: setRecords } = useData();
  const [selected, setSelected] = useState<SelloutRecord | null>(null);
  const [service, setService] = useState("0");
  const [trade, setTrade] = useState("0");
  const [discount, setDiscount] = useState("0");


  const invoices = useMemo(
    () =>
      records.filter(
        (row) =>
          row.status === "Siap Invoice" || row.status === "Sudah Invoice",
      ),
    [records],
  );

  const openPreview = (row: SelloutRecord) => {
    setSelected(row);
    setService("0");
    setTrade("0");
    setDiscount("0");
  };

  const serviceValue = Number(service) || 0;
  const tradeValue = Number(trade) || 0;
  const discountValue = Number(discount) || 0;
  const subtotal = selected
    ? selected.total + serviceValue - tradeValue
    : 0;
  const grandTotal = Math.max(0, subtotal - discountValue);

  const issueInvoice = () => {
    if (!selected) return;

    const next = records.map((row) =>
      row.id === selected.id
        ? { ...row, status: "Sudah Invoice" as const }
        : row,
    );
    setRecords(next);
    setSelected(null);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Transaction
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Invoice
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Invoice dibuat dari sellout yang sudah disetujui kepala toko.
            Invoice yang sudah di-print tetap bisa diedit oleh backoffice.
          </p>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Nomor Bon</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Produk</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada invoice. Approve sellout di Halaman Kerja
                      terlebih dahulu.
                    </td>
                  </tr>
                ) : (
                  invoices.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-mono font-semibold`}>
                        INV-{row.number}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={`${tdClass} font-medium`}>{row.customer}</td>
                      <td className={tdClass}>{row.store}</td>
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
                            row.status === "Sudah Invoice"
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
                          onClick={() => openPreview(row)}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary"
                        >
                          <FileText className="size-3.5" />
                          Preview
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 text-black shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <Image
                src="/logo.png"
                alt="WheelsKopi"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-black/50 hover:text-black"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-start justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                  Nomor Bon
                </p>
                <p className="font-mono text-xl font-bold">
                  INV-{selected.number}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{selected.store}</p>
                <p className="text-black/60">{selected.date}</p>
                <p className="text-black/60">{selected.customer}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-b border-black/10 pb-4 text-sm">
              {selected.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex justify-between"
                >
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span className="font-mono">
                    {rupiah.format(item.qty * item.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-black/60">Jasa</span>
                <input
                  type="number"
                  min={0}
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-black/60">
                  Barang TT / Trade
                </span>
                <input
                  type="number"
                  min={0}
                  value={trade}
                  onChange={(event) => setTrade(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-black/60">Discount</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="mt-5 space-y-1 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{rupiah.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Grand Total</span>
                <span className="font-mono">{rupiah.format(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-10 flex items-end justify-between text-xs">
              <p className="text-black/50">Hormat kami</p>
              <div className="text-center">
                <div className="h-12" />
                <p className="border-t border-black/30 pt-1 font-semibold">
                  Nama Kepala Toko
                </p>
                <p className="text-black/60">{selected.date}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-black/20 px-4 py-2 text-sm font-semibold"
              >
                <Printer className="size-4" />
                Print
              </button>
              {selected.status === "Siap Invoice" && (
                <button
                  type="button"
                  onClick={issueInvoice}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                >
                  Issue Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

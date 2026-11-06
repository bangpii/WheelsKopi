"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Download,
  Package,
  ReceiptText,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { othersRecords, type OthersRecord } from "@/lib/operations-data";

const monthOptions = ["Semua Bulan", "Januari", "Februari", "Maret", "April"];

const statusOptions = ["Semua Status", "Lunas", "Tidak Lunas"];

const exportColumns: { key: keyof OthersRecord; label: string }[] = [
  { key: "bulan", label: "Bulan" },
  { key: "date", label: "Date" },
  { key: "lunas", label: "Lunas" },
  { key: "kodeBarang", label: "Kode Barang" },
  { key: "supplier", label: "Supplier" },
  { key: "merek", label: "Merek" },
  { key: "type", label: "Type" },
  { key: "ring", label: "Ring" },
  { key: "wide", label: "Wide" },
  { key: "hole", label: "Hole" },
  { key: "et", label: "ET" },
  { key: "item", label: "Item" },
  { key: "qty", label: "Qty" },
  { key: "standarPrice", label: "Standar Price" },
  { key: "discount", label: "Discount" },
  { key: "dealerPrice", label: "Dealer Price" },
  { key: "totalPrice", label: "Total Price" },
  { key: "discTypeCash", label: "Disc Type/Cash" },
  { key: "rawCase", label: "Raw Case" },
  { key: "sswDisc", label: "Ssw Disc" },
  { key: "rawPrice", label: "Raw Price" },
  { key: "shippingFee", label: "Shipping Fee" },
  { key: "shipFeePerSet", label: "Shipfee/Set" },
  { key: "subTotal", label: "Sub Total" },
  { key: "modalPerSet", label: "Modal/Set" },
  { key: "paymentCash", label: "Payment Cash" },
  { key: "up", label: "UP" },
  { key: "modalToko", label: "Modal Toko" },
  { key: "arrivalDate", label: "Arrival Date" },
  { key: "stockOwner", label: "Stock Owner" },
  { key: "paymentDate", label: "Payment Date" },
  { key: "nomorBon", label: "Nomor Bon" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "notes", label: "Notes" },
];

const thClass =
  "whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-3 py-3.5 text-xs";

function money(value: number) {
  return rupiah.format(value);
}

export default function OthersPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("Semua Bulan");
  const [status, setStatus] = useState("Semua Status");
  const [detail, setDetail] = useState<OthersRecord | null>(null);

  const keyword = search.trim().toLowerCase();

  const filtered = othersRecords.filter((record) => {
    const matchesKeyword =
      keyword.length === 0 ||
      record.kodeBarang.toLowerCase().includes(keyword) ||
      record.merek.toLowerCase().includes(keyword) ||
      record.type.toLowerCase().includes(keyword) ||
      record.supplier.toLowerCase().includes(keyword) ||
      record.nomorBon.toLowerCase().includes(keyword);

    const matchesMonth = month === "Semua Bulan" || record.bulan === month;
    const matchesStatus = status === "Semua Status" || record.lunas === status;

    return matchesKeyword && matchesMonth && matchesStatus;
  });

  const totalQty = filtered.reduce((sum, record) => sum + record.qty, 0);

  const totalDealer = filtered.reduce(
    (sum, record) => sum + record.totalPrice,
    0,
  );

  const totalModal = filtered.reduce(
    (sum, record) => sum + record.modalToko,
    0,
  );

  const outstanding = filtered
    .filter((record) => record.lunas === "Tidak Lunas")
    .reduce((sum, record) => sum + record.totalPrice, 0);

  const exportCsv = () => {
    const header = exportColumns.map((column) => column.label).join(",");

    const rows = filtered.map((record) =>
      exportColumns
        .map(
          (column) => `"${String(record[column.key]).replaceAll('"', '""')}"`,
        )
        .join(","),
    );

    const csv = `\uFEFF${[header, ...rows].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Others_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Inventory Ledger
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Others
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Catatan lengkap pembelian produk non-ban: harga dealer, diskon,
              biaya kirim, modal, dan status pembayaran.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 sm:self-auto"
          >
            <Download className="size-4" />
            Export Excel
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Package className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Item
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {totalQty} unit
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Dealer
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {money(totalDealer)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Modal Toko
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {money(totalModal)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <ReceiptText className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Belum Lunas
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {money(outstanding)}
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
                placeholder="Cari kode barang, supplier, merek, bon..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                {monthOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {filtered.length} baris
              </span>
            </div>
          </div>

          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[3400px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={`${thClass} sticky left-0 z-20 bg-muted`}>
                    Bulan
                  </th>
                  {exportColumns.slice(1).map((column) => (
                    <th key={column.key} className={thClass}>
                      {column.label}
                    </th>
                  ))}
                  <th className={`${thClass} text-center`}>Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={exportColumns.length + 1}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td
                        className={`${tdClass} sticky left-0 z-10 bg-card font-medium`}
                      >
                        <div className="flex flex-col">
                          <span>{record.bulan}</span>
                          <span className="mt-1 text-[10px] font-normal text-muted-foreground">
                            {record.date}
                          </span>
                        </div>
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {record.date}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            record.lunas === "Lunas"
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {record.lunas === "Lunas" ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <X className="size-3" />
                          )}
                          {record.lunas}
                        </span>
                      </td>
                      <td className={`${tdClass} font-mono font-medium`}>
                        {record.kodeBarang}
                      </td>
                      <td className={tdClass}>{record.supplier}</td>
                      <td className={tdClass}>{record.merek}</td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {record.type}
                      </td>
                      <td className={tdClass}>{record.ring}</td>
                      <td className={tdClass}>{record.wide}</td>
                      <td className={tdClass}>{record.hole}</td>
                      <td className={tdClass}>{record.et}</td>
                      <td className={tdClass}>{record.item}</td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {record.qty}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.standarPrice)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.discount)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.dealerPrice)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold text-primary tabular-nums`}
                      >
                        {money(record.totalPrice)}
                      </td>
                      <td className={tdClass}>{record.discTypeCash}</td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {record.rawCase}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {record.sswDisc}%
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.rawPrice)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.shippingFee)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.shipFeePerSet)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {money(record.subTotal)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.modalPerSet)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.paymentCash)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {money(record.up)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {money(record.modalToko)}
                      </td>
                      <td className={tdClass}>{record.arrivalDate}</td>
                      <td className={tdClass}>{record.stockOwner}</td>
                      <td className={tdClass}>{record.paymentDate}</td>
                      <td className={`${tdClass} font-mono`}>
                        {record.nomorBon}
                      </td>
                      <td className={tdClass}>{record.invoiceDate}</td>
                      <td
                        className={`${tdClass} max-w-[240px] truncate text-muted-foreground`}
                        title={record.notes}
                      >
                        {record.notes}
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => setDetail(record)}
                          className="rounded-lg border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
                        >
                          Lihat
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

      {detail && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div
            aria-hidden="true"
            onClick={() => setDetail(null)}
            className="absolute inset-0 bg-black/45 backdrop-blur-md"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="others-detail-title"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] liquid-glass"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.26em] text-primary uppercase">
                  Detail Others
                </p>
                <h2
                  id="others-detail-title"
                  className="font-display text-lg font-semibold tracking-tight"
                >
                  {detail.merek} {detail.type}
                </h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {detail.kodeBarang} • {detail.nomorBon}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Tutup detail"
                className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-3">
                {[
                  ["Bulan", detail.bulan],
                  ["Tanggal", detail.date],
                  ["Status", detail.lunas],
                  ["Supplier", detail.supplier],
                  ["Item", detail.item],
                  ["Qty", `${detail.qty} unit`],
                  ["Ring", detail.ring],
                  ["Wide", detail.wide],
                  ["Hole", detail.hole],
                  ["ET", detail.et],
                  ["Stock Owner", detail.stockOwner],
                  ["Arrival", detail.arrivalDate],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="mt-0.5 font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold">Harga & Diskon</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {[
                    ["Standar Price", money(detail.standarPrice)],
                    ["Discount", money(detail.discount)],
                    ["Dealer Price", money(detail.dealerPrice)],
                    ["Total Price", money(detail.totalPrice)],
                    ["Disc Type/Cash", detail.discTypeCash],
                    ["Ssw Disc", `${detail.sswDisc}%`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[11px] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold">
                  Biaya, Modal & Pembayaran
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {[
                    ["Shipping Fee", money(detail.shippingFee)],
                    ["Shipfee/Set", money(detail.shipFeePerSet)],
                    ["Sub Total", money(detail.subTotal)],
                    ["Modal/Set", money(detail.modalPerSet)],
                    ["Payment Cash", money(detail.paymentCash)],
                    ["UP", money(detail.up)],
                    ["Modal Toko", money(detail.modalToko)],
                    ["Payment Date", detail.paymentDate],
                    ["Invoice Date", detail.invoiceDate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[11px] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                <h3 className="text-sm font-semibold text-accent-foreground">
                  Notes
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-accent-foreground/80">
                  {detail.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

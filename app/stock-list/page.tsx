"use client";

import { useState } from "react";
import {
  Boxes,
  Building2,
  CircleDollarSign,
  MapPin,
  Search,
  Store,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { stockListRecords } from "@/lib/operations-data";

const thClass =
  "whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-5 py-3.5 text-sm";

export default function StockListPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Semua Kota");

  const cities = [
    "Semua Kota",
    ...Array.from(new Set(stockListRecords.map((record) => record.city))),
  ];

  const keyword = search.trim().toLowerCase();

  const filtered = stockListRecords.filter((record) => {
    const matchesKeyword =
      keyword.length === 0 ||
      record.namaProduk.toLowerCase().includes(keyword) ||
      record.item.toLowerCase().includes(keyword) ||
      record.ring.toLowerCase().includes(keyword);

    const matchesCity = city === "Semua Kota" || record.city === city;

    return matchesKeyword && matchesCity;
  });

  const totalQty = filtered.reduce((sum, record) => sum + record.qty, 0);

  const totalJual = filtered.reduce(
    (sum, record) => sum + record.hargaJual * record.qty,
    0,
  );

  const totalTagihan = filtered.reduce(
    (sum, record) => sum + record.tagihanToko * record.qty,
    0,
  );

  const totalModal = filtered.reduce(
    (sum, record) => sum + record.modalDistributor * record.qty,
    0,
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Inventory Summary
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Stock List
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ringkasan stok per produk dan kota: harga jual, UP, tagihan toko,
            modal distributor, dan qty tersedia.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Boxes className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Qty
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {totalQty} unit
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Nilai Jual
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(totalJual)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Store className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Tagihan Toko
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(totalTagihan)}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Modal Distributor
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {rupiah.format(totalModal)}
              </p>
            </div>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama produk, item, atau ring..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                {cities.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {filtered.length} produk
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Nama Produk</th>
                  <th className={thClass}>Item</th>
                  <th className={thClass}>Ring</th>
                  <th className={thClass}>Hole</th>
                  <th className={thClass}>City</th>
                  <th className={`${thClass} text-right`}>Harga Jual</th>
                  <th className={`${thClass} text-right`}>UP</th>
                  <th className={`${thClass} text-right`}>Tagihan Toko</th>
                  <th className={`${thClass} text-right`}>Modal Distributor</th>
                  <th className={`${thClass} text-right`}>Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada produk yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className={`${tdClass} font-medium`}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            {record.item === "Velg" ? (
                              <Building2 className="size-4" />
                            ) : (
                              <Boxes className="size-4" />
                            )}
                          </span>
                          {record.namaProduk}
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium">
                          {record.item}
                        </span>
                      </td>
                      <td className={tdClass}>{record.ring}</td>
                      <td className={`${tdClass} font-mono text-xs`}>
                        {record.hole}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {record.city}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {rupiah.format(record.hargaJual)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono text-muted-foreground tabular-nums`}
                      >
                        {rupiah.format(record.up)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {rupiah.format(record.tagihanToko)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono tabular-nums`}
                      >
                        {rupiah.format(record.modalDistributor)}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <span
                          className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${
                            record.qty <= 5
                              ? "bg-danger-soft text-danger"
                              : record.qty <= 10
                                ? "bg-warning-soft text-warning"
                                : "bg-success-soft text-success"
                          }`}
                        >
                          {record.qty}
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

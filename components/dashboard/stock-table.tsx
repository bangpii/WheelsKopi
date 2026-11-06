"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Filter } from "lucide-react";
import { rupiah, stockItems } from "@/lib/dashboard-data";

const filters = ["Semua", "Mobil", "Velg", "Aksesori"];

export function StockTable() {
  const [activeFilter, setActiveFilter] = useState("Semua");

  const filtered = stockItems.filter(
    (item) => activeFilter === "Semua" || item.category === activeFilter,
  );

  return (
    <section
      data-aos="fade-up"
      className="surface overflow-hidden p-0 lg:col-span-8"
      aria-label="Daftar stok ban"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Manajemen Stok
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pantau harga jual, stok, dan titik restock
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-muted/60 p-1 text-xs font-medium sm:flex">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  activeFilter === filter
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/60"
          >
            <Filter className="size-4" />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Tambah Item
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-y border-border bg-muted/40">
              <th className="px-5 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:px-6">
                Kode
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Produk
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Ukuran
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Kategori
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Harga Jual
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Stok
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Min.Stok
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Terjual
              </th>
              <th className="px-5 py-2.5 text-right text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:px-6">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const low = item.stock <= item.minStock;
              const out = item.stock <= 0;

              return (
                <tr
                  key={item.id}
                  className="group border-b border-border/70 transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-3 font-mono text-xs font-medium tabular-nums sm:px-6">
                    {item.id}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">
                        {item.brand.slice(0, 3).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.size}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">
                    {rupiah.format(item.price)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-mono tabular-nums ${out ? "text-danger" : low ? "text-warning" : ""}`}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {item.minStock}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {item.sold}
                  </td>
                  <td className="px-5 py-3 text-right sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        out
                          ? "bg-danger-soft text-danger"
                          : low
                            ? "bg-warning-soft text-warning"
                            : "bg-success-soft text-success"
                      }`}
                    >
                      {out && <AlertTriangle className="size-3.5" />}
                      {out ? "Stok Habis" : low ? "Segera Restock" : "Aman"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

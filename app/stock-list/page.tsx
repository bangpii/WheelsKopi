"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Boxes,
  CircleDollarSign,
  MapPin,
  Search,
  Store,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { useData } from "@/lib/context/data-context";

const thClass =
  "whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-5 py-3.5 text-sm";

export default function StockListPage() {
  const { products } = useData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [mounted, setMounted] = useState(false);

  // Fix Hydration Error
  useEffect(() => {
    setMounted(true);
  }, []);

  const keyword = search.trim().toLowerCase();

  // Filter berdasarkan pencarian dan kategori
  const filtered = products.filter((item) => {
    const matchSearch =
      keyword.length === 0 ||
      (item.namaBarang || "").toLowerCase().includes(keyword) ||
      (item.subKategori || "").toLowerCase().includes(keyword) ||
      (item.supplier || "").toLowerCase().includes(keyword);

    const matchCategory = 
      categoryFilter === "Semua Kategori" || 
      item.kategoriUtama === categoryFilter;

    return matchSearch && matchCategory;
  });

  // Hitung Total Ringkasan
  const totalQty = filtered.reduce((sum, item) => sum + (item.stok || 0), 0);
  const totalJual = filtered.reduce((sum, item) => sum + ((item.hargaModalToko || 0) * (item.stok || 0)), 0);
  const totalTagihan = filtered.reduce((sum, item) => sum + ((item.hargaTagihanToko || item.hargaModalToko || 0) * (item.stok || 0)), 0);
  const totalModal = filtered.reduce((sum, item) => sum + ((item.hargaModalAsli || 0) * (item.stok || 0)), 0);

  // Ambil daftar kota (jika ada, jika tidak gunakan default)
  const cities = ["Semua Kota", "Medan", "Binjai", "Deli Serdang"];

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
            Ringkasan stok per produk: harga jual, tagihan toko, modal distributor, dan qty tersedia.
          </p>
        </header>

        {/* Kartu Ringkasan */}
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
                {mounted ? totalQty : "-"} unit
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
                {mounted ? rupiah.format(totalJual) : "Rp 0"}
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
                {mounted ? rupiah.format(totalTagihan) : "Rp 0"}
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
                {mounted ? rupiah.format(totalModal) : "Rp 0"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="surface overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama produk, merek, atau supplier..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Ban">Ban</option>
                <option value="Others">Others</option>
              </select>
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {mounted ? filtered.length : "0"} produk
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Nama Produk</th>
                  <th className={thClass}>Kategori</th>
                  <th className={thClass}>Spesifikasi</th>
                  <th className={thClass}>Supplier</th>
                  <th className={`${thClass} text-right`}>Harga Jual</th>
                  <th className={`${thClass} text-right`}>Tagihan Toko</th>
                  <th className={`${thClass} text-right`}>Modal Distributor</th>
                  <th className={`${thClass} text-right`}>Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {!mounted ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-sm text-muted-foreground">
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-sm text-muted-foreground">
                      Tidak ada produk yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    // Format Spesifikasi
                    let spec = "-";
                    if (item.kategoriUtama === "Ban") {
                      spec = `${item.ukuranTapak ?? ""}${item.ukuranTinggi ? `/${item.ukuranTinggi}` : ""} ${item.ring ?? ""}`.trim();
                    } else if (item.subKategori === "Velg") {
                      spec = `${item.ring ?? ""} • ${item.wide ?? ""} • ${item.hole ?? ""}`.replace(/ • /g, " ").trim();
                    } else {
                      spec = item.ukuran || "-";
                    }

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-muted/40">
                        <td className={`${tdClass} font-medium`}>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                              {item.kategoriUtama === "Ban" ? <Boxes className="size-4" /> : <Box className="size-4" />}
                            </span>
                            {item.namaBarang}
                          </div>
                        </td>
                        <td className={tdClass}>
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium">
                            {item.kategoriUtama}
                          </span>
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>{spec || "-"}</td>
                        <td className={`${tdClass} text-muted-foreground`}>{item.supplier || "-"}</td>
                        <td className={`${tdClass} text-right font-mono font-semibold tabular-nums`}>
                          {rupiah.format(item.hargaModalToko || 0)}
                        </td>
                        <td className={`${tdClass} text-right font-mono tabular-nums`}>
                          {rupiah.format(item.hargaTagihanToko || item.hargaModalToko || 0)}
                        </td>
                        <td className={`${tdClass} text-right font-mono tabular-nums`}>
                          {rupiah.format(item.hargaModalAsli || 0)}
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <span
                            className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${
                              item.stok <= 2
                                ? "bg-danger-soft text-danger"
                                : item.stok <= 5
                                  ? "bg-warning-soft text-warning"
                                  : "bg-success-soft text-success"
                            }`}
                          >
                            {item.stok}
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
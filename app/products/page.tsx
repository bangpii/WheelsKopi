"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  ImageOff,
  Package,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { checkPermission } from "@/lib/check-permission";
import { rupiah } from "@/lib/dashboard-data";
import { useData, type Product } from "@/lib/context/data-context";

function stockLabel(stok: number) {
  if (stok <= 0) {
    return "Habis";
  }

  if (stok <= 10) {
    return "Menipis";
  }

  return "Tersedia";
}

export default function ProductsPage() {
  const { products, setProducts, stockItems, setStockItems } = useData();
  const [search, setSearch] = useState("");
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const canDelete = checkPermission("product", "delete");

  const handleDelete = (product: Product) => {
    const confirmed = window.confirm(
      `Hapus produk "${product.namaBarang}" dari inventaris?`,
    );

    if (!confirmed) {
      return;
    }

    setProducts(products.filter((entry) => entry.id !== product.id));
    setStockItems(stockItems.filter((entry) => entry.id !== product.id));
  };

  const keyword = search.trim().toLowerCase();

  const filteredProducts = products.filter(
    (product) =>
      keyword.length === 0 ||
      product.namaBarang.toLowerCase().includes(keyword) ||
      product.subKategori.toLowerCase().includes(keyword) ||
      product.supplier.toLowerCase().includes(keyword),
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Master Data
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Management Product Store
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Daftar inventaris produk lengkap dengan gambar, spesifikasi, dan
              riwayat.
            </p>
          </div>
          <Link
            href="/distribusi"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            Tambah Produk
          </Link>
        </header>

        <div className="inline-flex rounded-xl border border-border bg-card p-1 text-sm font-medium">
          <span className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            Product Store
          </span>
          <Link
            href="/distribusi"
            className="rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Product Distributor
          </Link>
        </div>

        <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4 text-primary" />
            Total Produk:{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              placeholder="Cari produk, merek, atau supplier..."
            />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th className="w-16 px-5 py-3.5 text-center font-semibold">
                    Gambar
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Kategori</th>
                  <th className="px-5 py-3.5 font-semibold">Nama Produk</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Harga Modal
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Harga Jual
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">Stok</th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Package className="size-6" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            Belum ada produk
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tambahkan barang baru melalui halaman Distribusi.
                          </p>
                        </div>
                        <Link
                          href="/distribusi"
                          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          <Plus className="size-3.5" />
                          Buka Distribusi
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const label = stockLabel(product.stok);

                    const statusClass =
                      label === "Habis"
                        ? "bg-danger-soft text-danger"
                        : label === "Menipis"
                          ? "bg-warning-soft text-warning"
                          : "bg-success-soft text-success";

                    return (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5">
                          {product.gambar ? (
                            <div
                              className="size-10 rounded-lg border border-border bg-muted bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${product.gambar})`,
                              }}
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                              <ImageOff className="size-4" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium">
                            {product.kategoriUtama}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium">{product.namaBarang}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {product.subKategori} • {product.supplier}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                          {rupiah.format(product.hargaModalAsli)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-sm font-semibold text-primary tabular-nums">
                          {rupiah.format(product.hargaModalToko)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-mono font-semibold tabular-nums">
                              {product.stok}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                            >
                              {label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewProduct(product)}
                              title="Lihat detail"
                              aria-label={`Lihat ${product.namaBarang}`}
                              className="rounded-xl border border-transparent p-2 text-muted-foreground transition-colors hover:border-warning/20 hover:bg-warning-soft hover:text-warning"
                            >
                              <Eye className="size-4" />
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                title="Hapus"
                                aria-label={`Hapus ${product.namaBarang}`}
                                className="rounded-xl border border-transparent p-2 text-muted-foreground transition-colors hover:border-danger/20 hover:bg-danger-soft hover:text-danger"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
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

      {viewProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div
            aria-hidden="true"
            onClick={() => setViewProduct(null)}
            className="absolute inset-0 bg-black/45 backdrop-blur-md"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] liquid-glass"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.26em] text-primary uppercase">
                  Detail
                </p>
                <h2
                  id="product-detail-title"
                  className="font-display text-lg font-semibold tracking-tight"
                >
                  {viewProduct.namaBarang}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                aria-label="Tutup detail"
                className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
                {viewProduct.gambar ? (
                  <div
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${viewProduct.gambar})` }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageOff className="mb-2 size-10 opacity-50" />
                    <span className="text-xs">Tidak ada gambar</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Kategori</p>
                  <p className="mt-0.5 font-medium">
                    {viewProduct.kategoriUtama}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Merek</p>
                  <p className="mt-0.5 font-medium">
                    {viewProduct.subKategori}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Spesifikasi
                  </p>
                  <p className="mt-0.5 font-medium">
                    {viewProduct.ukuran}
                    {viewProduct.ring ? ` / ${viewProduct.ring}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Supplier</p>
                  <p className="mt-0.5 font-medium">{viewProduct.supplier}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Harga Modal
                  </p>
                  <p className="mt-0.5 font-mono tabular-nums">
                    {rupiah.format(viewProduct.hargaModalAsli)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Harga Jual
                  </p>
                  <p className="mt-0.5 font-mono font-semibold text-primary tabular-nums">
                    {rupiah.format(viewProduct.hargaModalToko)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Stok</p>
                  <p className="mt-0.5 font-medium">{viewProduct.stok} unit</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Status</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 font-medium">
                    {stockLabel(viewProduct.stok)}
                    {viewProduct.stok <= 10 && (
                      <TriangleAlert className="size-3.5 text-warning" />
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                <h3 className="text-sm font-semibold text-accent-foreground">
                  Riwayat Perubahan
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-accent-foreground/80">
                  {viewProduct.history.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

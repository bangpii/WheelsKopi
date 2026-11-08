"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Disc3,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Upload,
  X,
  Pencil,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RegisterProductModal } from "@/components/distribusi/register-product-modal";
import { rupiah } from "@/lib/dashboard-data";
import {
  useData,
  toProduct,
  type Product,
} from "@/lib/context/data-context";
import type {
  DistribusiCategory,
  DistribusiFormValues,
} from "@/lib/distribusi-data";
// IMPORT DIPERBAIKI: Hapus getStockStatusInfo
import { formToItem } from "@/lib/distribusi-data";

const statusOptions = ["Semua Status Stok", "Tersedia", "Menipis", "Wajib Pesan"];

// FUNGSI BARU: Menentukan status stok secara statis
function statusOf(stok: number) {
  if (stok < 2) return "Wajib Pesan";
  if (stok <= 5) return "Menipis";
  return "Tersedia";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function DistribusiContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "others" ? "Others" : "Ban";

  const { products, setProducts, stockItems, setStockItems, suppliers } = useData();

  const [category, setCategory] = useState<DistribusiCategory>(initialTab);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status Stok");
  
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "others") setCategory("Others");
    if (tab === "ban") setCategory("Ban");
  }, [searchParams]);

  const supplierOptions = suppliers.map((s) => ({ name: s.name }));

  const categoryItems = products.filter(
    (item) => item.kategoriUtama === category,
  );

  const filteredItems = categoryItems.filter((item) => {
    const keyword = search.trim().toLowerCase();
    
    const searchTarget = [
      item.namaBarang,
      item.subKategori,
      item.supplier,
      item.merekBan,
      item.merekProduk,
      item.ukuran,
      item.ukuranTapak,
      item.ukuranTinggi,
      item.ring,
      item.item,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch = keyword.length === 0 || searchTarget.includes(keyword);

    // GUNAKAN FUNGSI STATIS
    const computedStatus = statusOf(item.stok);
    const matchStatus = status === "Semua Status Stok" || computedStatus === status;

    return matchSearch && matchStatus;
  });

  const handleRegister = (values: DistribusiFormValues) => {
    if (editItem) {
      const updatedItem = formToItem(editItem.id, values);
      const updatedProduct = { ...editItem, ...updatedItem };
      
      setProducts((prev) =>
        prev.map((p) => (p.id === editItem.id ? updatedProduct : p))
      );
      setNotice(`Produk "${updatedProduct.namaBarang}" berhasil diperbarui.`);
      setEditItem(null);
    } else {
      const newItem = formToItem(`WK-${Date.now().toString().slice(-6)}`, values);
      const newProduct = toProduct(newItem, "Didaftarkan dari Distribusi");

      setProducts((prev) => [newProduct, ...prev]);
      setNotice(`Produk "${newProduct.namaBarang}" berhasil didaftarkan.`);
    }
    setCategory(values.kategori);
    setRegisterOpen(false);
  };

  const handleDelete = (item: Product) => {
    const confirmed = window.confirm(`Hapus "${item.namaBarang}" dari stock list?`);
    if (!confirmed) return;

    setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
    setStockItems(stockItems.filter((entry) => entry.id !== item.id));
    setNotice(`Produk "${item.namaBarang}" telah dihapus.`);
  };

  const openEdit = (item: Product) => {
    setEditItem(item);
    setRegisterOpen(true);
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      setNotice("Tidak ada data untuk diexport.");
      return;
    }

    const header = [
      "Kode Barang", "Kategori", "Sub Kategori", "Nama Barang", "Supplier",
      "Spesifikasi", "Merek Ban", "Type Ban", "Item Velg", "GTY (Set)",
      "Harga Modal Asli", "Harga Tagihan Toko", "Harga Modal Toko",
      "Modal 1 Set", "Stok", "Status", "Pembayaran", "Tanggal", "Owner",
      "Payment Date", "Nomor Bon", "Notes",
    ].join(",");

    const rows = filteredItems.map((item) => {
      const spec =
        item.kategoriUtama === "Ban"
          ? `${item.ukuranTapak ?? ""}${item.ukuranTinggi ? `/${item.ukuranTinggi}` : ""}${item.ring ? ` ${item.ring}` : ""}`.trim()
          : `${item.ukuran}${item.ring ? ` ${item.ring}` : ""}`.trim();

      const currentStatus = statusOf(item.stok);

      return [
        item.id, item.kategoriUtama, item.subKategori, item.namaBarang,
        item.supplier, spec, item.merekBan ?? "", item.typeBan ?? "",
        item.item ?? "", item.gtySet ?? "", item.hargaModalAsli,
        item.hargaTagihanToko ?? "", item.hargaModalToko, item.modal1Set ?? "",
        item.stok, currentStatus, item.pembayaran ?? "", item.tanggal ?? "", item.owner ?? "",
        item.paymentDate ?? "", item.nomorBon ?? "", item.notes ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = `\uFEFF${[header, ...rows].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `StockList_${category}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice("Stock list berhasil dikonversi ke Excel (CSV).");
  };

  const handleExportDocument = () => {
    if (filteredItems.length === 0) {
      setNotice("Tidak ada data untuk diexport.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setNotice("Popup diblokir browser. Izinkan popup untuk mencetak.");
      return;
    }

    const isBan = category === "Ban";

    const rows = filteredItems
      .map((item) => {
        const spec = isBan
          ? `${item.ukuranTapak ?? ""}${item.ukuranTinggi ? `/${item.ukuranTinggi}` : ""}${item.ring ? ` ${item.ring}` : ""}`.trim()
          : `${item.ukuran}${item.ring ? ` ${item.ring}` : ""}`.trim();

        return `
          <tr>
            <td>${escapeHtml(item.id)}</td>
            <td>${escapeHtml(item.namaBarang)}</td>
            <td>${escapeHtml(item.supplier || "-")}</td>
            <td>${escapeHtml(spec || "-")}</td>
            <td>${item.hargaModalAsli.toLocaleString("id-ID")}</td>
            <td>${item.hargaTagihanToko?.toLocaleString("id-ID") ?? "-"}</td>
            <td>${item.hargaModalToko.toLocaleString("id-ID")}</td>
            <td>${item.stok}</td>
          </tr>`;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Stock List - ${escapeHtml(category)}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #18141b; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { color: #706a76; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d9d5dc; padding: 8px; text-align: left; }
            th { background: #f5f4f6; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; }
          </style>
        </head>
        <body>
          <h1>Stock List - Kategori ${escapeHtml(category)}</h1>
          <p>Dicetak ${new Date().toLocaleString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Supplier</th>
                <th>Spesifikasi</th>
                <th>Modal Asli</th>
                <th>Tagihan Toko</th>
                <th>Modal Toko</th>
                <th>Stok</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 400);
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isCsv = file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setNotice("File .xlsx belum diproses di demo frontend ini. Gunakan file .csv.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/);
      const filledLines = lines.filter((line) => line.trim().length > 0);
      const dataLines = filledLines.slice(1);

      const imported: Product[] = dataLines.map((line, index) => {
        const [
          namaBarang = "", supplier = "", ukuran = "", ring = "",
          asli = "0", toko = "0", stok = "0",
        ] = line.split(",");

        const item = formToItem(`IMP-${Date.now().toString().slice(-5)}-${index + 1}`, {
          kategori: category,
          subKategori: category === "Ban" ? "Import" : "Others",
          namaBarang, ukuran, ring,
          hargaModalAsli: asli, hargaModalToko: toko, stok,
          gambar: "", supplier,
        });

        return toProduct(item, `Diimport dari ${file.name}`);
      });

      if (imported.length === 0) {
        setNotice("Tidak ada baris data yang bisa diimport.");
        return;
      }

      setProducts((prev) => [...imported, ...prev]);
      setNotice(`${imported.length} produk berhasil diimport dari ${file.name}.`);
    };

    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Inventory
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Management Product Distributor
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Kelola pendaftaran barang, supplier, dan stok dalam satu tampilan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/profit"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <BarChart3 className="size-4 text-primary" />
              Lihat Profit
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditItem(null);
                setRegisterOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="size-4" />
              Register Produk Baru
            </button>
          </div>
        </header>

        <div className="inline-flex rounded-xl border border-border bg-card p-1 text-sm font-medium">
          <Link
            href="/products"
            className="rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Product Store
          </Link>
          <span className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            Product Distributor
          </span>
        </div>

        <section className="surface overflow-hidden" aria-label="Stock list distribusi">
          <div className="flex flex-col gap-3 border-b border-border px-4 pt-1 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center">
              <span className="flex items-center gap-2 border-b-2 border-primary px-4 py-3.5 text-sm font-semibold text-primary sm:px-5">
                <Box className="size-4" />
                Stock List
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditItem(null);
                  setRegisterOpen(true);
                }}
                className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-5"
              >
                <Plus className="size-4" />
                Register Produk Baru
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1">
              {(["Ban", "Others"] as const).map((tab) => {
                const TabIcon = tab === "Ban" ? Disc3 : Box;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCategory(tab)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      category === tab
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon className="size-3.5" />
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-border bg-muted/20 p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-4">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, merek, ukuran, supplier..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30 lg:col-span-2"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 lg:col-span-6 lg:justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"
              >
                <Upload className="size-4" />
                Import CSV
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-success px-3.5 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <FileSpreadsheet className="size-4" />
                Convert to Excel
              </button>
              <button
                type="button"
                onClick={handleExportDocument}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                PDF / Print
              </button>
            </div>
          </div>

          {notice && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-2.5 text-xs font-medium text-accent-foreground sm:px-6">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Tutup notifikasi"
                className="flex size-6 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-250 text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3.5 font-semibold sm:px-6">Kode</th>
                  <th className="px-4 py-3.5 font-semibold">Nama Barang</th>
                  <th className="px-4 py-3.5 font-semibold">Supplier</th>
                  <th className="px-4 py-3.5 font-semibold">Spesifikasi</th>
                  <th className="px-4 py-3.5 font-semibold">Harga (Modal / Toko)</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Stok</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-center font-semibold sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {!mounted ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-6 py-3">
                        <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Box className="size-6" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Belum ada barang terdaftar</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tambahkan produk baru lewat form register, atau import dari file CSV.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditItem(null);
                            setRegisterOpen(true);
                          }}
                          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          <Plus className="size-3.5" />
                          Register Produk Baru
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    // GUNAKAN FUNGSI STATIS
                    const stockStatus = statusOf(item.stok);

                    const statusClass =
                      stockStatus === "Wajib Pesan"
                        ? "bg-danger-soft text-danger"
                        : stockStatus === "Menipis"
                          ? "bg-warning-soft text-warning"
                          : "bg-success-soft text-success";

                    const spec =
                      item.kategoriUtama === "Ban"
                        ? `${item.ukuranTapak ?? ""}${item.ukuranTinggi ? `/${item.ukuranTinggi}` : ""} ${item.ring ? ` ${item.ring}` : ""}`.trim()
                        : `${item.ukuran ?? ""} ${item.ring ? ` ${item.ring}` : ""}`.trim();

                    return (
                      <tr key={item.id} className="group transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-muted-foreground sm:px-6">
                          {item.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">
                              {item.subKategori.slice(0, 3).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{item.namaBarang}</p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {item.subKategori}
                                {item.merekBan ? ` • ${item.merekBan} ${item.typeBan ?? ""}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {item.supplier || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {spec || "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-xs text-muted-foreground tabular-nums">
                              M: {rupiah.format(item.hargaModalAsli)}
                            </p>
                            <span className="text-muted-foreground/30">|</span>
                            <p className="font-mono text-sm font-semibold text-primary tabular-nums">
                              T: {rupiah.format(item.hargaModalToko)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">
                          {item.stok}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                            {stockStatus === "Wajib Pesan" && <TriangleAlert className="size-3.5" />}
                            {stockStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                              title="Edit Produk"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="rounded-xl p-2 text-muted-foreground transition-colors hover:border-danger/20 hover:bg-danger-soft hover:text-danger"
                              title="Hapus Produk"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <span>
              {mounted
                ? `Menampilkan ${filteredItems.length} dari ${categoryItems.length} produk ${category}`
                : "Memuat data…"}
            </span>
            <span className="font-mono tracking-wide uppercase">
              Data demo • frontend only
            </span>
          </div>
        </section>
      </div>

      {registerOpen && (
        <RegisterProductModal
          suppliers={supplierOptions}
          initialData={editItem}
          onClose={() => {
            setRegisterOpen(false);
            setEditItem(null);
          }}
          onSubmit={handleRegister}
        />
      )}
    </AppShell>
  );
}

export default function DistribusiPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat data...</div>}>
      <DistribusiContent />
    </Suspense>
  );
}
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Disc3,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RegisterProductModal } from "@/components/distribusi/register-product-modal";
import { rupiah } from "@/lib/dashboard-data";
import { useData, type Product } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import type { DistribusiFormValues } from "@/lib/distribusi-data";
import { formToItem } from "@/lib/distribusi-data";

// Fungsi Status Stok Statis
function statusOf(stok: number) {
  if (stok < 2) return "Wajib Pesan";
  if (stok <= 5) return "Menipis";
  return "Tersedia";
}

// Pindahkan logika konten ke komponen terpisah
function MasterDataContent() {
  const params = useParams();
  const router = useRouter();

  const isBan = params.kategori === "ban";
  const categoryName = isBan ? "Ban" : "Others";

  const { products, setProducts, suppliers } = useData();
  const can = useCan();

  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const supplierOptions = suppliers.map((s) => ({ name: s.name }));

  const filteredItems = products.filter((item) => {
    if (item.kategoriUtama !== categoryName) return false;

    const keyword = search.trim().toLowerCase();
    const searchTarget = [
      item.namaBarang,
      item.subKategori,
      item.supplier,
      item.merekBan,
      item.merekProduk,
      item.item
    ]
      .filter(Boolean).join(" ").toLowerCase();

    return keyword.length === 0 || searchTarget.includes(keyword);
  });

  const handleRegister = (values: DistribusiFormValues) => {
    if (editItem) {
      const updatedItem = formToItem(editItem.id, values);
      const updatedProduct = { ...editItem, ...updatedItem };
      setProducts((prev) => prev.map((p) => (p.id === editItem.id ? updatedProduct : p)));
      setNotice(`Data berhasil diperbarui.`);
      setEditItem(null);
    }
  };

  const handleDelete = (item: Product) => {
    const confirmed = window.confirm(`Hapus "${item.namaBarang}"?`);
    if (!confirmed) return;
    setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
    setNotice(`Data berhasil dihapus.`);
  };

  const formatMoney = (val?: number) => val ? rupiah.format(val) : "-";

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Master Data
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Kumpulan Data {categoryName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Daftar inventaris {categoryName.toLowerCase()} yang tersimpan di sistem.
            </p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border pb-4">
          <button
            onClick={() => router.push("/master-data/ban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isBan ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Disc3 className="size-4" /> Data Ban
          </button>
          <button
            onClick={() => router.push("/master-data/others")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              !isBan ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Box className="size-4" /> Data Others
          </button>
        </div>

        {/* Search Bar */}
        <div className="surface p-4 sm:p-5 rounded-2xl border border-border bg-card">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari data ${categoryName.toLowerCase()}...`}
              className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {notice && (
          <div className="flex items-center justify-between rounded-xl bg-primary-soft px-4 py-2.5 text-sm text-primary">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}><X className="size-4" /></button>
          </div>
        )}

        {/* Tabel Data dengan SEMUA KOLOM */}
        <div className="surface overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[3000px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3.5 font-semibold sm:px-6 sticky left-0 bg-muted/50 z-10">Kode</th>
                  <th className="px-4 py-3.5 font-semibold">Nama Barang</th>
                  <th className="px-4 py-3.5 font-semibold">Supplier</th>
                  <th className="px-4 py-3.5 font-semibold">Spesifikasi</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Stok</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Status</th>

                  <th className="px-4 py-3.5 text-right font-semibold">Modal Asli</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Harga Toko</th>
                  <th className="px-4 py-3.5 text-right font-semibold">GTY (Set)</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Standar Price</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Discount</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Dealer Price</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Dprice</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Raw Price</th>
                  <th className="px-4 py-3.5 text-right font-semibold">SSW Disc 2%</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Raw Price (Disc)</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Shipping Fee</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Shipping/Set</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Sub Total</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Modal 1 Set</th>
                  <th className="px-4 py-3.5 text-right font-semibold">UP</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Modal Toko</th>

                  <th className="px-4 py-3.5 font-semibold">Disc Type</th>
                  <th className="px-4 py-3.5 font-semibold">Payment Tipe</th>
                  <th className="px-4 py-3.5 font-semibold">Tanggal</th>
                  <th className="px-4 py-3.5 font-semibold">Pembayaran</th>
                  <th className="px-4 py-3.5 font-semibold">Kode Barang</th>
                  <th className="px-4 py-3.5 font-semibold">Arrival Date</th>
                  <th className="px-4 py-3.5 font-semibold">Stock Owner</th>
                  <th className="px-4 py-3.5 font-semibold">Payment Date</th>
                  <th className="px-4 py-3.5 font-semibold">Nomor Bon</th>
                  <th className="px-4 py-3.5 font-semibold">Notes</th>

                  <th className="px-4 py-3.5 text-center font-semibold sm:px-6 sticky right-0 bg-muted/50 z-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {!mounted ? (
                  <tr><td colSpan={32} className="p-6 text-center text-muted-foreground">Memuat data...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={32} className="p-10 text-center text-muted-foreground">Belum ada data {categoryName}.</td></tr>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = statusOf(item.stok);
                    const statusClass = stockStatus === "Wajib Pesan" ? "bg-danger-soft text-danger" : stockStatus === "Menipis" ? "bg-warning-soft text-warning" : "bg-success-soft text-success";

                    let spec = "-";
                    if (item.kategoriUtama === "Ban") {
                      spec = `${item.ukuranTapak ?? ""}${item.ukuranTinggi ? `/${item.ukuranTinggi}` : ""} ${item.ring ?? ""}`.trim();
                    } else if (item.subKategori === "Velg") {
                      spec = `${item.ring ?? ""} • ${item.wide ?? ""} • ${item.hole ?? ""} • ET ${item.et ?? ""}`.replace(/ • /g, " ").trim();
                    } else {
                      spec = item.ukuran || "-";
                    }

                    return (
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground sticky left-0 bg-card z-10 sm:px-6">{item.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium">{item.namaBarang}</p>
                          <p className="text-[11px] text-muted-foreground">{item.subKategori}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{item.supplier || "-"}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{spec || "-"}</td>
                        <td className="px-4 py-3.5 text-center">
                          <p className="font-mono font-semibold">{item.stok}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>{stockStatus}</span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">{formatMoney(item.hargaModalAsli)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-primary font-semibold">{formatMoney(item.hargaModalToko)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{item.gtySet ?? "-"}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.standarPrice)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.discount)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.dealerPrice)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.dprice)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.rawPrice)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{item.sswDisc2 ?? "-"}%</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.rawPriceAfterDisc)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.shippingFee)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.shippingPerSet)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.subTotalModalTP)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.modal1Set)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.up)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs">{formatMoney(item.modalToko)}</td>

                        <td className="px-4 py-3.5 text-xs">{item.discountType || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.paymentTipe || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.tanggal || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.pembayaran || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.kodeBarang || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.arrivalDate || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.stockOwner || "-"}</td>
                        <td className="px-4 py-3.5 text-xs">{item.paymentDate || "-"}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">{item.nomorBon || "-"}</td>
                        <td className="px-4 py-3.5 text-xs max-w-[200px] truncate" title={item.notes}>{item.notes || "-"}</td>

                        <td className="px-4 py-3.5 sticky right-0 bg-card z-10 sm:px-6">
                          <div className="flex justify-center gap-2">
                            {can("product", "edit") && (
                              <button
                                onClick={() => setEditItem(item)}
                                className="p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary rounded-lg transition-colors"
                                title="Edit Data"
                              >
                                <Pencil className="size-4" />
                              </button>
                            )}
                            {can("product", "delete") && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger rounded-lg transition-colors"
                                title="Hapus Data"
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

      {editItem && (
        <RegisterProductModal
          suppliers={supplierOptions}
          initialData={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={handleRegister}
        />
      )}
    </AppShell>
  );
}

// BUNGKUS DENGAN SUSPENSE UNTUK FIX ERROR USEPARAMS
export default function MasterDataPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat data...</div>}>
      <MasterDataContent />
    </Suspense>
  );
}

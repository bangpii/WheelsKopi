"use client";

import { useMemo, useState } from "react";
import { Box, Disc3, Layers, Search, Eye, X, ArrowDownRight, ArrowUpRight, Calendar } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";

type Category = "Ban" | "Others" | "Sorted";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

// Interface untuk baris tabel stok
interface StockRow {
  id: string;
  jenis: string;
  item: string;
  up: number;
  standarPrice: number;
  valuation: number;
  qty: number;
  qtyFinal: number;
  monthlyData: {
    in: number;
    out: number;
    close: number;
  }[];
}

export default function UpdateStockPage() {
   const { products, purchaseOrders } = useData();
// Mock data sementara untuk Sales (karena modul penjualan belum ada)
const sales: any[] = []; 
  const [activeTab, setActiveTab] = useState<Category>("Ban");
  const [query, setQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<{ productId: string; name: string } | null>(null);

  // 1. FILTER PRODUK BERDASARKAN TAB
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.kategoriUtama === activeTab);
  }, [products, activeTab]);

  // 2. HITUNG DATA TABEL STOK (IN, OUT, CLOSE)
  const stockRows = useMemo(() => {
    return categoryProducts.map((product) => {
      // Siapkan array 12 bulan (index 0 = Januari)
      const monthly = Array.from({ length: 12 }, () => ({ in: 0, out: 0, close: 0 }));

      // A. Hitung Barang Masuk (In) dari Purchase Orders yang Completed
      purchaseOrders.forEach((po) => {
        if (po.received && po.item === product.namaBarang) {
          const date = new Date(po.date);
          if (!Number.isNaN(date.getTime())) {
            const monthIdx = date.getMonth();
            monthly[monthIdx].in += po.qty;
          }
        }
      });

      // B. Hitung Barang Keluar (Out) dari Sales (Penjualan)
      sales.forEach((sale: any) => {
        // Asumsi sale.productId atau sale.item sama dengan product.id / namaBarang
        if (sale.productId === product.id || sale.item === product.namaBarang) {
          const date = new Date(sale.date);
          if (!Number.isNaN(date.getTime())) {
            const monthIdx = date.getMonth();
            monthly[monthIdx].out += sale.qty || 1;
          }
        }
      });

      // C. Hitung Running Total (Close) per Bulan
      let currentStock = product.stok; // Anggap stok saat ini adalah hasil akhir
      // Kita hitung mundur untuk mencari stok awal, atau hitung maju dengan asumsi stok awal 0.
      // Untuk simplifikasi, kita hitung maju (stok awal = 0) atau sesuaikan dengan data aktual.
      
      let runningStock = 0;
      monthly.forEach((m, idx) => {
        runningStock = runningStock + m.in - m.out;
        monthly[idx].close = runningStock;
      });

      // Sinkronisasi Qty tabel dengan data product saat ini
      const finalQty = product.stok;

      return {
        id: product.id,
        jenis: product.subKategori || product.kategoriUtama,
        item: product.namaBarang,
        up: product.up || product.standarPrice || 0,
        standarPrice: product.standarPrice || 0,
        valuation: (product.hargaModalToko || product.hargaModalAsli || 0) * finalQty,
        qty: finalQty,
        qtyFinal: finalQty,
        monthlyData: monthly,
      };
    });
  }, [categoryProducts, purchaseOrders, sales]);

  // 3. FILTER PENCARIAN
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return stockRows;
    return stockRows.filter(
      (row) =>
        row.item.toLowerCase().includes(normalized) ||
        row.jenis.toLowerCase().includes(normalized)
    );
  }, [stockRows, query]);

  // 4. MOCK DATA UNTUK DETAIL (Karena integrasi histori belum ada, kita buat generatif)
  const detailMovements = useMemo(() => {
    if (!selectedDetail) return [];
    const movements: any[] = [];
    
    // Ambil riwayat In dari PO
    purchaseOrders.forEach((po) => {
      if (po.received && po.item === selectedDetail.name) {
        movements.push({
          date: po.date,
          type: "In",
          qty: po.qty,
          note: `Purchase Order (${po.invoiceNumber || po.number})`,
        });
      }
    });

    // Ambil riwayat Out dari Sales
    sales.forEach((sale: any) => {
      if (sale.productId === selectedDetail.productId || sale.item === selectedDetail.name) {
        movements.push({
          date: sale.date,
          type: "Out",
          qty: sale.qty || 1,
          note: `Penjualan (${sale.invoiceNumber || "INV"})`,
        });
      }
    });

    // Urutkan berdasarkan tanggal
    return movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedDetail, purchaseOrders, sales]);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* HEADER & TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Update Stok</h1>
            <p className="text-sm text-muted-foreground">Pantau mutasi barang masuk dan keluar per tahun.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
            {(["Ban", "Others", "Sorted"] as const).map((tab) => {
              const Icon = tab === "Ban" ? Disc3 : tab === "Others" ? Box : Layers;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" /> {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari jenis atau nama barang..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* TABEL STOK */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2800px] border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Jenis</th>
                  <th className="sticky left-32 z-10 bg-muted/50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">UP</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Standar Price</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Valuation</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Qty Final</th>
                  
                  {MONTHS.map((m) => (
                    <th key={m} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground border-l border-border/50">
                      {m}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="px-4 py-12 text-center text-muted-foreground">
                      Belum ada data stok untuk kategori {activeTab}.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="transition hover:bg-muted/30">
                      <td className="sticky left-0 z-10 bg-card px-4 py-3 text-xs font-medium">{row.jenis}</td>
                      <td className="sticky left-32 z-10 bg-card px-4 py-3 text-xs font-semibold">{row.item}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{rupiah.format(row.up)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{rupiah.format(row.standarPrice)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{rupiah.format(row.valuation)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-primary">{row.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-success">{row.qtyFinal}</td>
                      
                      {/* DATA BULANAN */}
                      {row.monthlyData.map((m, idx) => (
                        <td key={idx} className="border-l border-border/50 px-2 py-3 text-center text-[11px]">
                          {m.in === 0 && m.out === 0 && m.close === 0 ? (
                            <span className="text-muted-foreground/30">-</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-success font-semibold" title="In">In: {m.in}</span>
                              <span className="text-danger font-semibold" title="Out">Out: {m.out}</span>
                              <span className="font-bold text-foreground mt-0.5 border-t border-border/50 pt-0.5" title="Close">Cls: {m.close}</span>
                            </div>
                          )}
                        </td>
                      ))}

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail({ productId: row.id, name: row.item })}
                          className="rounded-lg bg-muted p-2 text-muted-foreground transition hover:text-accent"
                          title="Detail Mutasi"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>Menampilkan {filteredRows.length} barang.</span>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL MUTASI */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Detail Mutasi Stok</h2>
                <p className="text-xs text-muted-foreground">{selectedDetail.name}</p>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {detailMovements.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Belum ada riwayat masuk/keluar untuk barang ini.</p>
              ) : (
                <div className="space-y-4">
                  {detailMovements.map((mov, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ${
                        mov.type === "In" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                      }`}>
                        {mov.type === "In" ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </div>
                      <div className="flex-1 rounded-xl border border-border bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${mov.type === "In" ? "text-success" : "text-danger"}`}>
                            {mov.type === "In" ? "Barang Masuk" : "Barang Keluar"} ({mov.qty} Qty)
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="size-3" /> {mov.date}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{mov.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-border bg-muted/20 px-6 py-4 text-right">
              <button onClick={() => setSelectedDetail(null)} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
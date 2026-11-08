"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Box,
  Disc3,
  ShoppingCart,
  CalendarDays,
  Filter,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";

export default function ProfitPage() {
  const { products, transactions } = useData();
  const [activeTab, setActiveTab] = useState<"Ban" | "Others">("Ban");

  // State untuk Filter Tanggal
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fungsi Terapkan Filter
  const handleApplyFilter = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  };

  // Fungsi Reset Filter
  const handleReset = () => {
    setDraftStartDate("");
    setDraftEndDate("");
    setStartDate("");
    setEndDate("");
  };

  // 1. FILTER TRANSAKSI BERDASARKAN RENTANG TANGGAL
  const filteredTransactions = transactions.filter((trx: any) => {
    if (!startDate && !endDate) return true;
    
    const trxDateStr = trx.tanggal || trx.date || trx.createdAt;
    if (!trxDateStr) return false;

    const trxDate = new Date(trxDateStr);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (trxDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (trxDate > end) return false;
    }
    return true;
  });

  // 2. HITUNG PRODUK TERLARIS BERDASARKAN TRANSAKSI ASLI
  const productSalesMap = new Map<string, number>();

  filteredTransactions.forEach((trx: any) => {
    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach((item: any) => {
        const currentQty = productSalesMap.get(item.productId) || 0;
        productSalesMap.set(item.productId, currentQty + (item.qty || 1));
      });
    } else if (trx.productId) {
      const currentQty = productSalesMap.get(trx.productId) || 0;
      productSalesMap.set(trx.productId, currentQty + (trx.qty || 1));
    }
  });

  const bestSellers = products
    .filter((p) => p.kategoriUtama === activeTab)
    .map((p) => ({
      ...p,
      sold: productSalesMap.get(p.id) || 0,
    }))
    .filter((p) => p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // 3. PRODUK YANG WAJIB RESTOCK (Stok < 2)
  const needRestock = products
    .filter((p) => p.kategoriUtama === activeTab && p.stok < 2)
    .sort((a, b) => a.stok - b.stok);

  // 4. HITUNG ESTIMASI PROFIT
  const totalPotentialProfit = bestSellers.reduce((acc, p) => {
    return acc + ((p.hargaModalToko - p.hargaModalAsli) * p.sold);
  }, 0);

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/distribusi"
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Profit & Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Pantau performa penjualan dan sisa stok yang kritis.
              </p>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Estimasi Potensi Profit
            </p>
            <p className="font-mono font-semibold text-success text-lg">
              {rupiah.format(totalPotentialProfit)}
            </p>
          </div>
        </header>

        {/* Filter Tanggal & Tabs */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-border pb-4">
          <div className="flex gap-2">
            {(["Ban", "Others"] as const).map((tab) => {
              const Icon = tab === "Ban" ? Disc3 : Box;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  Produk {tab}
                </button>
              );
            })}
          </div>

          {/* UI Filter Tanggal: Dari - Sampai */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <input
                type="date"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
                className="bg-transparent text-xs outline-none text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                title="Tanggal Mulai"
              />
            </div>
            <span className="text-muted-foreground text-xs font-medium px-1">s/d</span>
            <div className="flex items-center gap-2 px-2">
              <input
                type="date"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
                className="bg-transparent text-xs outline-none text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                title="Tanggal Selesai"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Filter className="size-3.5" />
              Terapkan
            </button>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset Filter"
                className="mr-1 p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger rounded-lg transition-colors"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel Kiri: Grafik Produk Laris */}
          <div className="surface p-6 rounded-2xl border border-border bg-card shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-6">
              <TrendingUp className="size-5 text-success" />
              Top 5 Produk {activeTab} Paling Laku
            </h2>
            
            {bestSellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <TrendingUp className="size-10 mb-2 opacity-20" />
                <p className="text-sm">Belum ada penjualan pada periode ini.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {bestSellers.map((p, index) => {
                  const maxSales = bestSellers[0]?.sold || 1;
                  const percentage = (p.sold / maxSales) * 100;
                  
                  return (
                    <div key={p.id} className="space-y-2">
                      <div className="flex justify-between text-sm items-end">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                            #{index + 1}
                          </span>
                          <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                            {p.namaBarang}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs font-mono">
                          {p.sold} terjual
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel Kanan: Wajib Restock */}
          <div className="surface p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <AlertTriangle className="size-5 text-warning" />
              Wajib di Pesan (Restock)
            </h2>
            
            {needRestock.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Box className="size-10 mb-2 opacity-20" />
                <p className="text-sm">Semua stok dalam kondisi aman.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50 flex-1">
                {needRestock.map((p) => {
                  const isHabis = p.stok <= 0;
                  
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {p.namaBarang}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Sisa stok: {p.stok} unit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-semibold text-sm ${isHabis ? "text-danger" : "text-warning"}`}>
                          {isHabis ? "Habis" : "Menipis"}
                        </p>
                        <Link 
                          href="/distribusi"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ShoppingCart className="size-3" />
                          Pesan Sekarang
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
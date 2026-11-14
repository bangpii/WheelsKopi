"use client";

import { useState } from "react";
import { CalendarDays, RotateCcw, Trash2 } from "lucide-react"; // Tambahkan Trash2
import { AppShell } from "@/components/app-shell";
import { CategoryCard } from "@/components/dashboard/category-card";
import { InsightGrid } from "@/components/dashboard/insight-grid";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { OverviewHighlights } from "@/components/dashboard/overview-highlights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { StockTable } from "@/components/dashboard/stock-table";
import { useCan, useIsAdministrator } from "@/lib/permissions";

export default function DashboardPage() {
  const can = useCan();
  const isAdministrator = useIsAdministrator();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter realtime: tanggal yang dipilih langsung dipakai semua konten.
  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // FUNGSI UNTUK MENGHAPUS SEMUA DATA (RESET)
  const handleResetData = () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin mereset SEMUA data aplikasi? Semua data yang sudah diinput akan dihapus."
    );

    if (confirmed) {
      // Hapus semua data yang berawalan wheelskopi_ di Local Storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("wheelskopi_")) {
          localStorage.removeItem(key);
        }
      });
      // Refresh halaman agar DataProvider mengisi kembali data awal.
      window.location.reload();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">
        <section
          id="overview"
          data-aos="fade-up"
          className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              WheelsKopi Admin
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Dashboard Kepala Toko
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              Pantau stok ban, penjualan, transaksi, pelanggan, dan supplier
              dalam satu tampilan terpusat.
            </p>
          </div>
          
          {/* UI Filter Tanggal + Tombol Reset Data */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm">
              <div className="flex items-center gap-2 px-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-7 bg-transparent px-0.5 text-xs outline-none text-foreground cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  title="Tanggal Mulai"
                />
              </div>
              <span className="text-muted-foreground text-xs font-medium px-1">s/d</span>
              <div className="flex items-center gap-2 px-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-7 bg-transparent px-0.5 text-xs outline-none text-foreground cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  title="Tanggal Selesai"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  title="Reset Filter"
                  className="mr-1 p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger rounded-lg transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>

            {/* TOMBOL RESET DATA BARU */}
            {isAdministrator && (
              <button
                type="button"
                onClick={handleResetData}
                title="Hapus Semua Data"
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="size-3.5" />
                Reset Data
              </button>
            )}
          </div>
        </section>

        <OverviewHighlights startDate={startDate} endDate={endDate} />
        <KpiGrid startDate={startDate} endDate={endDate} />

        <section id="penjualan" className="grid gap-4 lg:grid-cols-12">
          <RevenueCard startDate={startDate} endDate={endDate} />
          <CategoryCard startDate={startDate} endDate={endDate} />
        </section>

        <section id="stok" className="grid gap-4 lg:grid-cols-12">
          <StockTable startDate={startDate} endDate={endDate} />
          <RecentTransactions startDate={startDate} endDate={endDate} />
        </section>

        <section id="pelanggan" className="grid gap-4">
          <InsightGrid startDate={startDate} endDate={endDate} />
        </section>

        <section id="supplier" className="grid gap-4">
          <section
            data-aos="fade-up"
            className="glow-surface surface flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
            aria-label="Aksi cepat"
          >
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                Aksi Cepat
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Cetak nota, buat PO, cek aging piutang, atau input penerimaan
                barang.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {can("sellout", "input") && (
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Buat Penjualan Baru
                </button>
              )}
              {can("purchase-order", "input") && (
                <button
                  type="button"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
                >
                  Purchase Order
                </button>
              )}
              {can("receipt", "input") && (
                <button
                  type="button"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
                >
                  Penerimaan Barang
                </button>
              )}
              {can("report", "view") && (
                <button
                  type="button"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
                >
                  Laporan Stok
                </button>
              )}
            </div>
          </section>
        </section>

        <section
          id="laporan"
          className="py-4 text-center text-xs text-muted-foreground"
        >
          © 2026 WheelsKopi. Sistem ERP Ban, Velg &amp; Aksesoris.
        </section>
      </div>
    </AppShell>
  );
}
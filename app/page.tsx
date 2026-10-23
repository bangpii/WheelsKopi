import { AppShell } from "@/components/app-shell";
import { CategoryCard } from "@/components/dashboard/category-card";
import { InsightGrid } from "@/components/dashboard/insight-grid";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { StockTable } from "@/components/dashboard/stock-table";



export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">
        <section
          id="overview"
          data-aos="fade-up"
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              WheelsKopi Admin
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Dashboard Administrator
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              Pantau stok ban, penjualan, transaksi, pelanggan, dan supplier dalam satu tampilan terpusat.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-1">Update: hari ini</span>
            <span className="rounded-full border border-border px-2.5 py-1">Tahun 2026</span>
          </div>
        </section>

        <KpiGrid />

        <section id="penjualan" className="grid gap-4 lg:grid-cols-12">
          <RevenueCard />
          <CategoryCard />
        </section>

        <section id="stok" className="grid gap-4 lg:grid-cols-12">
          <StockTable />
          <RecentTransactions />
        </section>

        <section id="pelanggan" className="grid gap-4">
          <InsightGrid />
        </section>

        <section id="supplier" className="grid gap-4">
          <section
            data-aos="fade-up"
            className="surface flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
            aria-label="Aksi cepat"
          >
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">Aksi Cepat</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Cetak nota, buat PO, cek aging piutang, atau input penerimaan barang.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Buat Penjualan Baru
              </button>
              <button
                type="button"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                Purchase Order
              </button>
              <button
                type="button"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                Penerimaan Barang
              </button>
              <button
                type="button"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                Laporan Stok
              </button>
            </div>
          </section>
        </section>

        <section id="laporan" className="py-4 text-center text-xs text-muted-foreground">
          © 2026 WheelsKopi. Sistem ERP Ban, Velg &amp; Aksesoris.
        </section>
      </div>
    </AppShell>
  );
}

import { ArrowUpRight } from "lucide-react";
import { customers, monthlyTarget, suppliers, topProducts } from "@/lib/dashboard-data";

const targetPercent = Math.min(100, monthlyTarget.percent);

export function InsightGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section
        data-aos="fade-up"
        className="surface overflow-hidden p-5 sm:p-6"
        aria-label="Produk teratas"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">Top Produk</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Berdasarkan nilai penjualan</p>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Lihat semua
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted font-display text-xs font-semibold">
                0{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{product.brand}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm tabular-nums">
                  {(product.revenue / 1000000).toFixed(1)} jt
                </p>
                <p className="text-[11px] text-muted-foreground">{product.sold} terjual</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        data-aos="fade-up"
        data-aos-delay="70"
        className="surface overflow-hidden p-5 sm:p-6"
        aria-label="Target penjualan"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">Target Penjualan</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">{monthlyTarget.label}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            <ArrowUpRight className="size-3.5" />
            {targetPercent}%
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {(monthlyTarget.achieved / 1000000).toFixed(1)} jt
          </p>
          <p className="text-xs text-muted-foreground">dari {(monthlyTarget.target / 1000000).toFixed(0)} jt</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--chart-2)] transition-all duration-1000"
            style={{ width: `${targetPercent}%` }}
          />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Pelanggan Prioritas</p>
          <div className="mt-3 space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.name}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-[11px] font-semibold text-accent-foreground">
                  {customer.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{customer.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {customer.type} • {customer.orders} order
                  </p>
                </div>
                <p className="font-mono text-sm tabular-nums">{(customer.spend / 1000000).toFixed(1)} jt</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        data-aos="fade-up"
        data-aos-delay="140"
        className="surface overflow-hidden p-5 sm:p-6"
        aria-label="Supplier aktif"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">Supplier</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Monitoring lead time pengiriman</p>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Kelola
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {suppliers.map((supplier) => (
            <div
              key={supplier.name}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/60"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">
                {supplier.brand.slice(0, 3).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{supplier.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">Lead time {supplier.leadTime}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  supplier.status === "Aktif" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                }`}
              >
                {supplier.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold">Restock Minggu Ini</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            6 PO menunggu konfirmasi dari supplier prioritas.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted/60"
          >
            Lihat Purchase Order
          </button>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useData } from "@/lib/context/data-context";
import {
  customerNameOf,
  filterTransactions,
} from "@/lib/dashboard-filter";
import type { Transaction } from "@/lib/dashboard-data";

interface InsightGridProps {
  startDate?: string;
  endDate?: string;
}

interface ProductSales {
  id: string;
  name: string;
  brand: string;
  category: "Ban" | "Others";
  sold: number;
  revenue: number;
}

interface CustomerSales {
  name: string;
  type: string;
  orders: number;
  spend: number;
  initials: string;
}

const SALES_TARGET = 50000000;

function customerType(name: string): string {
  if (name.includes("Toko")) return "Reseller";
  if (name.includes("Bengkel")) return "Bengkel";
  if (name.includes("Komunitas") || name.includes("Club")) return "Komunitas";

  return "Perorangan";
}

function buildTopProducts(
  transactions: Transaction[],
  products: ReturnType<typeof useData>["products"],
): ProductSales[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const sales = new Map<string, ProductSales>();

  for (const trx of transactions) {
    for (const line of trx.lines ?? []) {
      const product = productMap.get(line.productId);

      if (!product) continue;

      const entry = sales.get(product.id) ?? {
        id: product.id,
        name: product.namaBarang,
        brand: product.merekBan || product.merekProduk || product.subKategori,
        category: product.kategoriUtama,
        sold: 0,
        revenue: 0,
      };

      entry.sold += line.qty;
      entry.revenue += line.qty * (product.hargaModalToko || 0);
      sales.set(product.id, entry);
    }
  }

  return Array.from(sales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
}

function buildCustomers(transactions: Transaction[]): CustomerSales[] {
  const grouped = new Map<string, CustomerSales>();

  for (const trx of transactions) {
    const name = customerNameOf(trx);
    const entry = grouped.get(name) ?? {
      name,
      type: customerType(name),
      orders: 0,
      spend: 0,
      initials: name
        .split(" ")
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase(),
    };

    entry.orders += 1;
    entry.spend += trx.total || 0;
    grouped.set(name, entry);
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 4);
}

export function InsightGrid({ startDate, endDate }: InsightGridProps) {
  const { products, transactions, suppliers } = useData();
  const filteredTransactions = filterTransactions(
    transactions,
    startDate,
    endDate,
  );
  const topProducts = buildTopProducts(filteredTransactions, products);
  const customers = buildCustomers(filteredTransactions);
  const achieved = filteredTransactions.reduce(
    (sum, trx) => sum + (trx.total || 0),
    0,
  );
  const targetPercent = Math.min(
    100,
    Math.round((achieved / SALES_TARGET) * 100),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section
        data-aos="fade-up"
        className="glow-surface surface overflow-hidden p-5 sm:p-6"
        aria-label="Produk teratas"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              Top Produk
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Berdasarkan nilai penjualan
            </p>
          </div>
          <Link
            href="/distribusi"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Lihat semua
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {topProducts.length === 0 ? (
            <p className="rounded-xl bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
              Belum ada penjualan pada periode ini.
            </p>
          ) : (
            topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/distribusi?tab=${product.category === "Ban" ? "ban" : "others"}`}
                className="flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted font-display text-xs font-semibold">
                  0{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {product.brand}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums">
                    {(product.revenue / 1000000).toFixed(1)} jt
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {product.sold} terjual
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section
        data-aos="fade-up"
        data-aos-delay="70"
        className="glow-surface surface overflow-hidden p-5 sm:p-6"
        aria-label="Target penjualan"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              Target Penjualan
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Akumulasi periode aktif
            </p>
          </div>
          <Link
            href="/profit"
            className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success transition-colors hover:bg-success/15"
          >
            <ArrowUpRight className="size-3.5" />
            {targetPercent}%
          </Link>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {(achieved / 1000000).toFixed(1)} jt
          </p>
          <p className="text-xs text-muted-foreground">
            dari {(SALES_TARGET / 1000000).toFixed(0)} jt
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--chart-2)] transition-all duration-1000"
            style={{ width: `${targetPercent}%` }}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Pelanggan Prioritas</p>
            <Link
              href="/customers"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              Semua
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {customers.length === 0 ? (
              <p className="rounded-xl bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
                Belum ada pelanggan pada periode ini.
              </p>
            ) : (
              customers.map((customer) => (
                <Link
                  key={customer.name}
                  href="/customers"
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-[11px] font-semibold text-accent-foreground">
                    {customer.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {customer.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {customer.type} • {customer.orders} order
                    </p>
                  </div>
                  <p className="font-mono text-sm tabular-nums">
                    {(customer.spend / 1000000).toFixed(1)} jt
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section
        data-aos="fade-up"
        data-aos-delay="140"
        className="glow-surface surface overflow-hidden p-5 sm:p-6"
        aria-label="Supplier aktif"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              Supplier
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Monitoring lead time pengiriman
            </p>
          </div>
          <Link
            href="/suppliers"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Kelola
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {suppliers.length === 0 ? (
            <p className="rounded-xl bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
              Belum ada supplier terdaftar.
            </p>
          ) : (
            suppliers.map((supplier) => (
              <Link
                key={supplier.id}
                href="/suppliers"
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">
                  {supplier.name.slice(0, 3).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{supplier.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {supplier.contactPerson || supplier.email}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {supplier.tipe}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold">Restock Minggu Ini</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Cek produk yang stoknya sudah melewati batas minimum.
          </p>
          <Link
            href="/purchase-orders"
            className="mt-3 block w-full rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/60"
          >
            Lihat Purchase Order
          </Link>
        </div>
      </section>
    </div>
  );
}

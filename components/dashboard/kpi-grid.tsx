"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, PackageCheck, TriangleAlert, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";

interface KpiGridProps {
  startDate?: string;
  endDate?: string;
}

const ICONS = [Wallet, PackageCheck, Boxes, TriangleAlert];

function toPoints(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// PERHATIKAN: Menggunakan "export function", BUKAN "export default function"
export function KpiGrid({ startDate, endDate }: KpiGridProps) {
  const { products, transactions } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. FILTER TRANSAKSI BERDASARKAN TANGGAL
  const filteredTransactions = transactions.filter((trx) => {
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

  // 2. HITUNG DATA DINAMIS
  const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalUnits = filteredTransactions.reduce(
    (acc, curr) =>
      acc +
      (curr.lines
        ? curr.lines.reduce((lineSum, line) => lineSum + line.qty, 0)
        : curr.items || 0),
    0,
  );
  const criticalStock = products.filter((p) => p.stok < 2).length;

  // 3. SUSUN DATA KPI
  const dynamicKpis = [
    {
      label: "Total Pendapatan",
      value: rupiah.format(totalRevenue),
      change: "+12.5%",
      trend: "up" as const,
      hint: startDate || endDate ? "dari filter tanggal" : "total keseluruhan",
      spark: [10, 15, 8, 22, 18, 30, 25],
      href: "/profit",
    },
    {
      label: "Unit Terjual",
      value: totalUnits.toString(),
      change: "+8.2%",
      trend: "up" as const,
      hint: "unit dari transaksi",
      spark: [5, 8, 12, 10, 15, 20, 18],
      href: "/profit",
    },
    {
      label: "Total Produk",
      value: products.length.toString(),
      change: "+2.1%",
      trend: "up" as const,
      hint: "produk aktif",
      spark: [20, 22, 24, 24, 26, 28, 30],
      href: "/products",
    },
    {
      label: "Perlu Restock",
      value: criticalStock.toString(),
      change: "-1.5%",
      trend: "down" as const,
      hint: "SKU di bawah batas",
      spark: [10, 8, 9, 5, 4, 3, 3],
      href: "/stock-list",
    },
  ];

  if (!mounted) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface p-5 h-[180px] animate-pulse bg-muted/40 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dynamicKpis.map((kpi, index) => {
        const Icon = ICONS[index] ?? Wallet;
        const positive = kpi.trend === "up";
        const TrendIcon = positive ? TrendingUp : TrendingDown;

        return (
          <Link 
            href={kpi.href} 
            key={kpi.label}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            <article
              data-aos="fade-up"
              data-aos-delay={index * 70}
              className="glow-surface surface group relative h-full cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {kpi.label}
                </p>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-4.5" />
                </span>
              </div>

              <p className="font-display mt-3 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
                {kpi.value}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                    positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}
                >
                  <TrendIcon className="size-3.5" />
                  {kpi.change}
                </span>
                <span className="text-muted-foreground">{kpi.hint}</span>
              </div>

              <svg
                viewBox="0 0 100 32"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="mt-4 h-9 w-full overflow-visible"
              >
                <polyline
                  points={toPoints(kpi.spark)}
                  fill="none"
                  stroke={positive ? "var(--success)" : "var(--danger)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.9"
                />
              </svg>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
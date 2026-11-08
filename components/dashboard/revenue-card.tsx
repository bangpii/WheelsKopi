"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";

const WIDTH = 720;
const HEIGHT = 236;
const PAD_X = 8;
const PAD_TOP = 18;
const PAD_BOTTOM = 12;

interface RevenueCardProps {
  startDate?: string;
  endDate?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  const clamp = (index: number) => Math.max(0, Math.min(points.length - 1, index));
  let path = `M${points[0][0]},${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[clamp(index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[clamp(index + 2)];
    const k = 0.16;
    path += `C${p1[0] + (p2[0] - p0[0]) * k},${p1[1] + (p2[1] - p0[1]) * k} ${p2[0] - (p3[0] - p1[0]) * k},${p2[1] - (p3[1] - p1[1]) * k} ${p2[0]},${p2[1]}`;
  }
  return path;
}

export function RevenueCard({ startDate, endDate }: RevenueCardProps) {
  const { transactions } = useData();
  const [mounted, setMounted] = useState(false);
  
  // Pindahkan inisialisasi tahun ke dalam state
  const [currentYear, setCurrentYear] = useState<number>(2026); // Default statis untuk SSR

  useEffect(() => {
    setMounted(true);
    // Set tahun asli saat sudah berjalan di browser
    setCurrentYear(new Date().getFullYear());
  }, []);

  // 1. FILTER TRANSAKSI
  const filteredTransactions = transactions.filter((trx: any) => {
    if (!startDate && !endDate) return true;
    const trxDateStr = trx.tanggal || trx.date || trx.createdAt;
    if (!trxDateStr) return false;
    const trxDate = new Date(trxDateStr);
    if (startDate && trxDate < new Date(new Date(startDate).setHours(0,0,0,0))) return false;
    if (endDate && trxDate > new Date(new Date(endDate).setHours(23,59,59,999))) return false;
    return true;
  });

  // 2. HITUNG PENDAPATAN PER BULAN
  const monthlyData = MONTHS.map((monthName, index) => {
    const monthTransactions = filteredTransactions.filter((t: any) => {
      const dateStr = t.tanggal || t.date || t.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === index && d.getFullYear() === currentYear;
    });
    
    const total = monthTransactions.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);
    return { month: monthName, value: total };
  });

  const dynamicRevenue = filteredTransactions.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);

  // 3. LOGIKA GRAFIK
  const values = monthlyData.map((point) => point.value);
  const maxVal = Math.max(...values, 100000);
  const minimum = 0;
  const maximum = maxVal * 1.1;
  
  const span = (maximum - minimum) || 1; 

  const points: [number, number][] = values.map((value, index) => {
    const x = PAD_X + (index / (values.length - 1)) * (WIDTH - PAD_X * 2);
    const safeValue = isNaN(value) ? 0 : value;
    const y = PAD_TOP + (1 - (safeValue - minimum) / span) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
    return [x, y];
  });

  const line = smoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line}L${last[0]},${HEIGHT}L${first[0]},${HEIGHT}Z`;

  return (
    <section data-aos="fade-up" className="surface flex flex-col p-5 sm:p-6 lg:col-span-8" aria-label="Performa penjualan">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">Performa Penjualan</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {startDate || endDate ? "Data pendapatan berdasarkan filter tanggal" : "Pendapatan 12 bulan terakhir"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-1 text-xs font-medium">
          <span className="rounded-lg bg-card px-3 py-1.5 text-foreground shadow-sm">12 Bulan</span>
          <span className="px-3 py-1.5 text-muted-foreground">30 Hari</span>
          <span className="px-3 py-1.5 text-muted-foreground">7 Hari</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">
          {mounted ? rupiah.format(dynamicRevenue) : "Rp 0"}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
          <ArrowUpRight className="size-3.5" /> 12,8%
        </span>
        <span className="text-xs text-muted-foreground">vs. bulan lalu</span>
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Grafik pendapatan" className="h-auto w-full overflow-visible">
          <defs>
            <linearGradient id="revenue-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--chart-4)" />
              <stop offset="55%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-2)" />
            </linearGradient>
            <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = PAD_TOP + ratio * (HEIGHT - PAD_TOP - PAD_BOTTOM);
            return <line key={ratio} x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="4 6" />;
          })}

          <path d={area} fill="url(#revenue-area)" />
          <path d={line} pathLength={1} fill="none" stroke="url(#revenue-line)" strokeWidth="3" strokeLinecap="round" className="chart-line" />

          {points.map((point, index) => (
            <circle key={index} cx={point[0]} cy={point[1]} r="3.5" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="2" opacity={index === points.length - 1 ? 1 : 0} />
          ))}

          <circle cx={last[0]} cy={last[1]} r="6" fill="var(--chart-2)" opacity="0.18" />
          <circle cx={last[0]} cy={last[1]} r="4" fill="var(--chart-2)" stroke="var(--card)" strokeWidth="2" />
        </svg>

        <div className="mt-3 grid grid-cols-12 gap-1 px-0.5 text-center text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          {monthlyData.map((point) => (
            <span key={point.month}>{point.month}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
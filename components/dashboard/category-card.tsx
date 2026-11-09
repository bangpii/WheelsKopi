"use client";

import Link from "next/link";
import { useData } from "@/lib/context/data-context";

interface CategoryCardProps {
  startDate?: string;
  endDate?: string;
}

export function CategoryCard({ startDate, endDate }: CategoryCardProps) {
  const { products, transactions } = useData();

  // Filter transaksi
  const filteredTransactions = transactions.filter((trx) => {
    if (!startDate && !endDate) return true;
    const trxDateStr = trx.tanggal || trx.date || trx.createdAt;
    if (!trxDateStr) return false;
    const trxDate = new Date(trxDateStr);
    if (startDate && trxDate < new Date(new Date(startDate).setHours(0,0,0,0))) return false;
    if (endDate && trxDate > new Date(new Date(endDate).setHours(23,59,59,999))) return false;
    return true;
  });

  // Hitung qty per kategori
  let totalBan = 0;
  let totalVelg = 0;
  let totalAksesoris = 0;

  filteredTransactions.forEach((trx) => {
    trx.lines?.forEach((line) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product) return;

      const qty = line.qty || 1;
      if (product.kategoriUtama === "Ban") totalBan += qty;
      else if (product.subKategori === "Velg") totalVelg += qty;
      else totalAksesoris += qty;
    });
  });

  const totalUnit = totalBan + totalVelg + totalAksesoris;
  const percentBan = totalUnit === 0 ? 0 : Math.round((totalBan / totalUnit) * 100);
  const percentVelg = totalUnit === 0 ? 0 : Math.round((totalVelg / totalUnit) * 100);
  const percentAksesoris = totalUnit === 0 ? 0 : Math.round((totalAksesoris / totalUnit) * 100);

  // Kalkulasi SVG Donat
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharrayBan = `${(percentBan / 100) * circumference} ${circumference}`;
  const strokeDasharrayVelg = `${(percentVelg / 100) * circumference} ${circumference}`;
  const strokeDasharrayAksesoris = `${(percentAksesoris / 100) * circumference} ${circumference}`;

  const offsetBan = 0;
  const offsetVelg = (percentBan / 100) * circumference;
  const offsetAksesoris = ((percentBan + percentVelg) / 100) * circumference;

  return (
    <div className="surface p-6 rounded-2xl border border-border bg-card lg:col-span-4">
      <h2 className="font-display text-base font-semibold tracking-tight">Kategori Terlaris</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">Proporsi unit terjual</p>
      
      <div className="mt-6 flex justify-center relative">
        <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--muted)" strokeWidth="15" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="15" strokeDasharray={strokeDasharrayBan} strokeDashoffset={-offsetBan} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f87171" strokeWidth="15" strokeDasharray={strokeDasharrayVelg} strokeDashoffset={-offsetVelg} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fca5a5" strokeWidth="15" strokeDasharray={strokeDasharrayAksesoris} strokeDashoffset={-offsetAksesoris} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">TOTAL</span>
          <span className="text-2xl font-bold">{totalUnit}</span>
          <span className="text-xs text-muted-foreground">Unit</span>
        </div>
      </div>

      <div className="mt-8 space-y-3 text-sm">
        <Link
          href="/distribusi?tab=ban"
          className="flex justify-between items-center rounded-lg px-1 py-1 transition-colors hover:bg-muted/60"
        >
          <span className="flex items-center gap-2"><div className="size-2 bg-red-500 rounded-full" /> Ban</span>
          <span className="font-semibold">{percentBan}%</span>
        </Link>
        <Link
          href="/distribusi?tab=others"
          className="flex justify-between items-center rounded-lg px-1 py-1 transition-colors hover:bg-muted/60"
        >
          <span className="flex items-center gap-2"><div className="size-2 bg-red-400 rounded-full" /> Velg</span>
          <span className="font-semibold">{percentVelg}%</span>
        </Link>
        <Link
          href="/distribusi?tab=others"
          className="flex justify-between items-center rounded-lg px-1 py-1 transition-colors hover:bg-muted/60"
        >
          <span className="flex items-center gap-2"><div className="size-2 bg-red-300 rounded-full" /> Aksesoris</span>
          <span className="font-semibold">{percentAksesoris}%</span>
        </Link>
      </div>
    </div>
  );
}
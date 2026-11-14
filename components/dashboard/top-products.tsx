"use client";

import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";

interface TopProductsProps {
  startDate?: string;
  endDate?: string;
}

export function TopProducts({ startDate, endDate }: TopProductsProps) {
  const { products, transactions } = useData();

  // Filter transaksi berdasarkan tanggal
  const filteredTransactions = transactions.filter((trx: any) => {
    if (!startDate && !endDate) return true;
    const trxDateStr = trx.tanggal || trx.date || trx.createdAt;
    if (!trxDateStr) return false;
    const trxDate = new Date(trxDateStr);
    if (startDate && trxDate < new Date(new Date(startDate).setHours(0,0,0,0))) return false;
    if (endDate && trxDate > new Date(new Date(endDate).setHours(23,59,59,999))) return false;
    return true;
  });

  // KELOMPOKKAN DAN HITUNG PENJUALAN PER PRODUK
  const productSales = products.map((prod) => {
    const sold = filteredTransactions
      .filter((trx: any) => trx.productId === prod.id)
      .reduce((sum: number, trx: any) => sum + (trx.qty || 1), 0);
    return { ...prod, sold };
  });

  // URUTKAN DARI YANG PALING LARIS
  const topProducts = productSales
    .filter((p) => p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  return (
    <div className="glow-surface surface p-6 rounded-2xl border border-border bg-card">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-base font-semibold">Top Produk</h2>
        <button className="text-xs text-primary hover:underline">Lihat semua</button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Berdasarkan nilai penjualan</p>

      <div className="space-y-4">
        {topProducts.map((prod, idx) => (
          <div key={prod.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-medium text-sm">{prod.namaBarang}</p>
                <p className="text-xs text-muted-foreground">{prod.subKategori}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold">
                {rupiah.format(prod.hargaModalToko * prod.sold)}
              </p>
              <p className="text-xs text-muted-foreground">{prod.sold} terjual</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
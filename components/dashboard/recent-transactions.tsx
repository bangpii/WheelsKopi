"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle, Package } from "lucide-react";
import { rupiah } from "@/lib/dashboard-data";
import { useData } from "@/lib/context/data-context";

interface RecentTransactionsProps {
  startDate?: string;
  endDate?: string;
}

const STATUS_ICON = {
  Lunas: CheckCircle2,
  Proses: Clock3,
  Batal: XCircle,
} as const;

const STATUS_STYLE = {
  Lunas: "bg-success-soft text-success",
  Proses: "bg-warning-soft text-warning",
  Batal: "bg-danger-soft text-danger",
} as const;

function shortDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function RecentTransactions({ startDate, endDate }: RecentTransactionsProps) {
  const { transactions } = useData();
  const [mounted, setMounted] = useState(false);

  // Fix Hydration Error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Logika Filter Tanggal
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

  return (
    <section
      data-aos="fade-up"
      data-aos-delay="80"
      className="surface flex flex-col p-5 sm:p-6 lg:col-span-4"
      aria-label="Transaksi terbaru"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Transaksi Terbaru
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {startDate || endDate ? "Berdasarkan filter tanggal" : "Aktivitas kasir terbaru"}
          </p>
        </div>
        <Link
          href="/profit"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Lihat semua
        </Link>
      </div>

      <div className="mt-4 flex-1">
        {/* CEK MOUNTED SEBELUM MERENDER LIST */}
        {!mounted ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Package className="size-10 mb-2 opacity-20" />
            <p className="text-sm">Belum ada transaksi pada periode ini.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredTransactions.slice(0, 5).map((transaction) => {
              const safeStatus = (transaction.status as keyof typeof STATUS_ICON) || "Proses";
              const Icon = STATUS_ICON[safeStatus];
              const style = STATUS_STYLE[safeStatus];

              return (
                <li
                  key={transaction.id}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${style}`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {transaction.customer || "Pelanggan Umum"}
                      </p>
                      <p className="font-mono text-sm font-medium tabular-nums">
                        {rupiah.format(transaction.total || 0)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <p className="truncate">
                        {transaction.id} • {transaction.items || 0} item • {transaction.method || "Cash"}
                      </p>
                      <p>
                        {shortDate(transaction.tanggal || transaction.date || transaction.createdAt) ||
                          transaction.time ||
                          "-"}
                        {transaction.time && (transaction.tanggal || transaction.date || transaction.createdAt)
                          ? ` • ${transaction.time}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
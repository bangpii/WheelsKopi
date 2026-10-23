import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { rupiah, transactions } from "@/lib/dashboard-data";

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

export function RecentTransactions() {
  return (
    <section
      data-aos="fade-up"
      data-aos-delay="80"
      className="surface flex flex-col p-5 sm:p-6 lg:col-span-4"
      aria-label="Transaksi terbaru"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">Transaksi Terbaru</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Aktivitas kasir hari ini</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Lihat semua
        </button>
      </div>

      <div className="mt-4 flex-1">
        <ul className="space-y-1">
          {transactions.map((transaction) => {
            const Icon = STATUS_ICON[transaction.status];
            const style = STATUS_STYLE[transaction.status];

            return (
              <li
                key={transaction.id}
                className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl ${style}`}
                >
                  <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{transaction.customer}</p>
                    <p className="font-mono text-sm font-medium tabular-nums">
                      {rupiah.format(transaction.total)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <p className="truncate">
                      {transaction.id} • {transaction.items} item • {transaction.method}
                    </p>
                    <p>{transaction.time}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

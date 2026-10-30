import Link from "next/link";
import { ArrowUpRight, Megaphone, Package, Users } from "lucide-react";
import { stockListRecords } from "@/lib/operations-data";
import { customers, news } from "@/lib/warehouse-data";

export function OverviewHighlights() {
  return (
    <section
      className="grid gap-4 lg:grid-cols-12"
      aria-label="Ringkasan overview"
    >
      <Link
        href="/products"
        className="surface group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 lg:col-span-3"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Package className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Total Produk
          </p>
          <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
            {stockListRecords.length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            produk aktif di toko
          </p>
        </div>
        <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>

      <Link
        href="/customers"
        className="surface group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 lg:col-span-3"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <Users className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Total Customer
          </p>
          <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
            {customers.length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            pernah purchase
          </p>
        </div>
        <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>

      <section className="surface p-5 lg:col-span-6" aria-label="News">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <Megaphone className="size-4" />
            </span>
            <h2 className="font-display text-sm font-semibold tracking-tight">
              News &amp; Notes
            </h2>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            Fixed info
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {news.slice(0, 2).map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {item.body}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {item.date}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

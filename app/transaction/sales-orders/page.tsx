"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { rupiah } from "@/lib/dashboard-data";
import { storeNames } from "@/lib/master-data";
import {
  SELLOUT_STORAGE_KEY,
  type SelloutRecord,
} from "@/lib/transaction-data";
import { useLocalList } from "@/lib/use-local-list";

const fieldClass =
  "rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

export default function SalesOrdersPage() {
  const { items: records } = useLocalList<SelloutRecord>(SELLOUT_STORAGE_KEY);
  const [search, setSearch] = useState("");
  const [store, setStore] = useState("Semua Store");


  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((row) => {
      const matchStore = store === "Semua Store" || row.store === store;
      const matchSearch =
        !keyword ||
        [row.number, row.customer, row.car, row.licensePlate, row.store].some(
          (value) => value.toLowerCase().includes(keyword),
        );

      return matchStore && matchSearch;
    });
  }, [records, search, store]);

  const total = filtered.reduce((sum, row) => sum + row.total, 0);

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Transaction
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Sales Orders (All Store)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Semua sales order/barang terjual dari seluruh toko. Gunakan filter
            store atau pencarian untuk mempersempit data.
          </p>
        </header>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari customer, nomor, mobil..."
                className={`${fieldClass} w-full pl-9`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={store}
                onChange={(event) => setStore(event.target.value)}
                className={fieldClass}
              >
                <option>Semua Store</option>
                {storeNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {filtered.length} order • {rupiah.format(total)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Nomor</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Mobil</th>
                  <th className={thClass}>License Plat</th>
                  <th className={thClass}>Produk</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada sales order.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-mono font-semibold`}>
                        {row.number}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={`${tdClass} font-medium`}>{row.customer}</td>
                      <td className={tdClass}>{row.store}</td>
                      <td className={tdClass}>{row.car}</td>
                      <td className={`${tdClass} font-mono`}>
                        {row.licensePlate}
                      </td>
                      <td className={tdClass}>
                        {row.items
                          .map((item) => `${item.name} x${item.qty}`)
                          .join(", ")}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold`}
                      >
                        {rupiah.format(row.total)}
                      </td>
                      <td className={tdClass}>
                        <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold text-success">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

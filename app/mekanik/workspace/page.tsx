"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  Clock3,
  Play,
  Search,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import type { SelloutRecord } from "@/lib/transaction-data";

type MechanicStatus = "Menunggu" | "Dikerjakan" | "Selesai";
type FilterStatus = "Semua" | MechanicStatus;

const filters: FilterStatus[] = ["Semua", "Menunggu", "Dikerjakan", "Selesai"];

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

function mechanicStatus(row: SelloutRecord): MechanicStatus {
  return row.mechanicStatus ?? "Menunggu";
}

function statusBadge(status: MechanicStatus) {
  if (status === "Dikerjakan") {
    return "bg-primary-soft text-primary border-primary/20";
  }

  if (status === "Selesai") {
    return "bg-success-soft text-success border-success/20";
  }

  return "bg-warning-soft text-warning border-warning/20";
}

function timeLabel(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MechanicPage() {
  const { sellouts, setSellouts } = useData();
  const can = useCan();
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return sellouts.reduce(
      (result, row) => {
        result[mechanicStatus(row)] += 1;

        return result;
      },
      { Menunggu: 0, Dikerjakan: 0, Selesai: 0 } as Record<MechanicStatus, number>,
    );
  }, [sellouts]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sellouts.filter((row) => {
      const matchesFilter =
        filter === "Semua" || mechanicStatus(row) === filter;
      const matchesKeyword =
        keyword.length === 0 ||
        [row.number, row.customer, row.car, row.licensePlate, row.store].some(
          (value) => value.toLowerCase().includes(keyword),
        );

      return matchesFilter && matchesKeyword;
    });
  }, [filter, search, sellouts]);

  const updateStatus = (id: string, status: MechanicStatus) => {
    const now = new Date().toISOString();

    setSellouts(
      sellouts.map((row) => {
        if (row.id !== id) return row;

        return {
          ...row,
          mechanicStatus: status,
          mechanicStartedAt:
            status === "Dikerjakan" ? now : row.mechanicStartedAt,
          mechanicFinishedAt: status === "Selesai" ? now : undefined,
        };
      }),
    );
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Workshop / Mechanic Bay
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Halaman Mekanik
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pantau kendaraan yang masuk, mulai pengerjaan, dan tandai job
              selesai langsung dari satu meja kerja.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground sm:self-auto">
            <span className="size-2 rounded-full bg-success" />
            Workshop aktif
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Antrian
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {counts.Menunggu}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Wrench className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Dikerjakan
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {counts.Dikerjakan}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Selesai
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {counts.Selesai}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground">
              <Car className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Total Kendaraan
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {sellouts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {filters.map((item) => {
              const count = item === "Semua" ? sellouts.length : counts[item];

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item} ({count})
                </button>
              );
            })}
          </div>

          <label className="flex w-full items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm sm:max-w-xs">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor, customer, mobil..."
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
            />
          </label>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Nomor</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Kendaraan</th>
                  <th className={thClass}>Plat</th>
                  <th className={thClass}>Produk</th>
                  <th className={thClass}>Pengerjaan</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Car className="size-6" />
                      </span>
                      <p className="mt-3 text-sm font-medium">
                        {sellouts.length === 0
                          ? "Belum ada kendaraan di workshop."
                          : "Tidak ada kendaraan pada filter ini."}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sellouts.length === 0
                          ? "Data akan muncul setelah ada transaksi sellout."
                          : "Coba ubah filter atau kata kunci pencarian."}
                      </p>
                      {sellouts.length === 0 && can("sellout", "input") && (
                        <Link
                          href="/transaction/sellout"
                          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          Buat Sellout
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const status = mechanicStatus(row);
                    const products = row.items
                      .map((item) => `${item.name} x${item.qty}`)
                      .join(", ");

                    return (
                      <tr key={row.id} className="hover:bg-muted/30">
                        <td className={`${tdClass} font-mono font-semibold`}>
                          {row.number}
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {row.date}
                        </td>
                        <td className={`${tdClass} font-medium`}>
                          {row.customer}
                        </td>
                        <td className={tdClass}>{row.car}</td>
                        <td className={`${tdClass} font-mono`}>
                          {row.licensePlate}
                        </td>
                        <td
                          className={`${tdClass} max-w-[260px] truncate text-muted-foreground`}
                          title={products}
                        >
                          {products || "-"}
                        </td>
                        <td className={`${tdClass} text-xs text-muted-foreground`}>
                          {status === "Dikerjakan"
                            ? `Mulai ${timeLabel(row.mechanicStartedAt)}`
                            : status === "Selesai"
                              ? `Selesai ${timeLabel(row.mechanicFinishedAt)}`
                              : "-"}
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusBadge(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className={`${tdClass} text-center`}>
                          {can("mekanik", "edit") &&
                          status === "Menunggu" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(row.id, "Dikerjakan")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                            >
                              <Play className="size-3.5" />
                              Mulai
                            </button>
                          ) : can("mekanik", "edit") &&
                            status === "Dikerjakan" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(row.id, "Selesai")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-1.5 text-xs font-semibold text-success transition-transform hover:-translate-y-0.5"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Selesai
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {status === "Selesai" ? "Selesai" : "Menunggu"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

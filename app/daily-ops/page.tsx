"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plus,
  RotateCcw,
  ShieldCheck,
  Store as StoreIcon,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OtpGate } from "@/components/daily-ops/otp-gate";
import { useData } from "@/lib/context/data-context";
import {
  DAILY_OPS_UNLOCK_KEY,
  formatDailyOpsDate,
  type DailyOpsStatus,
} from "@/lib/daily-ops-data";
import { storeNames as masterStoreNames } from "@/lib/master-data";
import { useDailyOps } from "@/lib/use-daily-ops";

const unlockListeners = new Set<() => void>();

function subscribeUnlock(onChange: () => void): () => void {
  unlockListeners.add(onChange);

  return () => {
    unlockListeners.delete(onChange);
  };
}

function readUnlock(): boolean {
  return window.sessionStorage.getItem(DAILY_OPS_UNLOCK_KEY) === "1";
}

function getServerUnlock(): boolean {
  return false;
}

function statusMeta(status: DailyOpsStatus) {
  if (status === "Selesai") {
    return { className: "bg-success-soft text-success border-success/20", icon: CheckCircle2 };
  }

  if (status === "On Going") {
    return { className: "bg-primary-soft text-primary border-primary/20", icon: Wrench };
  }

  return { className: "bg-warning-soft text-warning border-warning/20", icon: Clock3 };
}

function StatusBadge({ status }: { status: DailyOpsStatus }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}>
      <Icon className="size-3" />
      {status}
    </span>
  );
}

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "border-b border-border/70 px-4 py-3 text-sm align-middle";

export default function DailyOpsPage() {
  const router = useRouter();
  const { storeNames } = useData();
  const stores = storeNames.length ? storeNames : masterStoreNames;

  const {
    activities,
    ready,
    today,
    advanceStatus,
    addActivity,
    resetDemo,
  } = useDailyOps(stores);

  const unlocked = useSyncExternalStore(
    subscribeUnlock,
    readUnlock,
    getServerUnlock,
  );

  const [selectedStore, setSelectedStore] = useState("");

  const [clock, setClock] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const activeStore = selectedStore || stores[0] || "";

  const kpis = useMemo(() => {
    const pending = activities.filter((item) => item.status === "Pending").length;
    const ongoing = activities.filter((item) => item.status === "On Going").length;
    const done = activities.filter((item) => item.status === "Selesai").length;

    return {
      stores: new Set(activities.map((item) => item.storeName)).size,
      total: activities.length,
      pending,
      ongoing,
      done,
    };
  }, [activities]);

  const storeSummaries = useMemo(
    () =>
      stores.map((name) => {
        const rows = activities.filter((item) => item.storeName === name);

        return {
          name,
          total: rows.length,
          pending: rows.filter((item) => item.status === "Pending").length,
          ongoing: rows.filter((item) => item.status === "On Going").length,
          done: rows.filter((item) => item.status === "Selesai").length,
        };
      }),
    [activities, stores],
  );

  const visibleActivities = useMemo(
    () => activities.filter((item) => item.storeName === activeStore),
    [activities, activeStore],
  );

  const handleUnlock = () => {
    window.sessionStorage.setItem(DAILY_OPS_UNLOCK_KEY, "1");
    unlockListeners.forEach((listener) => listener());
  };

  const handleLock = () => {
    window.sessionStorage.removeItem(DAILY_OPS_UNLOCK_KEY);
    unlockListeners.forEach((listener) => listener());
  };

  if (!ready) {
    return (
      <AppShell>
        <div className="surface flex min-h-64 items-center justify-center rounded-2xl text-sm text-muted-foreground">
          Menyiapkan papan operasional...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Operations / Live Board
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              On Going Daily Ops
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pantau kegiatan harian tiap toko, perbarui statusnya, dan lihat
              perubahan muncul langsung di papan ini.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Live · {clock || "--:--:--"}
            </div>
            <button
              type="button"
              onClick={handleLock}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ShieldCheck className="size-3.5" />
              Kunci ulang
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            {formatDailyOpsDate(today)} · data disimpan di browser ini
          </p>
          <p className="text-xs text-muted-foreground">
            Demo client-side — bukan backend produksi
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <StoreIcon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Toko aktif
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {kpis.stores}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Pending
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {kpis.pending}
              </p>
            </div>
          </div>
          <div className="surface flex items-center gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Wrench className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                On going
              </p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">
                {kpis.ongoing}
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
                {kpis.done}
              </p>
            </div>
          </div>
        </div>

        <section className="surface rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Store monitor
              </p>
              <h2 className="font-display mt-1 text-lg font-semibold">
                Pilih toko
              </h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {kpis.total} aktivitas hari ini
            </p>
          </div>

          <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
            {storeSummaries.map((store) => {
              const active = store.name === activeStore;
              const total = Math.max(1, store.total);

              return (
                <button
                  key={store.name}
                  type="button"
                  onClick={() => setSelectedStore(store.name)}
                  aria-pressed={active}
                  className={`snap-start rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    active
                      ? "border-primary/40 bg-primary-soft"
                      : "border-border bg-background/60 hover:border-primary/30 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {store.name}
                    </p>
                    <span className="font-mono shrink-0 text-xs text-muted-foreground tabular-nums">
                      {store.total}
                    </span>
                  </div>
                  <p className="font-mono mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                    {store.pending} waiting · {store.ongoing} running · {store.done} done
                  </p>
                  <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="bg-warning transition-all duration-200"
                      style={{ width: `${(store.pending / total) * 100}%` }}
                    />
                    <span
                      className="bg-primary transition-all duration-200"
                      style={{ width: `${(store.ongoing / total) * 100}%` }}
                    />
                    <span
                      className="bg-success transition-all duration-200"
                      style={{ width: `${(store.done / total) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Detail kegiatan
              </p>
              <h2 className="font-display mt-1 truncate text-lg font-semibold">
                {activeStore}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addActivity(activeStore)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary/80"
              >
                <Plus className="size-3.5" />
                Tambah aktivitas demo
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <RotateCcw className="size-3.5" />
                Reset contoh
              </button>
            </div>
          </div>

          {visibleActivities.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Belum ada aktivitas untuk toko ini. Tambah aktivitas demo untuk
              mencoba alurnya.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr>
                      <th className={thClass}>Jam</th>
                      <th className={thClass}>Kegiatan</th>
                      <th className={thClass}>Pelaksana</th>
                      <th className={thClass}>Status</th>
                      <th className={`${thClass} text-right`}>Aksi simulasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleActivities.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-muted/40">
                        <td className={`${tdClass} font-mono text-xs text-muted-foreground tabular-nums`}>
                          {item.time}
                        </td>
                        <td className={tdClass}>
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {item.mechanic}
                        </td>
                        <td className={tdClass}>
                          <StatusBadge status={item.status} />
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            onClick={() => advanceStatus(item.id)}
                            disabled={item.status === "Selesai"}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {item.status === "Pending"
                              ? "Mulai"
                              : item.status === "On Going"
                                ? "Selesaikan"
                                : "Selesai"}
                            <ArrowRight className="size-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {visibleActivities.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.subtitle}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-mono text-xs text-muted-foreground tabular-nums">
                        {item.time} · {item.mechanic}
                      </p>
                      <button
                        type="button"
                        onClick={() => advanceStatus(item.id)}
                        disabled={item.status === "Selesai"}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {item.status === "Pending"
                          ? "Mulai"
                          : item.status === "On Going"
                            ? "Selesaikan"
                            : "Selesai"}
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <p className="text-xs leading-5 text-muted-foreground">
          Data contoh dibersihkan otomatis saat tanggal berubah dan hanya
          tersimpan di browser ini. Buka tab lain di browser yang sama untuk
          melihat pembaruan realtime.
        </p>
      </div>

      {!unlocked && (
        <OtpGate onUnlock={handleUnlock} onCancel={() => router.push("/")} />
      )}
    </AppShell>
  );
}

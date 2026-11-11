"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Home, RefreshCw, RotateCcw, Search } from "lucide-react";
import { PAGE_RESULTS } from "@/lib/search-routes";

interface RadarErrorPageProps {
  code: string;
  title: string;
  description: string;
  onRetry?: () => void;
  showReload?: boolean;
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-18px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted";

function RadarVisual({ code }: { code: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
      <div className="liquid-glass relative size-full overflow-hidden rounded-full">
        <div className="absolute inset-[7%] rounded-full border border-primary/15" />
        <div className="absolute inset-[21%] rounded-full border border-primary/15" />
        <div className="absolute inset-[35%] rounded-full border border-primary/12" />
        <div className="absolute inset-[49%] rounded-full border border-primary/10" />
        <div className="absolute top-1/2 right-[5%] left-[5%] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute top-[5%] bottom-[5%] left-1/2 w-px bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,color-mix(in_oklab,var(--primary)_8%,transparent)_100%)]" />
        <div
          className="radar-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--primary) 42%, transparent) 20deg, transparent 52deg)",
          }}
        />
        <div className="radar-ring absolute inset-[30%] rounded-full border border-primary/35" />
        <div className="radar-ring absolute inset-[30%] rounded-full border border-primary/20 [animation-delay:1.2s]" />
        <div className="absolute inset-x-[12%] top-1/2 h-px overflow-hidden">
          <div className="radar-scanline h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        <span className="radar-blip absolute top-[28%] left-[67%] size-2.5 rounded-full bg-primary shadow-[0_0_18px_var(--primary)]" />
        <span className="radar-blip absolute top-[63%] left-[31%] size-2 rounded-full bg-warning shadow-[0_0_16px_var(--warning)] [animation-delay:0.8s]" />
        <span className="radar-blip absolute top-[72%] left-[72%] size-1.5 rounded-full bg-primary/80 shadow-[0_0_12px_var(--primary)] [animation-delay:1.6s]" />
        <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-background">
          <span className="absolute inset-1 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
        </span>
        <span className="absolute top-[12%] left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          N
        </span>
        <span className="absolute top-1/2 right-[9%] -translate-y-1/2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          E
        </span>
        <span className="absolute bottom-[12%] left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          S
        </span>
        <span className="absolute top-1/2 left-[9%] -translate-y-1/2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          W
        </span>
      </div>
      <div className="absolute -right-2 bottom-7 rounded-2xl border border-border bg-card/90 px-3.5 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
          Scan status
        </p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
          {code} / LOST
        </p>
      </div>
    </div>
  );
}

export function RadarErrorPage({
  code,
  title,
  description,
  onRetry,
  showReload = false,
}: RadarErrorPageProps) {
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      setSearchError("Ketik nama halaman yang ingin dicari.");

      return;
    }

    const match = PAGE_RESULTS.find((page) =>
      [page.title, page.subtitle, page.href, page.group].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );

    if (!match) {
      setSearchError(`Halaman "${query.trim()}" tidak ditemukan.`);

      return;
    }

    setSearchError("");
    router.push(match.href);
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display flex size-10 items-center justify-center rounded-2xl bg-primary text-xs font-bold tracking-tight text-primary-foreground shadow-[0_14px_26px_-14px_var(--primary)]">
              WK
            </span>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">
                WheelsKopi
              </p>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                ERP Ban &amp; Velg
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Signal {code}
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <RadarVisual code={code} />
          </div>

          <div className="order-1 lg:order-2">
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              System / {code}
            </p>
            <h1 className="font-display mt-3 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-[clamp(4.5rem,13vw,8.5rem)] leading-[0.78] font-semibold tracking-[-0.07em] text-transparent">
              {code}
            </h1>
            <h2 className="font-display mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>

            <form onSubmit={handleSearch} className="mt-7 max-w-xl">
              <label htmlFor={searchId} className="sr-only">
                Cari halaman
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur">
                <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchError("");
                  }}
                  placeholder="Cari halaman tujuan..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Telusuri
                </button>
              </div>
              {searchError && (
                <p role="alert" className="mt-2 text-xs text-danger">
                  {searchError}
                </p>
              )}
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {["Dashboard", "Sellout", "Halaman Mekanik"].map((label) => {
                const page = PAGE_RESULTS.find((item) => item.title === label);

                if (!page) return null;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => router.push(page.href)}
                    className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {onRetry ? (
                <button type="button" onClick={onRetry} className={primaryButton}>
                  <RefreshCw className="size-4" />
                  Coba Lagi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={primaryButton}
                >
                  <Home className="size-4" />
                  Kembali ke Dashboard
                </button>
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={secondaryButton}
                >
                  <Home className="size-4" />
                  Dashboard
                </button>
              )}
              {showReload && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={secondaryButton}
                >
                  <RotateCcw className="size-4" />
                  Muat Ulang
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>WheelsKopi ERP</span>
          <span>Error handler / {code}</span>
        </div>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Menu, Search, X } from "lucide-react";
import { AosInit } from "./aos-init";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-full">
      <AosInit />

      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-sidebar lg:block">
        <Sidebar />
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className={`absolute inset-y-0 left-0 w-[86%] max-w-xs border-r border-border bg-sidebar shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
            className="absolute top-5 right-3 z-10 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 w-full items-center gap-3 px-3 sm:px-4 lg:px-6 xl:px-7 2xl:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              aria-expanded={mobileOpen}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                <Image
                  src="/logo.png"
                  alt="WheelsKopi"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </span>
              <span className="font-display truncate text-sm font-semibold">
                WheelsKopi
              </span>
            </div>

            <nav
              aria-label="Breadcrumb"
              className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex"
            >
              <span className="text-muted-foreground">Dashboard</span>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="truncate font-medium">Ringkasan</span>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <label className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-muted-foreground transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring md:flex">
                <Search className="size-4" />
                <input
                  type="search"
                  placeholder="Cari produk, transaksi..."
                  aria-label="Cari"
                  className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-56"
                />
                <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </label>

              <ThemeToggle />

              <button
                type="button"
                aria-label="Notifikasi"
                className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="size-[18px]" />
                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary ring-2 ring-card">
                  <span className="absolute inset-0 rounded-full bg-primary soft-pulse" />
                </span>
              </button>

              <div className="ml-1 hidden items-center gap-2.5 border-l border-border pl-3 sm:flex">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-semibold text-primary">
                  AD
                </span>
                <span className="hidden leading-tight xl:block">
                  <span className="block text-sm font-semibold">
                    Admin Wheels
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Administrator
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-3 py-6 sm:px-4 lg:px-6 xl:px-7 2xl:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

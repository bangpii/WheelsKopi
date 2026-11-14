"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, ShieldX, X } from "lucide-react";
import {
  isAdminOnlyPath,
  moduleForPath,
  useCan,
  useIsAdministrator,
} from "@/lib/permissions";
import { AosInit } from "./aos-init";
import { GlobalSearch, NotificationBell, ProfileMenu } from "./header-tools";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useSurfaceGlow } from "@/lib/use-surface-glow";

interface AppShellProps {
  children: React.ReactNode;
}

function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="liquid-glass w-full max-w-xl rounded-3xl p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldX className="size-7" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight">
          Akses Ditolak
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Role Anda tidak memiliki izin untuk membuka halaman ini. Hubungi
          Administrator jika Anda membutuhkan akses.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const glowHandlers = useSurfaceGlow();
  const can = useCan();
  const isAdministrator = useIsAdministrator();
  const requiredModule = moduleForPath(pathname);

  const denied = isAdminOnlyPath(pathname)
    ? !isAdministrator
    : requiredModule
      ? !can(requiredModule, "view")
      : false;

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
    <div {...glowHandlers} className="min-h-full">
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
              <GlobalSearch />

              <ThemeToggle />

              <NotificationBell />

              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="w-full px-3 py-6 sm:px-4 lg:px-6 xl:px-7 2xl:px-8 lg:py-8">
          {denied ? <AccessDenied /> : children}
        </main>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  LifeBuoy,
  Package,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  target: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", target: "overview", icon: LayoutDashboard },
  { label: "Penjualan", target: "penjualan", icon: ShoppingCart },
  { label: "Stok Ban", target: "stok", icon: Package, badge: "18" },
  { label: "Transaksi", target: "transaksi", icon: ReceiptText },
  { label: "Pelanggan", target: "pelanggan", icon: Users },
  { label: "Supplier", target: "supplier", icon: Truck },
  { label: "Laporan", target: "laporan", icon: BarChart3 },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const sections = NAV_ITEMS.flatMap((item) => {
      const element = document.getElementById(item.target);

      return element === null ? [] : [element];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (target: string) => {
    setActive(target);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  return (
    <aside className="flex h-full flex-col gap-6 overflow-hidden px-4 py-5">
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <Image src="/logo.png" alt="Logo WheelsKopi" fill sizes="44px" className="object-contain p-1.5" priority />
        </span>
        <div className="min-w-0">
          <p className="font-display truncate text-[17px] leading-tight font-semibold tracking-tight">
            WheelsKopi
          </p>
          <p className="truncate text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            ERP Ban &amp; Velg
          </p>
        </div>
      </div>

      <nav aria-label="Navigasi utama" className="no-scrollbar flex-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.target;

            return (
              <li key={item.target}>
                <button
                  type="button"
                  onClick={() => handleNavigate(item.target)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    isActive
                      ? "bg-primary-soft text-accent-foreground shadow-[inset_0_0_0_1px_var(--border)]"
                      : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-all duration-300 ${
                      isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                    }`}
                  />
                  <Icon className={`size-[18px] shrink-0 transition-colors ${isActive ? "text-primary" : ""}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-warning-soft text-warning"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="absolute -top-8 -right-6 size-24 rounded-full bg-primary/15 blur-2xl" />
        <LifeBuoy className="size-5 text-primary" />
        <p className="mt-2.5 text-sm font-semibold">Butuh bantuan?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Tim support siap membantu operasional toko Anda.
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Hubungi Support
        </button>
      </div>

      <button
        type="button"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-left transition-colors hover:bg-muted/60"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-semibold text-primary">
          AD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">Admin Wheels</span>
          <span className="block truncate text-[11px] text-muted-foreground">Administrator</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
    </aside>
  );
}

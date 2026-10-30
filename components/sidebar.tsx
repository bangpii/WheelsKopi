"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  Database,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavSubItem {
  label: string;
  href?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  target?: string;
  href?: string;
  subItems?: NavSubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    target: "overview",
  },
  {
    id: "distribusi",
    label: "Product Distributor",
    icon: Boxes,
    href: "/distribusi",
  },
  {
    id: "master-management",
    label: "Master Management",
    icon: Database,
    subItems: [
      { label: "Product Store", href: "/products" },
      { label: "Others", href: "/others" },
      { label: "Stock List", href: "/stock-list" },
      { label: "Supplier", href: "/suppliers" },
      { label: "Store", href: "/stores" },
      { label: "User", href: "/users" },
      { label: "Payment", href: "/payments" },
      { label: "Service", href: "/services" },
      { label: "Library Cars", href: "/library-cars" },
      { label: "Community", href: "/communities" },
      { label: "Customer", href: "/customers" },
      { label: "Voucher & Discount", href: "/discounts" },
    ],
  },
  {
    id: "role-permission",
    label: "Role & Permission",
    icon: ShieldCheck,
    href: "/settings/permissions",
  },
  {
    id: "transaction",
    label: "Transaction",
    icon: ReceiptText,
    subItems: [
      { label: "Purchase Orders", href: "/purchase-orders" },
      { label: "Receipt PO", href: "/transaction/receipt" },
      { label: "Sellout", href: "/transaction/sellout" },
      { label: "Movement", href: "/transaction/movement" },
      { label: "Daily Spend", href: "/transaction/daily-spend" },
      { label: "Finance Store", href: "/finance-store" },
      { label: "Sellout Global", href: "/transaction/sellout-global" },
      { label: "Daily Spend Global", href: "/transaction/daily-spend-global" },
    ],
  },
  {
    id: "report",
    label: "Report",
    icon: BarChart3,
    subItems: [
      { label: "Report Sellout", href: "/report/sellout" },
      { label: "Report Profit", href: "/report/profit" },
      { label: "Trade Sellout", href: "/report/trade-sellout" },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [active, setActive] = useState("overview");
  const [expanded, setExpanded] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const element = document.getElementById("overview");

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDashboard = () => {
    setActive("overview");

    if (pathname !== "/") {
      router.push("/");
      onNavigate?.();

      return;
    }

    document
      .getElementById("overview")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  return (
    <aside className="flex h-full flex-col gap-6 overflow-hidden px-4 py-5">
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <Image
            src="/logo.png"
            alt="Logo WheelsKopi"
            fill
            sizes="44px"
            className="object-contain p-1.5"
            priority
          />
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

      <nav
        aria-label="Navigasi utama"
        className="no-scrollbar flex-1 overflow-y-auto"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.target === "overview";

            const isDashboardActive =
              isDashboard && pathname === "/" && active === "overview";

            const isActive =
              isDashboardActive ||
              (item.href !== undefined && item.href === pathname);

            const isExpanded =
              expanded.includes(item.id) ||
              item.subItems?.some((child) => child.href === pathname) === true;

            if (!item.subItems) {
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDashboard) {
                        handleDashboard();
                      } else if (item.href) {
                        router.push(item.href);
                        onNavigate?.();
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      isActive
                        ? "bg-primary-soft text-accent-foreground shadow-[inset_0_0_0_1px_var(--border)]"
                        : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-all duration-300 ${
                        isActive
                          ? "scale-y-100 opacity-100"
                          : "scale-y-0 opacity-0"
                      }`}
                    />
                    <Icon
                      className={`size-[18px] shrink-0 transition-colors ${isActive ? "text-primary" : ""}`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 transition-transform duration-200" />
                  )}
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="overflow-hidden">
                    <li className="pl-6">
                      <div className="mt-1 mb-1 space-y-1 border-l-2 border-border/70 pl-2">
                        {item.subItems.map((child) => {
                          const childActive =
                            child.href !== undefined && child.href === pathname;

                          return (
                            <button
                              key={child.label}
                              type="button"
                              onClick={() => {
                                if (!child.href) {
                                  return;
                                }

                                router.push(child.href);
                                onNavigate?.();
                              }}
                              aria-current={childActive ? "page" : undefined}
                              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                                childActive
                                  ? "bg-primary-soft font-medium text-accent-foreground"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              } ${child.href ? "" : "cursor-default opacity-60"}`}
                            >
                              <ChevronsRight
                                className={`size-3.5 shrink-0 ${childActive ? "text-primary" : ""}`}
                              />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  </ul>
                </div>
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
          <span className="block truncate text-sm font-semibold">
            Admin Wheels
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Administrator
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
    </aside>
  );
}

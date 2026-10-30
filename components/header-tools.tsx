"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, LogOut, Search } from "lucide-react";
import { useData } from "@/lib/context/data-context";


const STORE_EVENT = "wheelskopi-store-change";

function subscribeStore(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORE_EVENT, callback);
  };
}

function useStoredRaw(key: string): string | null {
  return useSyncExternalStore(
    subscribeStore,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Penyimpanan browser diblokir; perubahan tidak disimpan.
  }

  window.dispatchEvent(new Event(STORE_EVENT));
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, open, onClose]);
}

/* ------------------------------------------------------------------ */
/* Pencarian global                                                    */
/* ------------------------------------------------------------------ */

interface SearchResult {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
}

const PAGE_RESULTS: SearchResult[] = [
  { id: "p-dashboard", group: "Halaman", title: "Dashboard", subtitle: "Ringkasan usaha", href: "/" },
  { id: "p-distribusi", group: "Halaman", title: "Product Distributor", subtitle: "Stok gudang distributor", href: "/distribusi" },
  { id: "p-products", group: "Halaman", title: "Product Store", subtitle: "Master Management", href: "/products" },
  { id: "p-others", group: "Halaman", title: "Others", subtitle: "Master Management", href: "/others" },
  { id: "p-stock", group: "Halaman", title: "Stock List", subtitle: "Master Management", href: "/stock-list" },
  { id: "p-suppliers", group: "Halaman", title: "Supplier", subtitle: "Master Management", href: "/suppliers" },
  { id: "p-stores", group: "Halaman", title: "Store", subtitle: "Master Management", href: "/stores" },
  { id: "p-users", group: "Halaman", title: "User", subtitle: "Master Management", href: "/users" },
  { id: "p-payments", group: "Halaman", title: "Payment", subtitle: "Master Management", href: "/payments" },
  { id: "p-services", group: "Halaman", title: "Service", subtitle: "Master Management", href: "/services" },
  { id: "p-cars", group: "Halaman", title: "Library Cars", subtitle: "Master Management", href: "/library-cars" },
  { id: "p-communities", group: "Halaman", title: "Community", subtitle: "Master Management", href: "/communities" },
  { id: "p-customers", group: "Halaman", title: "Customer", subtitle: "Master Management", href: "/customers" },
  { id: "p-discounts", group: "Halaman", title: "Voucher & Discount", subtitle: "Master Management", href: "/discounts" },
  { id: "p-permissions", group: "Halaman", title: "Role & Permission", subtitle: "Pengaturan hak akses", href: "/settings/permissions" },
  { id: "p-po", group: "Halaman", title: "Purchase Orders", subtitle: "Transaction", href: "/purchase-orders" },
  { id: "p-receipt", group: "Halaman", title: "Receipt PO", subtitle: "Transaction", href: "/transaction/receipt" },
  { id: "p-sellout", group: "Halaman", title: "Sellout", subtitle: "Transaction", href: "/transaction/sellout" },
  { id: "p-movement", group: "Halaman", title: "Movement", subtitle: "Transaction", href: "/transaction/movement" },
  { id: "p-daily", group: "Halaman", title: "Daily Spend", subtitle: "Transaction", href: "/transaction/daily-spend" },
  { id: "p-finance", group: "Halaman", title: "Finance Store", subtitle: "Transaction", href: "/finance-store" },
  { id: "p-sellout-g", group: "Halaman", title: "Sellout Global", subtitle: "Transaction", href: "/transaction/sellout-global" },
  { id: "p-daily-g", group: "Halaman", title: "Daily Spend Global", subtitle: "Transaction", href: "/transaction/daily-spend-global" },
  { id: "p-r-sellout", group: "Halaman", title: "Report Sellout", subtitle: "Report", href: "/report/sellout" },
  { id: "p-r-profit", group: "Halaman", title: "Report Profit", subtitle: "Report", href: "/report/profit" },
  { id: "p-r-trade", group: "Halaman", title: "Trade Sellout", subtitle: "Report", href: "/report/trade-sellout" },
];

const MAX_RESULTS = 12;

export function GlobalSearch() {
  const router = useRouter();
  const { products, customers, suppliers, stockItems, transactions } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  useClickOutside(wrapRef, open, close);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const index = useMemo<SearchResult[]>(() => {
    const productResults = products.map((item) => ({
      id: `prod-${item.id}`,
      group: "Produk",
      title: item.namaBarang,
      subtitle: `${item.kategoriUtama} · ${item.ukuran || item.subKategori} · Stok ${item.stok}`,
      href: "/products",
    }));

    const stockResults = stockItems.map((item) => ({
      id: `stock-${item.id}`,
      group: "Stok",
      title: item.name,
      subtitle: `${item.brand} · ${item.size} · Sisa ${item.stock}`,
      href: "/stock-list",
    }));

    const customerResults = customers.map((item, position) => ({
      id: `cust-${position}-${item.name}`,
      group: "Customer",
      title: item.name,
      subtitle: item.type,
      href: "/customers",
    }));

    const supplierResults = suppliers.map((item) => ({
      id: `sup-${item.id}`,
      group: "Supplier",
      title: item.name,
      subtitle: `${item.contactPerson} · ${item.phone}`,
      href: "/suppliers",
    }));

    const transactionResults = transactions.map((item) => ({
      id: `trx-${item.id}`,
      group: "Transaksi",
      title: item.id,
      subtitle: `${item.customer} · ${item.status}`,
      href: "/transaction/sellout",
    }));

    return [
      ...PAGE_RESULTS,
      ...productResults,
      ...stockResults,
      ...customerResults,
      ...supplierResults,
      ...transactionResults,
    ];
  }, [products, customers, suppliers, stockItems, transactions]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return [];
    }

    return index
      .filter((entry) => {
        const text = `${entry.title} ${entry.subtitle} ${entry.group}`.toLowerCase();

        return words.every((word) => text.includes(word));
      })
      .slice(0, MAX_RESULTS);
  }, [index, query]);

  const choose = (entry: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    router.push(entry.href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      const entry = results[cursor];

      if (entry) {
        event.preventDefault();
        choose(entry);
      }
    }
  };

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-muted-foreground transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder="Cari produk, transaksi..."
          aria-label="Cari"
          autoComplete="off"
          className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-56"
        />
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </label>

      {open && query.trim() !== "" && (
        <div
          role="listbox"
          className="absolute top-full right-0 z-50 mt-2 max-h-96 w-96 overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-2xl"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((entry, position) => (
              <button
                key={entry.id}
                type="button"
                role="option"
                aria-selected={position === cursor}
                onMouseEnter={() => setCursor(position)}
                onClick={() => choose(entry)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  position === cursor ? "bg-primary-soft" : "hover:bg-muted"
                }`}
              >
                <span className="w-20 shrink-0 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {entry.group}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{entry.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{entry.subtitle}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifikasi                                                          */
/* ------------------------------------------------------------------ */

interface NotificationEntry {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "warning" | "info";
}

const READ_KEY = "wheelskopi_v2_notif_read";

function parseReadIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    // SAFETY: the value is written by this component as string[].
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function NotificationBell() {
  const router = useRouter();
  const { stockItems, transactions } = useData();
  const [open, setOpen] = useState(false);
  const rawRead = useStoredRaw(READ_KEY);
  const readIds = useMemo(() => parseReadIds(rawRead), [rawRead]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useClickOutside(wrapRef, open, close);

  const notifications = useMemo<NotificationEntry[]>(() => {
    const lowStock = stockItems
      .filter((item) => item.stock <= item.minStock)
      .map((item) => ({
        id: `stock-${item.id}-${item.stock}`,
        title: item.stock === 0 ? "Stok habis" : "Stok menipis",
        detail: `${item.name} tersisa ${item.stock} (minimum ${item.minStock})`,
        href: "/stock-list",
        tone: "warning" as const,
      }));

    const pending = transactions
      .filter((item) => item.status === "Proses")
      .map((item) => ({
        id: `trx-${item.id}`,
        title: "Transaksi belum selesai",
        detail: `${item.id} · ${item.customer}`,
        href: "/transaction/sellout",
        tone: "info" as const,
      }));

    return [...lowStock, ...pending];
  }, [stockItems, transactions]);

  const unread = notifications.filter((item) => !readIds.includes(item.id));

  const persist = (ids: string[]) => {
    writeStored(READ_KEY, JSON.stringify(ids));
  };

  const markAllRead = () => {
    persist(Array.from(new Set([...readIds, ...notifications.map((item) => item.id)])));
  };

  const openNotification = (entry: NotificationEntry) => {
    persist(Array.from(new Set([...readIds, entry.id])));
    setOpen(false);
    router.push(entry.href);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        {unread.length > 0 && (
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary ring-2 ring-card">
            <span className="absolute inset-0 rounded-full bg-primary soft-pulse" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-popover shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">
              Notifikasi{unread.length > 0 ? ` (${unread.length})` : ""}
            </p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread.length === 0}
              className="flex items-center gap-1 text-xs font-medium text-primary disabled:text-muted-foreground"
            >
              <CheckCheck className="size-3.5" /> Tandai dibaca
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Belum ada notifikasi
              </p>
            ) : (
              notifications.map((entry) => {
                const isRead = readIds.includes(entry.id);

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => openNotification(entry)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        isRead
                          ? "bg-transparent"
                          : entry.tone === "warning"
                            ? "bg-primary"
                            : "bg-amber-500"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${isRead ? "font-normal text-muted-foreground" : "font-semibold"}`}>
                        {entry.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {entry.detail}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profil                                                              */
/* ------------------------------------------------------------------ */

const SESSION_KEY = "wheelskopi_logged_in_user";

interface Profile {
  name: string;
  role: string;
  photo: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "Admin Wheels",
  role: "Administrator",
  photo: "",
};

function parseProfile(raw: string | null): Profile {
  if (!raw) {
    return DEFAULT_PROFILE;
  }

  try {
    // SAFETY: the session value is written by the login flow; every field is optional.
    const session = JSON.parse(raw) as {
      name?: string;
      role?: string;
      fotoKtp?: string;
      photo?: string;
    };

    return {
      name: session.name || DEFAULT_PROFILE.name,
      role: session.role || DEFAULT_PROFILE.role,
      photo: session.photo || session.fotoKtp || "",
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ profile, size }: { profile: Profile; size: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-display font-semibold text-primary ${size}`}
    >
      {profile.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.photo} alt={profile.name} className="size-full object-cover" />
      ) : (
        initialsOf(profile.name)
      )}
    </span>
  );
}

export function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rawSession = useStoredRaw(SESSION_KEY);
  const profile = useMemo(() => parseProfile(rawSession), [rawSession]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useClickOutside(wrapRef, open, close);

  const logout = () => {
    writeStored(SESSION_KEY, null);
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={wrapRef} className="relative ml-1 border-l border-border pl-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Profil"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl p-0.5 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Avatar profile={profile} size="size-9 text-xs" />
        <span className="hidden text-left leading-tight xl:block">
          <span className="block text-sm font-semibold">{profile.name}</span>
          <span className="block text-[11px] text-muted-foreground">{profile.role}</span>
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-popover p-4 shadow-2xl">
          <div className="flex flex-col items-center gap-2 text-center">
            <Avatar profile={profile} size="size-16 text-lg" />
            <div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
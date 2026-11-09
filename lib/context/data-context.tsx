"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  Customer,
  Kpi,
  StockItem,
  Transaction,
} from "@/lib/dashboard-data";
import {
  customers as demoCustomers,
  kpis as demoKpis,
  stockItems as demoStocks,
  transactions as demoTransactions,
} from "@/lib/dashboard-data";
import type { DistribusiItem } from "@/lib/distribusi-data";
import { initialDistribusiItems } from "@/lib/distribusi-data";
import {
  rolePermissions as defaultPermissions,
  roles as defaultRoles,
  suppliers as seededSuppliers,
  users as seededUsers,
} from "@/lib/master-data";
import type {
  RolePermission,
  SupplierRecord,
  UserRecord,
} from "@/lib/master-data";

export type { RolePermission, SupplierRecord, UserRecord } from "@/lib/master-data";
export type { DistribusiItem } from "@/lib/distribusi-data";

/* ------------------------------------------------------------------ */
/*  Product = DistribusiItem + metadata toko                          */
/* ------------------------------------------------------------------ */

export type Product = DistribusiItem & {
  /** Alias kategori untuk kompatibilitas halaman lama. */
  kategoriUtama: "Others" | "Ban";
  /** Riwayat perubahan (audit log). */
  history: string[];
};

/* ------------------------------------------------------------------ */
/*  Interface context                                                 */
/* ------------------------------------------------------------------ */

interface GlobalData {
  stockItems: StockItem[];
  transactions: Transaction[];
  kpis: Kpi[];
  customers: Customer[];
  suppliers: SupplierRecord[];
  products: Product[];
  roles: string[];
  rolePermissions: RolePermission[];
  users: UserRecord[];

  setStockItems: Dispatch<SetStateAction<StockItem[]>>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  setKpis: Dispatch<SetStateAction<Kpi[]>>;
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  setSuppliers: Dispatch<SetStateAction<SupplierRecord[]>>;
  setProducts: Dispatch<SetStateAction<Product[]>>;
  setRoles: Dispatch<SetStateAction<string[]>>;
  setRolePermissions: Dispatch<SetStateAction<RolePermission[]>>;
  setUsers: Dispatch<SetStateAction<UserRecord[]>>;
}

/* ------------------------------------------------------------------ */
/*  Konversi DistribusiItem ↔ Product                                 */
/* ------------------------------------------------------------------ */

/** DistribusiItem → Product (untuk disimpan di state global). */
export function toProduct(
  item: DistribusiItem,
  historyEntry = "Ditambahkan dari halaman Distribusi",
): Product {
  return {
    ...item,
    kategoriUtama: item.kategori,
    history: [
      `[${new Date().toLocaleString("id-ID")}] ${historyEntry}`,
    ],
  };
}

/** Product → DistribusiItem (untuk render di halaman distribusi). */
export function toDistribusiItem(product: Product): DistribusiItem {
  // Buang field yang bukan bagian dari DistribusiItem
  const {
    kategoriUtama: _kategoriUtama,
    history: _history,
    ...rest
  } = product;
  return rest;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                              */
/* ------------------------------------------------------------------ */

const seededProducts: Product[] = initialDistribusiItems.map((item) =>
  toProduct(item, "Data awal demo"),
);

/* ------------------------------------------------------------------ */
/*  localStorage helper                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEYS = {
  stocks: "wheelskopi_v3_stocks",
  transactions: "wheelskopi_v3_transactions",
  kpis: "wheelskopi_v3_kpis",
  customers: "wheelskopi_v3_customers",
  suppliers: "wheelskopi_v2_suppliers",
  products: "wheelskopi_v2_products",
  roles: "wheelskopi_v2_roles",
  permissions: "wheelskopi_v2_permissions",
  users: "wheelskopi_v2_users",
} as const;

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * State yang membaca localStorage setelah hydration selesai. Render pertama
 * memakai fallback yang sama dengan server agar tidak memicu hydration mismatch.
 */
function usePersistentCollection<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const stored = useMemo(
    () => (isClient ? readStored(key, fallback) : fallback),
    [fallback, isClient, key],
  );
  const [override, setOverride] = useState<T | null>(null);
  const value = override ?? stored;

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setOverride((current) => {
        const base = current ?? stored;
        return typeof action === "function"
          ? (action as (previous: T) => T)(base)
          : action;
      });
    },
    [stored],
  );

  return [value, setValue, isClient];
}

/* ------------------------------------------------------------------ */
/*  Context & Provider                                                */
/* ------------------------------------------------------------------ */

const DataContext = createContext<GlobalData | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stockItems, setStockItems, clientStocks] = usePersistentCollection(
    STORAGE_KEYS.stocks,
    demoStocks,
  );
  const [transactions, setTransactions, clientTransactions] =
    usePersistentCollection(STORAGE_KEYS.transactions, demoTransactions);
  const [kpis, setKpis, clientKpis] = usePersistentCollection(
    STORAGE_KEYS.kpis,
    demoKpis,
  );
  const [customers, setCustomers, clientCustomers] = usePersistentCollection(
    STORAGE_KEYS.customers,
    demoCustomers,
  );
  const [suppliers, setSuppliers, clientSuppliers] = usePersistentCollection(
    STORAGE_KEYS.suppliers,
    seededSuppliers,
  );
  const [products, setProducts, clientProducts] = usePersistentCollection(
    STORAGE_KEYS.products,
    seededProducts,
  );
  const [roles, setRoles, clientRoles] = usePersistentCollection(
    STORAGE_KEYS.roles,
    defaultRoles,
  );
  const [rolePermissions, setRolePermissions, clientPermissions] =
    usePersistentCollection(STORAGE_KEYS.permissions, defaultPermissions);
  const [users, setUsers, clientUsers] = usePersistentCollection(
    STORAGE_KEYS.users,
    seededUsers,
  );

  const hydrated =
    clientStocks &&
    clientTransactions &&
    clientKpis &&
    clientCustomers &&
    clientSuppliers &&
    clientProducts &&
    clientRoles &&
    clientPermissions &&
    clientUsers;

  /* Persist ke localStorage */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.stocks, JSON.stringify(stockItems));
  }, [hydrated, stockItems]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(transactions),
    );
  }, [hydrated, transactions]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.kpis, JSON.stringify(kpis));
  }, [hydrated, kpis]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
  }, [hydrated, suppliers]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [hydrated, products]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(roles));
  }, [hydrated, roles]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.permissions,
      JSON.stringify(rolePermissions),
    );
  }, [hydrated, rolePermissions]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [hydrated, users]);

  return (
    <DataContext.Provider
      value={{
        stockItems,
        setStockItems,
        transactions,
        setTransactions,
        kpis,
        setKpis,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        products,
        setProducts,
        roles,
        setRoles,
        rolePermissions,
        setRolePermissions,
        users,
        setUsers,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData harus digunakan di dalam DataProvider");
  }
  return context;
}
"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
} from "@/lib/master-data";
import type { RolePermission, SupplierRecord } from "@/lib/master-data";

export type { RolePermission, SupplierRecord } from "@/lib/master-data";
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

  setStockItems: Dispatch<SetStateAction<StockItem[]>>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  setKpis: Dispatch<SetStateAction<Kpi[]>>;
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  setSuppliers: Dispatch<SetStateAction<SupplierRecord[]>>;
  setProducts: Dispatch<SetStateAction<Product[]>>;
  setRoles: Dispatch<SetStateAction<string[]>>;
  setRolePermissions: Dispatch<SetStateAction<RolePermission[]>>;
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
  stocks: "wheelskopi_v2_stocks",
  transactions: "wheelskopi_v2_transactions",
  kpis: "wheelskopi_v2_kpis",
  customers: "wheelskopi_v2_customers",
  suppliers: "wheelskopi_v2_suppliers",
  products: "wheelskopi_v2_products",
  roles: "wheelskopi_v2_roles",
  permissions: "wheelskopi_v2_permissions",
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

/* ------------------------------------------------------------------ */
/*  Context & Provider                                                */
/* ------------------------------------------------------------------ */

const DataContext = createContext<GlobalData | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stockItems, setStockItems] = useState<StockItem[]>(() =>
    readStored(STORAGE_KEYS.stocks, demoStocks),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStored(STORAGE_KEYS.transactions, demoTransactions),
  );
  const [kpis, setKpis] = useState<Kpi[]>(() =>
    readStored(STORAGE_KEYS.kpis, demoKpis),
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    readStored(STORAGE_KEYS.customers, demoCustomers),
  );
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() =>
    readStored(STORAGE_KEYS.suppliers, seededSuppliers),
  );
  const [products, setProducts] = useState<Product[]>(() =>
    readStored(STORAGE_KEYS.products, seededProducts),
  );
  const [roles, setRoles] = useState<string[]>(() =>
    readStored(STORAGE_KEYS.roles, defaultRoles),
  );
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(
    () => readStored(STORAGE_KEYS.permissions, defaultPermissions),
  );

  /* Persist ke localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stocks, JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.kpis, JSON.stringify(kpis));
  }, [kpis]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.permissions,
      JSON.stringify(rolePermissions),
    );
  }, [rolePermissions]);

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
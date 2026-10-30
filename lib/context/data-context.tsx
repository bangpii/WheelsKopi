"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Customer, Kpi, StockItem, Transaction } from "@/lib/dashboard-data";
import { customers as demoCustomers, kpis as demoKpis, stockItems as demoStocks, transactions as demoTransactions } from "@/lib/dashboard-data";
import { initialDistribusiItems } from "@/lib/distribusi-data";
import { rolePermissions as defaultPermissions, roles as defaultRoles, suppliers as seededSuppliers } from "@/lib/master-data";
import type { RolePermission, SupplierRecord } from "@/lib/master-data";

export type { RolePermission, SupplierRecord } from "@/lib/master-data";

export interface Product {
  id: string;
  kategoriUtama: "Others" | "Ban";
  subKategori: string;
  namaBarang: string;
  ukuran: string;
  ring: string;
  hargaModalAsli: number;
  hargaModalToko: number;
  stok: number;
  gambar: string;
  supplier: string;
  history: string[];
}

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

const seededProducts: Product[] = initialDistribusiItems.map((item) => ({
  id: item.id,
  kategoriUtama: item.kategori,
  subKategori: item.subKategori,
  namaBarang: item.namaBarang,
  ukuran: item.ukuran,
  ring: item.ring,
  hargaModalAsli: item.hargaModalAsli,
  hargaModalToko: item.hargaModalToko,
  stok: item.stok,
  gambar: item.gambar,
  supplier: item.supplier,
  history: ["Data awal demo"],
}));

const DataContext = createContext<GlobalData | undefined>(undefined);

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    // SAFETY: localStorage values are written by this app using the requested shape.
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [stockItems, setStockItems] = useState<StockItem[]>(() => readStored("wheelskopi_v2_stocks", demoStocks));
  const [transactions, setTransactions] = useState<Transaction[]>(() => readStored("wheelskopi_v2_transactions", demoTransactions));
  const [kpis, setKpis] = useState<Kpi[]>(() => readStored("wheelskopi_v2_kpis", demoKpis));
  const [customers, setCustomers] = useState<Customer[]>(() => readStored("wheelskopi_v2_customers", demoCustomers));
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => readStored("wheelskopi_v2_suppliers", seededSuppliers));
  const [products, setProducts] = useState<Product[]>(() => readStored("wheelskopi_v2_products", seededProducts));
  const [roles, setRoles] = useState<string[]>(() => readStored("wheelskopi_v2_roles", defaultRoles));
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => readStored("wheelskopi_v2_permissions", defaultPermissions));

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_stocks", JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_kpis", JSON.stringify(kpis));
  }, [kpis]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("wheelskopi_v2_permissions", JSON.stringify(rolePermissions));
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

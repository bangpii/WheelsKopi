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
import type { Kpi, StockItem, Transaction } from "@/lib/dashboard-data";
import type { DistribusiItem } from "@/lib/distribusi-data";
import {
  SELLOUT_STORAGE_KEY,
  MOVEMENT_STORAGE_KEY,
  DAILY_SPEND_STORAGE_KEY,
  TRADE_STORAGE_KEY,
  FINANCE_STORE_STORAGE_KEY,
} from "@/lib/transaction-data";
import type {
  DailySpendItemRecord,
  FinanceStoreDayRecord,
  MovementRecord,
  SelloutRecord,
  TradeRecord,
} from "@/lib/transaction-data";
import { selloutToTransaction } from "@/lib/synced-data";
import {
  rolePermissions as defaultPermissions,
  roles as defaultRoles,
  seedUsers,
} from "@/lib/master-data";
import { ADMIN_ROLE, SESSION_KEY } from "@/lib/auth";
import type {
  CommunityRecord,
  LibraryCarRecord,
  PaymentRecord,
  RolePermission,
  ServiceRecord,
  StoreRecord,
  SupplierRecord,
  UserRecord,
} from "@/lib/master-data";
import type {
  CustomerRecord,
  DiscountRecord,
  ReceiptPORecord,
} from "@/lib/warehouse-data";
import type { PurchaseOrderDetail } from "@/lib/purchase-data";

export type {
  RolePermission,
  SupplierRecord,
  UserRecord,
  StoreRecord,
  PaymentRecord,
  ServiceRecord,
  LibraryCarRecord,
  CommunityRecord,
} from "@/lib/master-data";
export type { CustomerRecord, DiscountRecord, ReceiptPORecord } from "@/lib/warehouse-data";
export type { PurchaseOrderDetail } from "@/lib/purchase-data";
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
  customers: CustomerRecord[];
  suppliers: SupplierRecord[];
  products: Product[];
  roles: string[];
  rolePermissions: RolePermission[];
  users: UserRecord[];
  sellouts: SelloutRecord[];
  movements: MovementRecord[];
  dailySpends: DailySpendItemRecord[];
  trades: TradeRecord[];
  financeStores: FinanceStoreDayRecord[];
  stores: StoreRecord[];
  storeNames: string[];
  payments: PaymentRecord[];
  services: ServiceRecord[];
  libraryCars: LibraryCarRecord[];
  communities: CommunityRecord[];
  discounts: DiscountRecord[];
  purchaseOrders: PurchaseOrderDetail[];
  receipts: ReceiptPORecord[];

  setKpis: Dispatch<SetStateAction<Kpi[]>>;
  setCustomers: Dispatch<SetStateAction<CustomerRecord[]>>;
  setSuppliers: Dispatch<SetStateAction<SupplierRecord[]>>;
  setProducts: Dispatch<SetStateAction<Product[]>>;
  setRoles: Dispatch<SetStateAction<string[]>>;
  setRolePermissions: Dispatch<SetStateAction<RolePermission[]>>;
  setUsers: Dispatch<SetStateAction<UserRecord[]>>;
  setSellouts: Dispatch<SetStateAction<SelloutRecord[]>>;
  setMovements: Dispatch<SetStateAction<MovementRecord[]>>;
  setDailySpends: Dispatch<SetStateAction<DailySpendItemRecord[]>>;
  setTrades: Dispatch<SetStateAction<TradeRecord[]>>;
  setFinanceStores: Dispatch<SetStateAction<FinanceStoreDayRecord[]>>;
  setStores: Dispatch<SetStateAction<StoreRecord[]>>;
  setPayments: Dispatch<SetStateAction<PaymentRecord[]>>;
  setServices: Dispatch<SetStateAction<ServiceRecord[]>>;
  setLibraryCars: Dispatch<SetStateAction<LibraryCarRecord[]>>;
  setCommunities: Dispatch<SetStateAction<CommunityRecord[]>>;
  setDiscounts: Dispatch<SetStateAction<DiscountRecord[]>>;
  setPurchaseOrders: Dispatch<SetStateAction<PurchaseOrderDetail[]>>;
  setReceipts: Dispatch<SetStateAction<ReceiptPORecord[]>>;
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
    history: [`[${new Date().toLocaleString("id-ID")}] ${historyEntry}`],
  };
}

/** Product → DistribusiItem (untuk render di halaman distribusi). */
export function toDistribusiItem(product: Product): DistribusiItem {
  const item: Partial<Product> = { ...product };
  delete item.kategoriUtama;
  delete item.history;
  // SAFETY: after removing the two Product-only fields, the remaining shape
  // matches DistribusiItem exactly (Product extends DistribusiItem).
  return item as DistribusiItem;
}

/* ------------------------------------------------------------------ */
/*  Data awal (sengaja kosong agar CRUD dimulai dari nol)             */
/* ------------------------------------------------------------------ */

const EMPTY_KPIS: Kpi[] = [];
const EMPTY_CUSTOMERS: CustomerRecord[] = [];
const EMPTY_SUPPLIERS: SupplierRecord[] = [];
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_SELLOUTS: SelloutRecord[] = [];
const EMPTY_MOVEMENTS: MovementRecord[] = [];
const EMPTY_DAILY_SPENDS: DailySpendItemRecord[] = [];
const EMPTY_TRADES: TradeRecord[] = [];
const EMPTY_FINANCE_STORES: FinanceStoreDayRecord[] = [];
const EMPTY_STORES: StoreRecord[] = [];
const EMPTY_PAYMENTS: PaymentRecord[] = [];
const EMPTY_SERVICES: ServiceRecord[] = [];
const EMPTY_LIBRARY_CARS: LibraryCarRecord[] = [];
const EMPTY_COMMUNITIES: CommunityRecord[] = [];
const EMPTY_DISCOUNTS: DiscountRecord[] = [];
const EMPTY_PURCHASE_ORDERS: PurchaseOrderDetail[] = [];
const EMPTY_RECEIPTS: ReceiptPORecord[] = [];

/* ------------------------------------------------------------------ */
/*  localStorage helper                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEYS = {
  kpis: "wheelskopi_v5_kpis",
  customers: "wheelskopi_v5_customers",
  suppliers: "wheelskopi_v5_suppliers",
  products: "wheelskopi_v5_products",
  roles: "wheelskopi_v5_roles",
  permissions: "wheelskopi_v5_permissions",
  users: "wheelskopi_v5_users",
  sellouts: SELLOUT_STORAGE_KEY,
  movements: MOVEMENT_STORAGE_KEY,
  dailySpends: DAILY_SPEND_STORAGE_KEY,
  trades: TRADE_STORAGE_KEY,
  financeStores: FINANCE_STORE_STORAGE_KEY,
  stores: "wheelskopi_v5_stores",
  payments: "wheelskopi_v5_payments",
  services: "wheelskopi_v5_services",
  libraryCars: "wheelskopi_v5_library_cars",
  communities: "wheelskopi_v5_communities",
  discounts: "wheelskopi_v5_discounts",
  purchaseOrders: "wheelskopi_v5_purchase_orders",
  receipts: "wheelskopi_v5_receipts",
} as const;

const TRANSACTION_REPORT_STORAGE_KEYS = [
  SELLOUT_STORAGE_KEY,
  MOVEMENT_STORAGE_KEY,
  DAILY_SPEND_STORAGE_KEY,
  TRADE_STORAGE_KEY,
  FINANCE_STORE_STORAGE_KEY,
  STORAGE_KEYS.purchaseOrders,
  STORAGE_KEYS.receipts,
];

const TRANSACTION_REPORT_CLEAR_KEY = "wheelskopi_v5_transaction_report_cleared";

function clearTransactionReportDataOnce() {
  if (typeof window === "undefined") return;

  try {
    if (localStorage.getItem(TRANSACTION_REPORT_CLEAR_KEY) === "1") return;

    for (const key of TRANSACTION_REPORT_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    localStorage.setItem(TRANSACTION_REPORT_CLEAR_KEY, "1");
  } catch {
    return;
  }
}

clearTransactionReportDataOnce();

const SEED_DATA_MIGRATION_KEY = "wheelskopi_v5_seed_data_migrated_v1";

function migrateSeedDataOnce() {
  if (typeof window === "undefined") return;

  try {
    if (localStorage.getItem(SEED_DATA_MIGRATION_KEY) === "1") return;

    const storedRolesRaw = localStorage.getItem(STORAGE_KEYS.roles);
    if (storedRolesRaw) {
      const storedRoles = JSON.parse(storedRolesRaw) as string[];
      const nextRoles = Array.from(
        new Set(
          storedRoles.map((role) =>
            role === "Administrator" ? ADMIN_ROLE : role,
          ),
        ),
      );
      localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(nextRoles));
    }

    const storedPermissionsRaw = localStorage.getItem(STORAGE_KEYS.permissions);
    if (storedPermissionsRaw) {
      const storedPermissions = JSON.parse(
        storedPermissionsRaw,
      ) as RolePermission[];
      const byRole = new Map<string, string[]>();

      for (const entry of storedPermissions) {
        const roleName =
          entry.roleName === "Administrator" ? ADMIN_ROLE : entry.roleName;

        if (roleName === ADMIN_ROLE) {
          byRole.set(roleName, []);
        } else if (!byRole.has(roleName)) {
          byRole.set(roleName, entry.permissions);
        }
      }

      const nextPermissions = Array.from(
        byRole,
        ([roleName, permissions]) => ({ roleName, permissions }),
      );
      localStorage.setItem(
        STORAGE_KEYS.permissions,
        JSON.stringify(nextPermissions),
      );
    }

    const storedUsersRaw = localStorage.getItem(STORAGE_KEYS.users);
    const storedUsers = storedUsersRaw
      ? (JSON.parse(storedUsersRaw) as UserRecord[])
      : [];
    const seedByEmail = new Map(
      seedUsers.map((user) => [user.email.toLowerCase(), user]),
    );
    const mergedUsers = storedUsers.map((user) => {
      const seed = seedByEmail.get(user.email.toLowerCase());

      if (seed) return { ...seed };

      return user.role === "Administrator"
        ? { ...user, role: ADMIN_ROLE }
        : user;
    });
    const mergedEmails = new Set(
      mergedUsers.map((user) => user.email.toLowerCase()),
    );

    for (const seed of seedUsers) {
      if (!mergedEmails.has(seed.email.toLowerCase())) {
        mergedUsers.push(seed);
        mergedEmails.add(seed.email.toLowerCase());
      }
    }

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mergedUsers));

    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw) as { role?: string };

      if (session.role === "Administrator") {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, role: ADMIN_ROLE }),
        );
      }
    }

    localStorage.setItem(SEED_DATA_MIGRATION_KEY, "1");
  } catch {
    return;
  }
}

migrateSeedDataOnce();

const MECHANIC_PERMISSION_MIGRATION_KEY =
  "wheelskopi_v5_mechanic_permissions_v1";

function migrateMechanicPermissionsOnce() {
  if (typeof window === "undefined") return;

  try {
    if (localStorage.getItem(MECHANIC_PERMISSION_MIGRATION_KEY) === "1") {
      return;
    }

    const rawPermissions = localStorage.getItem(STORAGE_KEYS.permissions);
    if (rawPermissions) {
      const storedPermissions = JSON.parse(rawPermissions) as RolePermission[];
      const nextPermissions = storedPermissions.map((entry) => {
        if (entry.roleName !== "Mekanik") return entry;

        return {
          ...entry,
          permissions: Array.from(
            new Set([...entry.permissions, "mekanik_view", "mekanik_edit"]),
          ),
        };
      });

      localStorage.setItem(
        STORAGE_KEYS.permissions,
        JSON.stringify(nextPermissions),
      );
    }

    localStorage.setItem(MECHANIC_PERMISSION_MIGRATION_KEY, "1");
  } catch {
    return;
  }
}

migrateMechanicPermissionsOnce();

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
/*  Turunan stok dari master produk                                   */
/* ------------------------------------------------------------------ */

function productToStockItem(product: Product): StockItem {
  const category: StockItem["category"] =
    product.kategori === "Ban"
      ? "Mobil"
      : product.subKategori === "Velg"
        ? "Velg"
        : "Aksesori";

  const size =
    product.kategori === "Ban"
      ? [product.ukuranTapak, product.ukuranTinggi, product.ring]
          .filter(Boolean)
          .join(" ")
      : [product.ukuran, product.ring].filter(Boolean).join(" ");

  return {
    id: product.id,
    name: product.namaBarang,
    brand: product.merekBan || product.merekProduk || product.supplier,
    size: size || "-",
    category,
    price: product.standarPrice || product.hargaModalToko || 0,
    stock: product.stok,
    minStock: 4,
    sold: 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Context & Provider                                                */
/* ------------------------------------------------------------------ */

const DataContext = createContext<GlobalData | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [kpis, setKpis, clientKpis] = usePersistentCollection(
    STORAGE_KEYS.kpis,
    EMPTY_KPIS,
  );
  const [customers, setCustomers, clientCustomers] = usePersistentCollection(
    STORAGE_KEYS.customers,
    EMPTY_CUSTOMERS,
  );
  const [suppliers, setSuppliers, clientSuppliers] = usePersistentCollection(
    STORAGE_KEYS.suppliers,
    EMPTY_SUPPLIERS,
  );
  const [products, setProducts, clientProducts] = usePersistentCollection(
    STORAGE_KEYS.products,
    EMPTY_PRODUCTS,
  );
  const [roles, setRoles, clientRoles] = usePersistentCollection(
    STORAGE_KEYS.roles,
    defaultRoles,
  );
  const [rolePermissions, setRolePermissions, clientPermissions] =
    usePersistentCollection(STORAGE_KEYS.permissions, defaultPermissions);
  const [users, setUsers, clientUsers] = usePersistentCollection(
    STORAGE_KEYS.users,
    seedUsers,
  );
  const [sellouts, setSellouts, clientSellouts] = usePersistentCollection(
    STORAGE_KEYS.sellouts,
    EMPTY_SELLOUTS,
  );
  const [movements, setMovements, clientMovements] = usePersistentCollection(
    STORAGE_KEYS.movements,
    EMPTY_MOVEMENTS,
  );
  const [dailySpends, setDailySpends, clientDailySpends] =
    usePersistentCollection(STORAGE_KEYS.dailySpends, EMPTY_DAILY_SPENDS);
  const [trades, setTrades, clientTrades] = usePersistentCollection(
    STORAGE_KEYS.trades,
    EMPTY_TRADES,
  );
  const [financeStores, setFinanceStores, clientFinanceStores] =
    usePersistentCollection(STORAGE_KEYS.financeStores, EMPTY_FINANCE_STORES);
  const [stores, setStores, clientStores] = usePersistentCollection(
    STORAGE_KEYS.stores,
    EMPTY_STORES,
  );
  const [payments, setPayments, clientPayments] = usePersistentCollection(
    STORAGE_KEYS.payments,
    EMPTY_PAYMENTS,
  );
  const [services, setServices, clientServices] = usePersistentCollection(
    STORAGE_KEYS.services,
    EMPTY_SERVICES,
  );
  const [libraryCars, setLibraryCars, clientLibraryCars] =
    usePersistentCollection(STORAGE_KEYS.libraryCars, EMPTY_LIBRARY_CARS);
  const [communities, setCommunities, clientCommunities] =
    usePersistentCollection(STORAGE_KEYS.communities, EMPTY_COMMUNITIES);
  const [discounts, setDiscounts, clientDiscounts] = usePersistentCollection(
    STORAGE_KEYS.discounts,
    EMPTY_DISCOUNTS,
  );
  const [purchaseOrders, setPurchaseOrders, clientPurchaseOrders] =
    usePersistentCollection(
      STORAGE_KEYS.purchaseOrders,
      EMPTY_PURCHASE_ORDERS,
    );
  const [receipts, setReceipts, clientReceipts] = usePersistentCollection(
    STORAGE_KEYS.receipts,
    EMPTY_RECEIPTS,
  );

  const transactions = useMemo(
    () => sellouts.map(selloutToTransaction),
    [sellouts],
  );

  const stockItems = useMemo(
    () => products.map(productToStockItem),
    [products],
  );

  const storeNames = useMemo(
    () => stores.map((store) => store.storeName),
    [stores],
  );

  const hydrated =
    clientKpis &&
    clientCustomers &&
    clientSuppliers &&
    clientProducts &&
    clientRoles &&
    clientPermissions &&
    clientUsers &&
    clientSellouts &&
    clientMovements &&
    clientDailySpends &&
    clientTrades &&
    clientFinanceStores &&
    clientStores &&
    clientPayments &&
    clientServices &&
    clientLibraryCars &&
    clientCommunities &&
    clientDiscounts &&
    clientPurchaseOrders &&
    clientReceipts;

  /* Persist ke localStorage */
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

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.sellouts, JSON.stringify(sellouts));
  }, [hydrated, sellouts]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.movements, JSON.stringify(movements));
  }, [hydrated, movements]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.dailySpends, JSON.stringify(dailySpends));
  }, [dailySpends, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.trades, JSON.stringify(trades));
  }, [hydrated, trades]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.financeStores,
      JSON.stringify(financeStores),
    );
  }, [financeStores, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.stores, JSON.stringify(stores));
  }, [hydrated, stores]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [hydrated, payments]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
  }, [hydrated, services]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.libraryCars,
      JSON.stringify(libraryCars),
    );
  }, [hydrated, libraryCars]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.communities,
      JSON.stringify(communities),
    );
  }, [communities, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.discounts, JSON.stringify(discounts));
  }, [discounts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.purchaseOrders,
      JSON.stringify(purchaseOrders),
    );
  }, [hydrated, purchaseOrders]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(receipts));
  }, [hydrated, receipts]);

  return (
    <DataContext.Provider
      value={{
        stockItems,
        transactions,
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
        sellouts,
        setSellouts,
        movements,
        setMovements,
        dailySpends,
        setDailySpends,
        trades,
        setTrades,
        financeStores,
        setFinanceStores,
        stores,
        setStores,
        storeNames,
        payments,
        setPayments,
        services,
        setServices,
        libraryCars,
        setLibraryCars,
        communities,
        setCommunities,
        discounts,
        setDiscounts,
        purchaseOrders,
        setPurchaseOrders,
        receipts,
        setReceipts,
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

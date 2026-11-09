export interface SelloutItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export type SelloutStatus =
  | "Menunggu Approval"
  | "Siap Invoice"
  | "Sudah Invoice";

export interface SelloutRecord {
  id: string;
  number: string;
  date: string;
  customer: string;
  description: string;
  car: string;
  licensePlate: string;
  store: string;
  items: SelloutItem[];
  total: number;
  status: SelloutStatus;
  createdAt: string;
}

export interface MovementItem {
  productId: string;
  name: string;
  qty: number;
}

export interface MovementRecord {
  id: string;
  number: string;
  date: string;
  sourceStore: string;
  destinationStore: string;
  items: MovementItem[];
  createdAt: string;
}

export interface DailySpendItemRecord {
  id: string;
  date: string;
  store: string;
  description: string;
  category: string;
  amount: number;
  spooring: number;
  salary: number;
  employeeId?: string;
  employeeName?: string;
  salaryPeriod?: string;
  salaryPeriodType?: "Mingguan" | "Bulanan";
  total: number;
  createdAt: string;
}

export interface TradeRecord {
  id: string;
  store: string;
  date: string;
  bonNumber: string;
  product: string;
  price: number;
  notes: string;
  status: "Available" | "Sold";
}

export const SELLOUT_STORAGE_KEY = "wheelskopi-sellouts";
export const MOVEMENT_STORAGE_KEY = "wheelskopi-movements";
export const DAILY_SPEND_STORAGE_KEY = "wheelskopi-daily-spends";
export const TRADE_STORAGE_KEY = "wheelskopi-trade-sellouts";

export function displayDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function selloutSubtotal(items: SelloutItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

export type FinanceLedgerType =
  | "payment"
  | "purchase"
  | "sales"
  | "spend"
  | "adjustment";

export interface FinanceLedgerEntry {
  id: string;
  type: FinanceLedgerType;
  ref: string;
  description: string;
  amount: number;
  source: string;
}

export interface FinanceStoreSnapshot {
  payments: number;
  purchases: number;
  sales: number;
  spends: number;
  adjustments: number;
  remainder: number;
  ledger: FinanceLedgerEntry[];
  closedAt: string;
  closedBy: string;
}

export interface FinanceStoreDayRecord {
  id: string;
  store: string;
  date: string;
  payments: number;
  purchases: number;
  sales: number;
  spends: number;
  remainder: number;
  details: string;
  ledger?: FinanceLedgerEntry[];
  status: "Open" | "Closed";
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  snapshot?: FinanceStoreSnapshot;
}

export const FINANCE_STORE_STORAGE_KEY = "wheelskopi-finance-stores";

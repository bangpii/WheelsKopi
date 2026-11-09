import type {
  FinanceLedgerEntry,
  FinanceLedgerType,
  FinanceStoreDayRecord,
} from "@/lib/transaction-data";

export interface FinanceLedgerTotals {
  payments: number;
  purchases: number;
  sales: number;
  spends: number;
  adjustments: number;
  remainder: number;
}

export const LEDGER_TYPE_LABEL: Record<FinanceLedgerType, string> = {
  payment: "Payment",
  purchase: "Purchase",
  sales: "Sales",
  spend: "Spend",
  adjustment: "Penyesuaian",
};

export function createLedgerEntry(
  type: FinanceLedgerType = "payment",
): FinanceLedgerEntry {
  return {
    id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    ref: "",
    description: "",
    amount: 0,
    source: "",
  };
}

export function ledgerTotals(entries: FinanceLedgerEntry[]): FinanceLedgerTotals {
  const totals: FinanceLedgerTotals = {
    payments: 0,
    purchases: 0,
    sales: 0,
    spends: 0,
    adjustments: 0,
    remainder: 0,
  };

  for (const entry of entries) {
    if (entry.type === "payment") totals.payments += entry.amount;
    if (entry.type === "purchase") totals.purchases += entry.amount;
    if (entry.type === "sales") totals.sales += entry.amount;
    if (entry.type === "spend") totals.spends += entry.amount;
    if (entry.type === "adjustment") totals.adjustments += entry.amount;
  }

  totals.remainder =
    totals.payments - totals.purchases - totals.spends + totals.adjustments;

  return totals;
}

export function ledgerFromRecord(
  record: FinanceStoreDayRecord,
): FinanceLedgerEntry[] {
  if (record.ledger?.length) return record.ledger;

  const entries: FinanceLedgerEntry[] = [];
  const push = (type: FinanceLedgerType, amount: number) => {
    if (!amount) return;
    entries.push({
      id: `LEGACY-${record.id}-${type}`,
      type,
      ref: "",
      description: record.details || LEDGER_TYPE_LABEL[type],
      amount,
      source: "Data lama",
    });
  };

  push("payment", record.payments);
  push("purchase", record.purchases);
  push("sales", record.sales);
  push("spend", record.spends);

  return entries;
}

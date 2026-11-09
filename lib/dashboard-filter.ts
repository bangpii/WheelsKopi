import type { Transaction } from "@/lib/dashboard-data";

function toDate(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function filterTransactions(
  transactions: Transaction[],
  startDate?: string,
  endDate?: string,
): Transaction[] {
  if (!startDate && !endDate) return transactions;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  return transactions.filter((trx) => {
    const date = toDate(trx.tanggal || trx.date || trx.createdAt);

    if (!date) return false;
    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  });
}

export function customerNameOf(trx: Transaction): string {
  return trx.customer || "Pelanggan Umum";
}

export function countUniqueCustomers(transactions: Transaction[]): number {
  return new Set(transactions.map(customerNameOf)).size;
}

export function unitsOf(trx: Transaction): number {
  if (trx.lines) {
    return trx.lines.reduce((sum, line) => sum + line.qty, 0);
  }

  return trx.items || 0;
}

export const DAILY_OPS_STORAGE_KEY = "wheelskopi_v5_daily_ops";

export const DAILY_OPS_UNLOCK_KEY = "wheelskopi_daily_ops_unlocked";

export type DailyOpsStatus = "Pending" | "On Going" | "Selesai";

export interface DailyOpsActivity {
  id: string;
  storeName: string;
  date: string;
  time: string;
  title: string;
  subtitle: string;
  status: DailyOpsStatus;
  mechanic: string;
  createdAt: number;
}

export const DAILY_OPS_STATUSES: DailyOpsStatus[] = [
  "Pending",
  "On Going",
  "Selesai",
];

export const DAILY_OPS_ACTIVITY_TITLES = [
  { title: "Spooring", subtitle: "Kalibrasi spooring roda depan" },
  { title: "Balancing", subtitle: "Balance roda semua posisi" },
  { title: "Servis Rutin", subtitle: "Ganti oli dan cek rem" },
  { title: "Ganti Ban", subtitle: "Pemasangan ban baru" },
  { title: "Cek AC", subtitle: "Pemeriksaan sistem pendingin" },
];

export const DAILY_OPS_FALLBACK_STORES = [
  "WheelsKopi Pusat",
  "WheelsKopi Binjai",
  "WheelsKopi Deli Serdang",
  "WheelsKopi Showroom",
];

const SEED_MECHANICS = ["Andi", "Rizky", "Budi", "Sopian"];

interface RawDailyOpsActivity {
  id?: unknown;
  storeName?: unknown;
  date?: unknown;
  time?: unknown;
  title?: unknown;
  subtitle?: unknown;
  status?: unknown;
  mechanic?: unknown;
  createdAt?: unknown;
}

export function dailyOpsDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dailyOpsTimeLabel(date = new Date()): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDailyOpsDate(dateKey: string): string {
  const parts = dateKey.split("-").map(Number);

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return "-";

  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(
    "id-ID",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}

export function createDailyOpsId(): string {
  return `ops-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nextDailyOpsStatus(status: DailyOpsStatus): DailyOpsStatus {
  const index = DAILY_OPS_STATUSES.indexOf(status);

  return DAILY_OPS_STATUSES[Math.min(index + 1, DAILY_OPS_STATUSES.length - 1)];
}

export function createDailyOpsActivity(
  storeName: string,
  date: string,
  title?: string,
): DailyOpsActivity {
  const template =
    DAILY_OPS_ACTIVITY_TITLES.find((item) => item.title === title) ??
    DAILY_OPS_ACTIVITY_TITLES[
      Math.floor(Math.random() * DAILY_OPS_ACTIVITY_TITLES.length)
    ];

  const mechanic =
    SEED_MECHANICS[Math.floor(Math.random() * SEED_MECHANICS.length)];

  return {
    id: createDailyOpsId(),
    storeName,
    date,
    time: dailyOpsTimeLabel(),
    title: template.title,
    subtitle: template.subtitle,
    status: "Pending",
    mechanic,
    createdAt: Date.now(),
  };
}

export function seedDailyOps(
  storeNames: string[],
  date: string,
): DailyOpsActivity[] {
  const stores = storeNames.length ? storeNames : DAILY_OPS_FALLBACK_STORES;

  const seed = [
    { index: 0, time: "08:15", template: 0, status: "Selesai" as const },
    { index: 0, time: "10:40", template: 1, status: "On Going" as const },
    { index: 1, time: "08:50", template: 2, status: "On Going" as const },
    { index: 1, time: "11:05", template: 3, status: "Pending" as const },
    { index: 2, time: "09:10", template: 4, status: "Selesai" as const },
    { index: 2, time: "11:30", template: 0, status: "Pending" as const },
    { index: 3, time: "09:45", template: 1, status: "On Going" as const },
    { index: 3, time: "12:20", template: 2, status: "Pending" as const },
  ];

  return seed.map((row) => {
    const template = DAILY_OPS_ACTIVITY_TITLES[row.template];

    return {
      id: `seed-${date}-${row.index}-${row.template}`,
      storeName: stores[row.index % stores.length],
      date,
      time: row.time,
      title: template.title,
      subtitle: template.subtitle,
      status: row.status,
      mechanic: SEED_MECHANICS[row.index % SEED_MECHANICS.length],
      createdAt: Date.now(),
    };
  });
}

export function parseDailyOpsActivities(raw: string | null): DailyOpsActivity[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((value) => {
      const item: RawDailyOpsActivity = Object.assign({}, value);

      const id = String(item.id ?? "") || createDailyOpsId();

      const storeName = String(item.storeName ?? "");

      const date = String(item.date ?? "");

      const time = String(item.time ?? "") || "-";

      const title = String(item.title ?? "") || "Aktivitas";

      const subtitle = String(item.subtitle ?? "");

      const mechanic = String(item.mechanic ?? "") || "-";

      const status =
        DAILY_OPS_STATUSES.find((entry) => entry === item.status) ?? "Pending";

      const parsedCreatedAt = Number(item.createdAt);

      const createdAt = Number.isFinite(parsedCreatedAt)
        ? parsedCreatedAt
        : Date.now();

      return {
        id,
        storeName,
        date,
        time,
        title,
        subtitle,
        status,
        mechanic,
        createdAt,
      };
    });
  } catch {
    return [];
  }
}

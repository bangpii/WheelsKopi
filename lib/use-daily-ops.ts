"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DAILY_OPS_FALLBACK_STORES,
  DAILY_OPS_STORAGE_KEY,
  createDailyOpsActivity,
  dailyOpsDateKey,
  nextDailyOpsStatus,
  parseDailyOpsActivities,
  seedDailyOps,
  type DailyOpsActivity,
} from "@/lib/daily-ops-data";

const EMPTY: DailyOpsActivity[] = [];

let cachedRaw: string | null | undefined;

let cachedItems: DailyOpsActivity[] = EMPTY;

function readSnapshot(): DailyOpsActivity[] {
  const raw = window.localStorage.getItem(DAILY_OPS_STORAGE_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseDailyOpsActivities(raw);
  }

  return cachedItems;
}

function getServerSnapshot(): DailyOpsActivity[] {
  return EMPTY;
}

function writeSnapshot(items: DailyOpsActivity[]): void {
  const raw = JSON.stringify(items);

  cachedRaw = raw;
  cachedItems = items;
  window.localStorage.setItem(DAILY_OPS_STORAGE_KEY, raw);
  window.dispatchEvent(
    new CustomEvent("wheelskopi-store-change", {
      detail: DAILY_OPS_STORAGE_KEY,
    }),
  );
}

function subscribe(onChange: () => void): () => void {
  const handleStoreEvent = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;

    if (event.detail !== DAILY_OPS_STORAGE_KEY) return;

    onChange();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== DAILY_OPS_STORAGE_KEY) return;

    cachedRaw = undefined;
    onChange();
  };

  window.addEventListener("wheelskopi-store-change", handleStoreEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("wheelskopi-store-change", handleStoreEvent);
    window.removeEventListener("storage", handleStorage);
  };
}

const dateListeners = new Set<() => void>();

let dateTimer: number | undefined;

let currentDateKey = "";

function subscribeDate(onChange: () => void): () => void {
  currentDateKey = dailyOpsDateKey();
  dateListeners.add(onChange);

  if (dateTimer === undefined) {
    dateTimer = window.setInterval(() => {
      const next = dailyOpsDateKey();

      if (next === currentDateKey) return;

      currentDateKey = next;
      dateListeners.forEach((listener) => listener());
    }, 60_000);
  }

  return () => {
    dateListeners.delete(onChange);

    if (dateListeners.size === 0 && dateTimer !== undefined) {
      window.clearInterval(dateTimer);
      dateTimer = undefined;
    }
  };
}

function readDate(): string {
  if (!currentDateKey) currentDateKey = dailyOpsDateKey();

  return currentDateKey;
}

function getServerDate(): string {
  return "";
}

export function useDailyOps(storeNames: string[]) {
  const activities = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  const today = useSyncExternalStore(subscribeDate, readDate, getServerDate);

  useEffect(() => {
    if (!today) return;

    const raw = window.localStorage.getItem(DAILY_OPS_STORAGE_KEY);

    if (raw === null) {
      writeSnapshot(seedDailyOps(storeNames, today));
    } else {
      const parsed = parseDailyOpsActivities(raw);
      const kept = parsed.filter((item) => item.date === today);

      if (kept.length !== parsed.length) writeSnapshot(kept);
    }
  }, [storeNames, today]);

  const setActivities = useCallback(
    (
      next:
        | DailyOpsActivity[]
        | ((current: DailyOpsActivity[]) => DailyOpsActivity[]),
    ) => {
      const current = readSnapshot();
      const resolved = Array.isArray(next) ? next : next(current);

      writeSnapshot(resolved);
    },
    [],
  );

  const updateActivity = useCallback(
    (id: string, patch: Partial<DailyOpsActivity>) => {
      setActivities((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [setActivities],
  );

  const advanceStatus = useCallback(
    (id: string) => {
      setActivities((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: nextDailyOpsStatus(item.status) }
            : item,
        ),
      );
    },
    [setActivities],
  );

  const addActivity = useCallback(
    (storeName: string, title?: string) => {
      const item = createDailyOpsActivity(
        storeName,
        today || dailyOpsDateKey(),
        title,
      );

      setActivities((current) => [item, ...current]);
    },
    [setActivities, today],
  );

  const resetDemo = useCallback(() => {
    const stores = storeNames.length ? storeNames : DAILY_OPS_FALLBACK_STORES;

    writeSnapshot(seedDailyOps(stores, today || dailyOpsDateKey()));
  }, [storeNames, today]);

  return {
    activities,
    ready: Boolean(today),
    today,
    setActivities,
    updateActivity,
    advanceStatus,
    addActivity,
    resetDemo,
  };
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface ClientMountStore {
  ready: boolean;
  listeners: Set<() => void>;
}

export function useClientMounted() {
  const [store] = useState<ClientMountStore>(() => ({
    ready: false,
    listeners: new Set(),
  }));

  const mounted = useSyncExternalStore(
    (listener) => {
      store.listeners.add(listener);

      return () => {
        store.listeners.delete(listener);
      };
    },
    () => store.ready,
    () => false,
  );

  useEffect(() => {
    if (store.ready) return;

    store.ready = true;

    for (const listener of store.listeners) {
      listener();
    }
  }, [store]);

  return mounted;
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface ClientMountStore {
  subscribe: (listener: () => void) => () => void;
  getReady: () => boolean;
  markReady: () => void;
}

function createClientMountStore(): ClientMountStore {
  let ready = false;
  const listeners = new Set<() => void>();

  return {
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getReady: () => ready,
    markReady: () => {
      if (ready) return;

      ready = true;

      for (const listener of listeners) {
        listener();
      }
    },
  };
}

export function useClientMounted() {
  const [store] = useState(createClientMountStore);

  const mounted = useSyncExternalStore(
    store.subscribe,
    store.getReady,
    () => false,
  );

  useEffect(() => {
    store.markReady();
  }, [store]);

  return mounted;
}

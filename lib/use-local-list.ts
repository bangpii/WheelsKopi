"use client";

import { useState, useSyncExternalStore } from "react";
import { readLocalList, writeLocalList } from "./local-store";

const subscribe = () => () => {};

export function useLocalList<T>(key: string) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [items, setItems] = useState<T[]>(() => readLocalList<T>(key));

  const update = (next: T[]) => {
    setItems(next);
    writeLocalList(key, next);
  };

  return { items: isClient ? items : [], update };
}

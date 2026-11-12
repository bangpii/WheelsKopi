"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readSessionRaw, subscribeSession } from "@/lib/auth";
import { useData } from "@/lib/context/data-context";

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
  photo: string;
}

interface SessionSnapshot {
  name?: string;
  email?: string;
  role?: string;
  photo?: string;
  fotoKtp?: string;
}

const EMPTY_USER: CurrentUser = {
  name: "",
  email: "",
  role: "",
  photo: "",
};

function parseSession(raw: string | null): SessionSnapshot | null {
  if (!raw) return null;

  try {
    // SAFETY: the value is written by saveSession(); every field is optional.
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
}

/**
 * User yang sedang login, digabung dengan data user terbaru dari DataProvider
 * agar nama dan role selalu mengikuti perubahan di Master Management.
 */
export function useCurrentUser(): CurrentUser {
  const { users } = useData();

  const rawSession = useSyncExternalStore(
    subscribeSession,
    readSessionRaw,
    () => null,
  );

  return useMemo(() => {
    const session = parseSession(rawSession);

    if (!session) return EMPTY_USER;

    const email = (session.email ?? "").trim().toLowerCase();

    const matched = users.find(
      (user) => user.email.trim().toLowerCase() === email,
    );

    return {
      name: matched?.name || session.name || "",
      email: matched?.email || session.email || "",
      role: matched?.role || session.role || "",
      photo: matched?.fotoKtp || session.photo || "",
    };
  }, [rawSession, users]);
}

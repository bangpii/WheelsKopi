"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "../components/login-modal";
import { useData } from "@/lib/context/data-context";
import { isValidSession, readSessionRaw, subscribeSession } from "../lib/auth";

interface AuthGateProps {
  children: ReactNode;
}

type AuthStatus = "loading" | "guest" | "authed";

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { users } = useData();

  // null = belum hydration (server & render pertama), "" = belum login.
  const rawSession = useSyncExternalStore<string | null>(
    subscribeSession,
    readSessionRaw,
    () => null,
  );

  let status: AuthStatus = "loading";

  if (rawSession !== null) {
    status = isValidSession(rawSession) ? "authed" : "guest";
  }

  const isGuest = status === "guest";

  // Belum login: semua halaman diarahkan ke dashboard ("/") yang menampilkan form login.
  useEffect(() => {
    if (isGuest && pathname !== "/") {
      router.replace("/");
    }
  }, [isGuest, pathname, router]);

  // Kunci scroll halaman di belakang modal login.
  useEffect(() => {
    if (!isGuest) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isGuest]);

  const showLogin = isGuest && pathname === "/";
  const hideContent = isGuest && pathname !== "/";

  let wrapperClass: string | undefined;

  if (showLogin) {
    wrapperClass = "pointer-events-none max-h-screen overflow-hidden select-none";
  } else if (hideContent) {
    wrapperClass = "invisible";
  }

  // children selalu dirender (termasuk saat server/hydration) agar halaman tetap
  // ikut prerender; saat belum login, isinya dikunci (inert) sebagai latar modal.
  return (
    <>
      <div
        inert={isGuest}
        aria-hidden={isGuest ? true : undefined}
        className={wrapperClass}
      >
        {children}
      </div>
      {showLogin && <LoginModal users={users} />}
    </>
  );
}
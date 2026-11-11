import type { UserRecord } from "@/lib/master-data";

/** Key sesi yang sama dengan yang dibaca ProfileMenu & checkPermission. */
export const SESSION_KEY = "wheelskopi_logged_in_user";

/** Nama event yang sama dengan writeStored() di header-tools.tsx. */
export const STORE_EVENT = "wheelskopi-store-change";

/** Role yang memiliki akses penuh dan satu-satunya yang boleh mengubah Utility. */
export const ADMIN_ROLE = "Kepala Toko";

/** Role mekanik memakai halaman kerja terpisah. */
export const MECHANIC_ROLE = "Mekanik";

export function landingPathForRole(role: string) {
  return role === MECHANIC_ROLE ? "/mekanik" : "/";
}

export interface AuthSession {
  name: string;
  email: string;
  role: string;
  photo: string;
}

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; message: string };

export function authenticate(
  email: string,
  password: string,
  users: UserRecord[],
): AuthResult {
  const inputEmail = email.trim().toLowerCase();

  if (!inputEmail || !password) {
    return { ok: false, message: "Email dan password wajib diisi." };
  }

  const user = users.find((entry) => entry.email.trim().toLowerCase() === inputEmail);

  if (!user || !user.password || user.password !== password) {
    return { ok: false, message: "Email atau password salah." };
  }

  if (user.status !== "Aktif") {
    return { ok: false, message: "Akun ini tidak aktif. Hubungi Kepala Toko." };
  }

  return {
    ok: true,
    session: {
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.fotoKtp,
    },
  };
}

export function saveSession(session: AuthSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Penyimpanan browser diblokir; sesi tidak dapat disimpan.
  }

  window.dispatchEvent(new Event(STORE_EVENT));
}

/** Berlangganan perubahan sesi (login/logout, termasuk dari tab lain). */
export function subscribeSession(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORE_EVENT, callback);
  };
}

/** Isi mentah sesi di localStorage; string kosong jika tidak ada. */
export function readSessionRaw(): string {
  try {
    return localStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function isValidSession(raw: string): boolean {
  if (!raw) {
    return false;
  }

  try {
    // SAFETY: the value is written by saveSession(); every field is optional here.
    const session = JSON.parse(raw) as { email?: string };

    return Boolean(session.email);
  } catch {
    return false;
  }
}

export function parseSessionRole(raw: string | null): string | undefined {
  if (!raw) return undefined;

  try {
    const session = JSON.parse(raw) as { role?: string };

    return session.role === "Administrator" ? ADMIN_ROLE : session.role;
  } catch {
    return undefined;
  }
}
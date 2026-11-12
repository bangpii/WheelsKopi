"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RadarErrorPage } from "@/components/error/radar-error";
import { LogoutConfirmModal } from "@/components/logout-confirm-modal";
import { clearSession } from "@/lib/auth";

export default function MechanicPlaceholderPage() {
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const logout = () => {
    clearSession();
    setConfirmLogout(false);
    router.replace("/");
  };

  return (
    <>
      <RadarErrorPage
        code="500"
        title="Halaman Mekanik belum tersedia"
        description="Halaman khusus Mekanik sedang disiapkan. Silakan kembali ke halaman login untuk keluar dari akun ini."
        showNavigation={false}
        primaryActionLabel="Kembali ke Login"
        onPrimaryAction={() => setConfirmLogout(true)}
      />
      <LogoutConfirmModal
        open={confirmLogout}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={logout}
      />
    </>
  );
}

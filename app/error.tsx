"use client";

import { useEffect } from "react";
import { RadarErrorPage } from "@/components/error/radar-error";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RadarErrorPage
      code="500"
      title="Terjadi kesalahan server"
      description="Sistem gagal memproses permintaan ini. Data Anda tetap aman. Coba muat ulang halaman atau kembali ke dashboard."
      onRetry={reset}
      showReload
    />
  );
}

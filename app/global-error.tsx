"use client";

import { useEffect } from "react";
import { RadarErrorPage } from "@/components/error/radar-error";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <RadarErrorPage
          code="500"
          title="Aplikasi gagal dimuat"
          description="Terjadi gangguan pada sistem utama WheelsKopi. Coba muat ulang aplikasi. Jika masalah berlanjut, hubungi tim support."
          onRetry={reset}
          showReload
        />
      </body>
    </html>
  );
}

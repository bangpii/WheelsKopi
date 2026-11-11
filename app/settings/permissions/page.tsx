"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PermissionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/utility");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Mengalihkan ke Utility...
    </div>
  );
}

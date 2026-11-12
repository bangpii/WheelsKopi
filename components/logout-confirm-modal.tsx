"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup konfirmasi logout"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="liquid-glass rise-in relative w-full max-w-sm rounded-3xl p-6 text-center"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup konfirmasi logout"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>

        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <LogOut className="size-6" />
        </span>
        <h2
          id={titleId}
          className="font-display mt-4 text-xl font-semibold tracking-tight"
        >
          Yakin mau keluar?
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          Anda akan keluar dari akun ini dan kembali ke halaman login.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(220,38,38,0.8)] transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-red-800"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

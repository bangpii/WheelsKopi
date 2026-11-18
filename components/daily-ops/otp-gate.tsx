"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, KeyRound, RotateCcw, ShieldCheck, X } from "lucide-react";

interface OtpGateProps {
  onUnlock: () => void;
  onCancel: () => void;
}

interface OtpChallenge {
  code: string;
  expiresAt: number;
  attempts: number;
}

const OTP_LENGTH = 6;

const OTP_TTL_MS = 5 * 60 * 1000;

const MAX_ATTEMPTS = 3;

function createChallenge(): OtpChallenge {
  return {
    code: String(Math.floor(100000 + Math.random() * 900000)),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function OtpGate({ onUnlock, onCancel }: OtpGateProps) {
  const titleId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [challenge, setChallenge] = useState(createChallenge);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    inputRef.current?.focus();

    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const remainingMs = Math.max(0, challenge.expiresAt - now);
  const expired = remainingMs <= 0;
  const lockedOut = challenge.attempts >= MAX_ATTEMPTS;
  const canSubmit = input.length === OTP_LENGTH && !expired && !lockedOut;

  const regenerate = () => {
    setChallenge(createChallenge());
    setInput("");
    setError("");
    setNow(Date.now());
    inputRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (expired) {
      setError("Kode sudah kedaluwarsa. Buat kode demo baru.");

      return;
    }

    if (input.length !== OTP_LENGTH) {
      setError("Masukkan 6 digit kode.");

      return;
    }

    if (input === challenge.code) {
      onUnlock();

      return;
    }

    const attempts = challenge.attempts + 1;
    setChallenge((current) => ({ ...current, attempts }));
    setInput("");
    setError(
      attempts >= MAX_ATTEMPTS
        ? "Percobaan habis. Buat kode demo baru untuk melanjutkan."
        : `Kode salah. Sisa ${MAX_ATTEMPTS - attempts} percobaan.`,
    );
    inputRef.current?.focus();
  };

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[130] flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup gerbang OTP"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="liquid-glass rise-in relative w-full max-w-md rounded-3xl p-6 sm:p-7"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup gerbang OTP"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>

        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <ShieldCheck className="size-6" />
        </span>
        <p className="font-mono mt-5 text-[11px] tracking-[0.24em] text-primary uppercase">
          Akses operasional
        </p>
        <h2
          id={titleId}
          className="font-display mt-1.5 text-xl font-semibold tracking-tight"
        >
          Verifikasi OTP
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          Masukkan kode 6 digit untuk membuka papan On Going Daily Ops.
        </p>

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <KeyRound className="size-4" />
              Kode demo simulasi
            </div>
            <span
              className={`font-mono text-xs tabular-nums ${expired ? "text-danger" : "text-primary"}`}
            >
              {formatRemaining(remainingMs)}
            </span>
          </div>
          <p className="font-mono mt-2 text-2xl font-semibold tracking-[0.32em] text-primary">
            {challenge.code}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-primary/80">
            Tidak ada backend. Kode ini hanya untuk mencoba alur verifikasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="daily-ops-otp"
            className="text-xs font-semibold tracking-wide text-foreground"
          >
            Kode OTP
          </label>
          <input
            ref={inputRef}
            id="daily-ops-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={input}
            onChange={(event) => {
              setInput(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
              setError("");
            }}
            placeholder="000000"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "daily-ops-otp-error" : undefined}
            className="font-mono mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-center text-lg tracking-[0.32em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-label={`Sisa ${MAX_ATTEMPTS - challenge.attempts} percobaan`}>
              {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                <span
                  key={index}
                  className={`size-1.5 rounded-full ${index < challenge.attempts ? "bg-danger" : "bg-border"}`}
                />
              ))}
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                {MAX_ATTEMPTS - challenge.attempts} percobaan
              </span>
            </div>
            <button
              type="button"
              onClick={regenerate}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <RotateCcw className="size-3.5" />
              Kode baru
            </button>
          </div>

          {error && (
            <p
              id="daily-ops-otp-error"
              role="alert"
              className="mt-3 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Masuk ke papan ops
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

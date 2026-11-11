"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogIn, Mail, TriangleAlert } from "lucide-react";
import { authenticate, landingPathForRole, saveSession } from "../lib/auth";
import type { UserRecord } from "@/lib/master-data";

interface LoginModalProps {
  users: UserRecord[];
}

const fieldClass =
  "w-full rounded-xl border border-border/70 bg-background/60 py-3 pr-4 pl-10 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-ring/40";

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

export function LoginModal({ users }: LoginModalProps) {
  const router = useRouter();
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = authenticate(email, password, users);

    if (!result.ok) {
      setError(result.message);

      return;
    }

    setError("");
    saveSession(result.session);
    router.replace(landingPathForRole(result.session.role));
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="liquid-glass rise-in w-full max-w-md rounded-3xl p-6 sm:p-9"
        >
          <div className="flex flex-col items-center text-center">
            <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <Image
                src="/logo.png"
                alt="Logo WheelsKopi"
                fill
                sizes="64px"
                className="object-contain p-2"
                priority
              />
            </span>
            <p className="mt-5 font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              WheelsKopi Medan
            </p>
            <h1
              id={titleId}
              className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]"
            >
              Selamat datang kembali
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masuk Menggunakkan Akun Anda!
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor={emailId} className={labelClass}>
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="nama@wheelskopi.com"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor={passwordId} className={labelClass}>
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                id={errorId}
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:translate-y-0"
            >
              <LogIn className="size-4" />
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 WheelsKopi · Khusus pengguna terdaftar
          </p>
        </div>
      </div>
    </div>
  );
}
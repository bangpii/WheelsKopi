"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    card.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  };

  const activateGlow = () => {
    cardRef.current?.style.setProperty("--glow-active", "1");
  };

  const deactivateGlow = () => {
    cardRef.current?.style.setProperty("--glow-active", "0");
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={trackPointer}
      onPointerEnter={activateGlow}
      onPointerLeave={deactivateGlow}
      className={`glow-surface ${className ?? ""}`.trim()}
    >
      {children}
    </div>
  );
}

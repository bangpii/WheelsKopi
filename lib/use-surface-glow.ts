"use client";

import type { PointerEvent } from "react";

function getSurface(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const surface = target.closest(".surface, .glow-surface");

  if (!(surface instanceof HTMLElement)) return null;

  return surface;
}

export function useSurfaceGlow() {
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const surface = getSurface(event.target);

    if (!surface) return;

    const rect = surface.getBoundingClientRect();

    surface.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    surface.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  };

  const handlePointerOver = (event: PointerEvent<HTMLElement>) => {
    const surface = getSurface(event.target);

    surface?.style.setProperty("--glow-active", "1");
  };

  const handlePointerOut = (event: PointerEvent<HTMLElement>) => {
    const surface = getSurface(event.target);

    if (!surface) return;

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && surface.contains(nextTarget)) return;

    surface.style.setProperty("--glow-active", "0");
  };

  return {
    onPointerMove: handlePointerMove,
    onPointerOver: handlePointerOver,
    onPointerOut: handlePointerOut,
  };
}

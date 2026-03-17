"use client";

import { useEffect, useState } from "react";

type DeferredHeroIframeProps = {
  className?: string;
  src: string;
  title: string;
};

export function DeferredHeroIframe({ className, src, title }: DeferredHeroIframeProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;
    let lastInputAt = performance.now();
    const minInitialDelayMs = 1400;
    const minQuietWindowMs = 700;
    const mountedAt = performance.now();

    const markInput = () => {
      lastInputAt = performance.now();
    };

    const clearTimers = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
        idleId = null;
      }
    };

    const attemptMount = () => {
      if (cancelled) return;
      const now = performance.now();
      const initialDelayRemaining = Math.max(0, minInitialDelayMs - (now - mountedAt));
      const quietDelayRemaining = Math.max(0, minQuietWindowMs - (now - lastInputAt));
      const delay = Math.max(initialDelayRemaining, quietDelayRemaining);

      if (delay > 0) {
        timeoutId = setTimeout(scheduleIdleAttempt, delay);
        return;
      }

      setShouldRender(true);
    };

    const scheduleIdleAttempt = () => {
      if (cancelled) return;
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(attemptMount, { timeout: 2400 });
        return;
      }
      timeoutId = setTimeout(attemptMount, 250);
    };

    window.addEventListener("wheel", markInput, { passive: true });
    window.addEventListener("touchstart", markInput, { passive: true });
    window.addEventListener("pointerdown", markInput, { passive: true });
    window.addEventListener("keydown", markInput);
    scheduleIdleAttempt();

    return () => {
      cancelled = true;
      clearTimers();
      window.removeEventListener("wheel", markInput);
      window.removeEventListener("touchstart", markInput);
      window.removeEventListener("pointerdown", markInput);
      window.removeEventListener("keydown", markInput);
    };
  }, []);

  if (!shouldRender) return null;

  return <iframe src={src} title={title} className={className} loading="lazy" tabIndex={-1} />;
}

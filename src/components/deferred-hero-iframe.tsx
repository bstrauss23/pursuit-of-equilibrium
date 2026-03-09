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

    const start = () => {
      if (cancelled) return;
      setShouldRender(true);
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(start, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    timeoutId = setTimeout(start, 450);
    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return <iframe src={src} title={title} className={className} loading="eager" tabIndex={-1} />;
}

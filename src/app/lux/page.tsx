"use client";

import { useEffect } from "react";

export default function LuxPage() {
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const luxBg = "#1f2023";

    document.body.style.backgroundColor = luxBg;
    document.documentElement.style.backgroundColor = luxBg;

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  return (
    <section className="relative -mx-4 -mt-8 -mb-8 min-h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div className="absolute inset-0 bg-[#1f2023]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, rgba(255,248,236,0.14) 0%, rgba(255,246,232,0.05) 30%, rgba(255,246,232,0.00) 62%), linear-gradient(180deg, rgba(12,12,14,0.94) 0%, rgba(16,16,18,0.94) 38%, rgba(22,22,24,0.96) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 h-[42vh] w-[min(1200px,95vw)] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,247,235,0.18) 0%, rgba(245,236,222,0.10) 34%, rgba(210,198,180,0.04) 56%, rgba(200,188,172,0) 74%)",
        }}
      />

      <div className="relative h-[min(50vh,100vw)] w-full md:h-[min(85vh,100vw)]">
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-10 flex -translate-y-1/2 flex-col items-center gap-6 px-4 text-center md:gap-8">
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm tracking-[0.2em] text-zinc-300 uppercase md:text-lg">Chapter 1</p>
            <h1 className="text-4xl tracking-[0.2em] text-zinc-100 md:text-8xl">LUX</h1>
          </div>
          <h2 className="text-lg tracking-[0.08em] text-zinc-200 md:text-2xl">
            Visualizing unseen motion through light.
          </h2>
          <h3 className="text-base tracking-[0.08em] text-zinc-300 md:text-lg">by BEN STRAUSS</h3>
        </div>
      </div>
    </section>
  );
}

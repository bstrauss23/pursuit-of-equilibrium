"use client";

import Link from "next/link";
import { useState } from "react";
import { DoorwayImage } from "@/components/doorway-image";

export function LandingDoorways() {
  const [luxLoaded, setLuxLoaded] = useState(false);
  const [pendulumsLoaded, setPendulumsLoaded] = useState(false);
  const reveal = luxLoaded && pendulumsLoaded;

  return (
    <section className="relative -mx-4 -mt-8 -mb-8 h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div aria-hidden className="absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-border md:hidden" />

      <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
        <div className="doorway-mobile-pendulum-mask doorway-mobile-pendulum-mask-top">
          <div className="doorway-mobile-pendulum">
            <div className="doorway-mobile-pendulum-bob doorway-mobile-pendulum-bob-white" />
          </div>
        </div>
        <div className="doorway-mobile-pendulum-mask doorway-mobile-pendulum-mask-bottom">
          <div className="doorway-mobile-pendulum">
            <div className="doorway-mobile-pendulum-bob doorway-mobile-pendulum-bob-black" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
        <div className="doorway-pendulum-mask doorway-pendulum-mask-lux">
          <div className="doorway-pendulum-anchor">
            <div className="doorway-pendulum-stack">
              <div className="doorway-pendulum doorway-pendulum-white">
                <div className="doorway-pendulum-rod" />
                <div className="doorway-pendulum-bob" />
              </div>
            </div>
          </div>
        </div>

        <div className="doorway-pendulum-mask doorway-pendulum-mask-pendulums">
          <div className="doorway-pendulum-anchor">
            <div className="doorway-pendulum-stack">
              <div className="doorway-pendulum doorway-pendulum-black">
                <div className="doorway-pendulum-rod" />
                <div className="doorway-pendulum-bob" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid h-full grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        <Link
          href="/lux"
          className="group relative flex h-full min-h-0 items-center justify-center border-r-0 border-b-0 px-6 text-center transition md:border-r md:border-b-0"
        >
          <DoorwayImage
            src="/Lux-doorway.jpg"
            alt="Lux doorway"
            priority
            reveal={reveal}
            onLoaded={() => setLuxLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 space-y-3">
            <p className="text-base tracking-[0.2em] text-zinc-300 uppercase md:text-lg">Chapter 1</p>
            <h2 className="text-6xl tracking-[0.12em] text-white transition-all duration-500 ease-out group-hover:tracking-[0.30em]">
              LUX
            </h2>
          </div>
        </Link>

        <Link
          href="/pendulums"
          className="group relative flex h-full min-h-0 items-center justify-center px-6 text-center transition"
        >
          <DoorwayImage
            src="/Pendulums-doorway.jpeg"
            alt="Pendulums doorway"
            priority
            reveal={reveal}
            onLoaded={() => setPendulumsLoaded(true)}
          />
          <div className="absolute inset-0 bg-white/45" />
          <div className="relative z-10 space-y-3">
            <p className="text-base tracking-[0.2em] text-zinc-600 uppercase md:text-lg">Chapter 2</p>
            <h2 className="text-6xl tracking-[0.12em] text-zinc-900 transition-all duration-500 ease-out group-hover:tracking-[0.2em]">
              PENDULUMS
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}

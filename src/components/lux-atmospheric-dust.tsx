"use client";

import { useEffect, useRef } from "react";

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  depth: number;
  twinkle: number;
  phase: number;
};

function fract(value: number) {
  return value - Math.floor(value);
}

function hash2(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);

  const n00 = hash2(x0, y0);
  const n10 = hash2(x1, y0);
  const n01 = hash2(x0, y1);
  const n11 = hash2(x1, y1);

  const ix0 = n00 + (n10 - n00) * sx;
  const ix1 = n01 + (n11 - n01) * sx;
  return ix0 + (ix1 - ix0) * sy;
}

function fbm(x: number, y: number) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 4; i += 1) {
    total += amplitude * valueNoise(x * frequency, y * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }
  return total;
}

export function LuxAtmosphericDust() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl: HTMLCanvasElement = canvas;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const navWithMemory = navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = navWithMemory.deviceMemory ?? 8;
    const lowPower = coarsePointer || deviceMemory <= 4;
    const particles: DustParticle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();
    let lastRender = performance.now();
    const frameIntervalMs = reduceMotion ? 1000 / 12 : 1000 / 30;
    let isHidden = document.hidden;

    const spriteCanvas = document.createElement("canvas");
    const spriteSize = 72;
    spriteCanvas.width = spriteSize;
    spriteCanvas.height = spriteSize;
    const spriteContext = spriteCanvas.getContext("2d");
    if (!spriteContext) return;
    const spriteGradient = spriteContext.createRadialGradient(
      spriteSize * 0.5,
      spriteSize * 0.5,
      0,
      spriteSize * 0.5,
      spriteSize * 0.5,
      spriteSize * 0.5
    );
    spriteGradient.addColorStop(0, "rgba(255,248,236,0.32)");
    spriteGradient.addColorStop(0.3, "rgba(255,248,236,0.2)");
    spriteGradient.addColorStop(0.62, "rgba(255,248,236,0.08)");
    spriteGradient.addColorStop(1, "rgba(255,248,236,0)");
    spriteContext.fillStyle = spriteGradient;
    spriteContext.beginPath();
    spriteContext.arc(spriteSize * 0.5, spriteSize * 0.5, spriteSize * 0.5, 0, Math.PI * 2);
    spriteContext.fill();

    function createParticles() {
      particles.length = 0;
      const densityDivisor = lowPower ? 16000 : 11500;
      const minCount = lowPower ? 70 : 105;
      const count = Math.max(minCount, Math.floor((width * height) / densityDivisor));
      for (let i = 0; i < count; i += 1) {
        const depth = 0.45 + Math.random() * 0.9;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 4,
          r: (0.38 + Math.random() * 1.45) * depth,
          a: (0.12 + Math.random() * 0.38) * (0.72 + depth * 0.5),
          depth,
          twinkle: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function resize() {
      const rect = canvasEl.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // Slightly below full DPI to keep softness without heavy smear.
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.25);
      canvasEl.width = Math.max(1, Math.floor(width * dpr));
      canvasEl.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    }

    function draw(now: number) {
      if (isHidden) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }
      if (now - lastRender < frameIntervalMs) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }
      lastRender = now;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now * 0.00012;
      const camDriftX = Math.sin(now * 0.00009) * 5;
      const camDriftY = Math.cos(now * 0.00007) * 3;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (const p of particles) {
        if (!reduceMotion) {
          const nx = p.x * 0.0038 + t * 0.8;
          const ny = p.y * 0.0038 + t * 0.62;
          const flowA = fbm(nx, ny);
          const flowB = fbm(nx * 1.37 + 19.2, ny * 1.19 + 47.8);
          const angle = flowA * Math.PI * 2.2 + flowB * Math.PI;

          const flowSpeed = 4 + p.depth * 8;
          const targetVx = Math.cos(angle) * flowSpeed;
          const targetVy = Math.sin(angle) * flowSpeed * 0.55;
          const blend = Math.min(1, dt * (1.35 + p.depth * 1.1));

          p.vx += (targetVx - p.vx) * blend;
          p.vy += (targetVy - p.vy) * blend;

          const microJitterX = Math.sin(now * 0.00045 + p.phase + p.y * 0.02) * (0.7 + p.depth * 0.45);
          const microJitterY = Math.cos(now * 0.0004 + p.phase * 1.3 + p.x * 0.018) * (0.3 + p.depth * 0.2);

          p.x += (p.vx + microJitterX) * dt;
          p.y += (p.vy + microJitterY) * dt;

          const margin = 14;
          if (p.x < -margin) p.x = width + margin;
          if (p.x > width + margin) p.x = -margin;
          if (p.y < -margin) p.y = height + margin;
          if (p.y > height + margin) p.y = -margin;

          p.twinkle += dt * (0.22 + p.depth * 0.18);
        }

        const px = p.x + camDriftX * p.depth;
        const py = p.y + camDriftY * p.depth;
        const topFade = Math.max(0, 1 - py / (height * 1.03));
        const twinkleAmp = 0.82 + 0.18 * Math.sin(p.twinkle);
        const nx = px / Math.max(width, 1);
        const ny = py / Math.max(height, 1);
        const dx = (nx - 0.5) / 0.46;
        const dy = (ny - 0.06) / 0.34;
        const radialLight = Math.exp(-(dx * dx + dy * dy) * 2.25);
        const beamBoost = 0.6 + radialLight * 1.35;
        const alpha = p.a * topFade * twinkleAmp * beamBoost;
        if (alpha < 0.01) continue;

        const size = p.r * 6.8;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(spriteCanvas, px - size * 0.5, py - size * 0.5, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      rafId = window.requestAnimationFrame(draw);
    }

    function onVisibilityChange() {
      isHidden = document.hidden;
    }

    resize();
    rafId = window.requestAnimationFrame(draw);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[46vh] overflow-hidden"
      style={{
        opacity: 0.92,
        mixBlendMode: "screen",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)",
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full [filter:blur(0.2px)]" />
    </div>
  );
}

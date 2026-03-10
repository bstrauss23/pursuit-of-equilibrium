"use client";

import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PENDULUM_SCRIPT_URL = "https://cdn.transientlabs.xyz/tlx/pendulums/Pendulums-23.html";

type MetadataState = {
  systemRating?: string;
  perfectionScore?: string | number;
  lightMode?: string;
  lineTypeString?: string;
  colorTheme?: string;
  periodRatioString?: string;
  periodOffset?: string | number;
  amplitudeX?: string | number;
  amplitudeY?: string | number;
  runtime?: string | number;
  cycleCount?: string | number;
  dampingX?: string | number;
  dampingY?: string | number;
};

type StringOnlyMetadataField =
  | "systemRating"
  | "lightMode"
  | "lineTypeString"
  | "colorTheme"
  | "periodRatioString";

const EMPTY_METADATA: MetadataState = {};
const METADATA_FIELDS = [
  "systemRating",
  "perfectionScore",
  "lightMode",
  "lineTypeString",
  "colorTheme",
  "periodRatioString",
  "periodOffset",
  "amplitudeX",
  "amplitudeY",
  "dampingX",
  "dampingY",
  "cycleCount",
  "runtime",
] as const satisfies ReadonlyArray<keyof MetadataState>;

const FIELD_ALIASES: Record<keyof MetadataState, string[]> = {
  systemRating: ["systemRating", "system_rating"],
  perfectionScore: ["perfectionScore", "perfection_score", "score"],
  lightMode: ["lightMode", "mode", "displayMode"],
  lineTypeString: ["lineTypeString", "lineType", "line_type"],
  colorTheme: ["colorTheme", "theme", "color_theme"],
  periodRatioString: ["periodRatioString", "periodRatio", "period_ratio"],
  periodOffset: ["periodOffset", "period_offset", "offset"],
  amplitudeX: ["amplitudeX", "ampX", "amplitude_x"],
  amplitudeY: ["amplitudeY", "ampY", "amplitude_y"],
  runtime: ["runtime", "swingTime", "swing_time", "swingTimeSec"],
  cycleCount: ["cycleCount", "cycles", "cycle_count"],
  dampingX: ["dampingX", "damping_x"],
  dampingY: ["dampingY", "damping_y"],
};

function extractFieldValue(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in data) {
      return data[key];
    }
  }
  return undefined;
}

function isStringOnlyField(field: keyof MetadataState): field is StringOnlyMetadataField {
  return (
    field === "systemRating" ||
    field === "lightMode" ||
    field === "lineTypeString" ||
    field === "colorTheme" ||
    field === "periodRatioString"
  );
}

function randomSeed32() {
  return Math.floor(Math.random() * 2 ** 32);
}

function formatValue(value: string | number | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function OutputProfileCards({ metadata }: { metadata: MetadataState }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Perfection</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">System Rating: {formatValue(metadata.systemRating)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Perfection Score: {formatValue(metadata.perfectionScore)}</p>
      </div>

      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Style</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">Mode: {formatValue(metadata.lightMode)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Color Theme: {formatValue(metadata.colorTheme)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Line Type: {formatValue(metadata.lineTypeString)}</p>
      </div>

      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Period</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">Period Ratio: {formatValue(metadata.periodRatioString)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Period Offset: {formatValue(metadata.periodOffset)}</p>
      </div>

      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Amplitude</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">Amplitude X: {formatValue(metadata.amplitudeX)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Amplitude Y: {formatValue(metadata.amplitudeY)}</p>
      </div>

      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Damping</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">Damping X: {formatValue(metadata.dampingX)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Damping Y: {formatValue(metadata.dampingY)}</p>
      </div>

      <div className="min-w-0 border border-border bg-[#f8f6f1] p-4 shadow-[0_2px_5px_#0003]">
        <h4 className="mb-3 text-left text-lg tracking-[0.06em] text-foreground/80 uppercase">Cycle</h4>
        <p className="break-words text-base text-foreground/80 md:text-lg">Cycle Count: {formatValue(metadata.cycleCount)}</p>
        <p className="break-words text-base text-foreground/80 md:text-lg">Swing Time (sec): {formatValue(metadata.runtime)}</p>
      </div>
    </div>
  );
}

export function PendulumsSystemSection() {
  const [seed, setSeed] = useState<number | null>(() => randomSeed32());
  const [isListenerReady, setIsListenerReady] = useState(false);
  const [metadata, setMetadata] = useState<MetadataState>(EMPTY_METADATA);

  const iframeSrc = useMemo(() => {
    if (!isListenerReady || seed === null) {
      return "about:blank";
    }
    return `${PENDULUM_SCRIPT_URL}?seed=${seed}`;
  }, [isListenerReady, seed]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }

      if ("type" in data && (data as { type?: string }).type === "canvas-image") {
        return;
      }

      const next: MetadataState = {};

      for (const field of METADATA_FIELDS) {
        const value = extractFieldValue(data as Record<string, unknown>, FIELD_ALIASES[field]);
        if (value === undefined || value === null || value === "") continue;
        if (isStringOnlyField(field)) {
          next[field] = String(value);
        } else {
          next[field] = typeof value === "number" ? value : String(value);
        }
      }

      if (Object.keys(next).length > 0) {
        setMetadata((current) => ({ ...current, ...next }));
      }
    }

    window.addEventListener("message", onMessage);
    const readyTimeout = window.setTimeout(() => {
      setIsListenerReady(true);
    }, 0);
    return () => {
      window.clearTimeout(readyTimeout);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  function runSystem() {
    const nextSeed = randomSeed32();
    setMetadata(EMPTY_METADATA);
    setSeed(null);
    window.setTimeout(() => {
      setSeed(nextSeed);
    }, 10);
  }

  return (
    <section
      id="algorithm"
      className="scroll-mt-28 mx-auto content-width overflow-x-clip px-4 md:px-6"
    >
      <div className="mb-12 flex items-center justify-center gap-4 md:mb-16 md:gap-6">
        <span className="h-[2px] w-16 md:w-60 bg-gradient-to-r from-transparent to-foreground/40" />
        <h2 className="text-3xl text-foreground/80 md:text-5xl">The System</h2>
        <span className="h-[2px] w-16 md:w-60 bg-gradient-to-l from-transparent to-foreground/40" />
      </div>

      <p className="mx-auto content-width mb-6 text-center text-base leading-8 text-foreground md:mb-8 md:text-left md:text-lg">
        This is the engine behind every piece in the collection. Each time you click Generate, a new system comes to
        life, just like it will during the actual mint. <strong>Click</strong> the artwork to watch the pendulum draw
        itself, stroke by stroke, in real time. You&apos;ll also find each generated artwork&apos;s output profile: a
        snapshot of the variables that shaped its motion, from period ratios and amplitudes to damping, line type,
        and runtime.
      </p>

      <div className="grid overflow-hidden border border-border bg-[#f8f6f1] shadow-[0_2px_5px_#0003] lg:h-[700px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 h-[420px] overflow-hidden border-b border-border md:h-[520px] lg:h-full lg:border-r lg:border-b-0">
          <iframe
            key={seed}
            src={iframeSrc}
            title="Pendulums system"
            className="block h-full w-full border-0 bg-transparent"
            scrolling="no"
          />
        </div>

        <aside className="flex min-w-0 h-full flex-col p-6 text-left md:p-8">
          <h3 className="mb-5 hidden text-2xl tracking-[0.08em] text-foreground/80 uppercase lg:block md:text-[2rem]">
            Output Profile
          </h3>

          <div className="min-w-0 flex-1 overflow-y-auto pr-1">
            <div className="hidden lg:block">
              <OutputProfileCards metadata={metadata} />
            </div>

            <div className="lg:hidden">
              <Accordion type="single" collapsible className="w-full border border-border px-4">
                <AccordionItem value="output-profile" className="border-0">
                  <AccordionTrigger className="text-lg tracking-[0.06em] text-foreground/80 uppercase hover:no-underline">
                    Output Profile
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <OutputProfileCards metadata={metadata} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <button
            type="button"
            onClick={runSystem}
            className="mt-4 border border-[#333] px-5 py-3 text-lg text-foreground/80 transition-colors hover:bg-black/5"
          >
            Run the System
          </button>
        </aside>
      </div>
    </section>
  );
}

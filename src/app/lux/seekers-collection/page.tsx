"use client";

import { useEffect } from "react";
import { SeekersGallery } from "@/components/seekers-gallery";

export default function SeekersCollectionPage() {
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyButtonHover = document.body.style.getPropertyValue("--button-hover-bg");
    const prevHtmlButtonHover = document.documentElement.style.getPropertyValue("--button-hover-bg");
    const luxBg = "#17181b";
    const luxButtonHover = "oklch(0.24 0.007 286.1)";
    document.body.style.backgroundColor = luxBg;
    document.documentElement.style.backgroundColor = luxBg;
    document.body.style.setProperty("--button-hover-bg", luxButtonHover);
    document.documentElement.style.setProperty("--button-hover-bg", luxButtonHover);
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      if (prevBodyButtonHover) {
        document.body.style.setProperty("--button-hover-bg", prevBodyButtonHover);
      } else {
        document.body.style.removeProperty("--button-hover-bg");
      }
      if (prevHtmlButtonHover) {
        document.documentElement.style.setProperty("--button-hover-bg", prevHtmlButtonHover);
      } else {
        document.documentElement.style.removeProperty("--button-hover-bg");
      }
    };
  }, []);

  return (
    <div className="relative -mx-4 -mt-8 -mb-8 min-h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div className="absolute inset-0 bg-[#17181b]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, rgba(255,248,236,0.08) 0%, rgba(255,246,232,0.03) 30%, rgba(255,246,232,0.00) 62%), linear-gradient(180deg, rgba(5,5,7,0.97) 0%, rgba(12,12,14,0.95) 38%, rgba(20,20,22,0.97) 100%)",
        }}
      />
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <SeekersGallery />
      </div>
    </div>
  );
}

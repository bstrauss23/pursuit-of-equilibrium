"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PROLOGUE_PASSWORD = "different";
const PROLOGUE_UNLOCKED_STORAGE_KEY = "poe.prologue.unlocked";

type PrologueGateProps = {
  children: ReactNode;
};

export function PrologueGate({ children }: PrologueGateProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    try {
      const unlocked = window.localStorage.getItem(PROLOGUE_UNLOCKED_STORAGE_KEY) === "true";
      setIsUnlocked(unlocked);
    } catch {
      // Ignore storage access issues and fall back to per-visit unlock only.
    } finally {
      setIsReady(true);
    }
  }, []);

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const matches = password === PROLOGUE_PASSWORD;
    setIsUnlocked(matches);
    setShowError(!matches);

    if (matches) {
      try {
        window.localStorage.setItem(PROLOGUE_UNLOCKED_STORAGE_KEY, "true");
      } catch {
        // Ignore storage access issues and keep current-session unlock behavior.
      }
    }
  }

  if (isReady && isUnlocked) {
    return <>{children}</>;
  }

  return (
    <section className="relative -mx-4 -mt-8 -mb-8 min-h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div className="absolute inset-0 bg-[#17181b]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, rgba(255,248,236,0.14) 0%, rgba(255,246,232,0.05) 30%, rgba(255,246,232,0.00) 62%), linear-gradient(180deg, rgba(5,5,7,0.97) 0%, rgba(12,12,14,0.95) 38%, rgba(20,20,22,0.97) 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1400px] items-center justify-center px-4 py-16 md:px-8">
        <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-[#1c1d21]/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <h1 className="text-lg font-medium tracking-tight text-zinc-100">Enter password</h1>
          <p className="mt-1 text-sm text-zinc-400">This page is protected.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <Input
              id="prologue-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (showError) setShowError(false);
              }}
              autoComplete="current-password"
              placeholder="Password"
              aria-invalid={showError}
              className="h-10 border-zinc-700 bg-zinc-950/70 text-zinc-100 placeholder:text-zinc-500"
            />
            {showError ? <p className="text-sm text-rose-400">Incorrect password.</p> : null}
            <Button
              type="submit"
              className="h-10 w-full border border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

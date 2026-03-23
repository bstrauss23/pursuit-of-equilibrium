"use client";

import { useEffect } from "react";

type WindowWithEthereum = Window & {
  ethereum?: Record<string, unknown>;
};

export function EthereumShim() {
  useEffect(() => {
    const globalWindow = window as WindowWithEthereum;

    // Some mobile runtimes execute scripts that assume window.ethereum exists.
    // Provide a minimal object so those writes do not crash the app.
    if (typeof globalWindow.ethereum === "undefined") {
      globalWindow.ethereum = {};
    }
  }, []);

  return null;
}

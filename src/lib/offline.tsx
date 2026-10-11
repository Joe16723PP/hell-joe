"use client";

import { useEffect } from "react";

// The service worker caches pages and illustrations so a later visit works offline.
// Dev mode skips it: a stale cache there hides source changes.
export function useOffline() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    void navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {});
  }, []);
}

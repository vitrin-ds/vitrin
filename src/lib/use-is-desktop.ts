"use client";

import { useSyncExternalStore } from "react";

// Patterns that change their container or counts at the desktop breakpoint (Quick View: Dialog
// vs Bottom Sheet; Product Gallery: 6 vs 4 thumbnails) need it in JS, not only in CSS. Mirrors
// `--breakpoint-desktop` (theme.css). False on the server and during hydration (mobile first),
// and where matchMedia is missing (jsdom).

export const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_QUERY).matches;
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

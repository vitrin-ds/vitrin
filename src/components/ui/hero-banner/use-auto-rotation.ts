"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// Shared rotation state for promotion carousels (Hero Banner, Header Top Bar), following the WAI-ARIA
// APG carousel: rotation is opt-in (`interval`), stops while the pointer is over the carousel or
// focus is inside it, can be paused with a visible control, and never starts on its own for
// people who prefer reduced motion (they can still press Play). Moving by hand keeps the
// rotation state; an explicit Pause stays paused, an explicit Play starts rotating even while
// the pointer or focus is on the Play button.

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}

const reducedMotionSnapshot = () =>
  typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches;

/** On the server (and at hydration) rotation is treated as reduced, so it starts after mount. */
const reducedMotionServerSnapshot = () => true;

export interface AutoRotation {
  index: number;
  /** The item has changed at least once: fade-ins start then, never on first paint (LCP). */
  changed: boolean;
  /** Shows item `i` (clamped to the list). */
  goTo: (i: number) => void;
  /** Next / previous item, wrapping at the ends. */
  next: () => void;
  previous: () => void;
  /** Rotation is configured (an interval and more than one item). */
  canRotate: boolean;
  /** The user (or the default) wants rotation on; hover and focus may still hold it. */
  playing: boolean;
  /** Rotation is running right now. Slides are `aria-live="off"` only while this is true. */
  rotating: boolean;
  togglePlaying: () => void;
  /** Spread on the carousel root: pauses on hover and while focus is inside. */
  holdHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
}

export function useAutoRotation(count: number, interval?: number): AutoRotation {
  const [index, setIndexState] = useState(0);
  const [changed, setChanged] = useState(false);
  const setIndex = useCallback((update: (i: number) => number) => {
    setIndexState(update);
    setChanged(true);
  }, []);
  const canRotate = interval !== undefined && interval > 0 && count > 1;
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    reducedMotionServerSnapshot,
  );
  // null until the user presses Pause / Play: then rotation follows the motion preference.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = canRotate && (choice ?? !reducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const rotating = playing && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [rotating, count, interval, setIndex]);

  const goTo = useCallback(
    (i: number) => setIndex(() => Math.min(Math.max(i, 0), Math.max(count - 1, 0))),
    [count, setIndex],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(count, 1)), [count, setIndex]);
  const previous = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)),
    [count, setIndex],
  );

  return {
    index: Math.min(index, Math.max(count - 1, 0)),
    changed,
    goTo,
    next,
    previous,
    canRotate,
    playing,
    rotating,
    togglePlaying: () => {
      setChoice(!playing);
      // An explicit Play wins over the hover / focus hold (APG: rotation resumes on Play).
      if (!playing) {
        setHovered(false);
        setFocused(false);
      }
    },
    holdHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      },
    },
  };
}

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in sync with the viewport. `false` on the server and during
 * hydration (mobile-first), and wherever matchMedia is missing.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
    () => false,
  );
}

/** The `tablet:` breakpoint (744px): RightSheet from here up, BottomSheet below. */
export const TABLET_QUERY = "(min-width: 744px)";

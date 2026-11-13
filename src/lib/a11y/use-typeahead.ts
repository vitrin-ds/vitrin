"use client";

import { useCallback, useEffect, useRef } from "react";
import type { NavigableItem } from "./list-navigation";

/** APG type-ahead: keys typed within this window build one search string. */
export const TYPEAHEAD_RESET_MS = 500;

/** True for a key that should feed type-ahead (one printable character, no modifier). */
export function isTypeaheadKey(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}) {
  return (
    event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}

/**
 * Returns `search(char, from)`: the index of the next enabled item whose label starts with the
 * typed string. Repeating one letter cycles through the items starting with it.
 */
export function useTypeahead<T extends NavigableItem>(
  items: readonly T[],
  getLabel: (item: T) => string,
) {
  const buffer = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (char: string, from: number): number | null => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => (buffer.current = ""), TYPEAHEAD_RESET_MS);
      buffer.current += char.toLowerCase();

      const query = buffer.current;
      const repeated = query.length > 1 && [...query].every((c) => c === query[0]);
      const needle = repeated ? query[0] : query;
      // A new search starts after the current item; a growing one may stay on it.
      const start = query.length === 1 || repeated ? from + 1 : from;

      for (let n = 0; n < items.length; n++) {
        const i = (start + n + items.length) % items.length;
        const item = items[i];
        if (!item.disabled && getLabel(item).toLowerCase().startsWith(needle)) return i;
      }
      return null;
    },
    [items, getLabel],
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma "Highlight the matched term in title/snippet with a bold range override". The match is a
// <mark> (screen readers can announce it as highlighted) with <strong> for the bold range; the
// browser's `bolder` lifts the surrounding weight one step, so it works on any text style.

export interface MatchRange {
  start: number;
  end: number;
}

/**
 * Every case-insensitive occurrence of `query` (trimmed) in `text`, left to right, without
 * overlaps. Empty when the query is blank or lower-casing changes the text length (some
 * locale-specific letters), so the ranges can always be mapped back onto `text`.
 */
export function findMatches(text: string, query: string): MatchRange[] {
  const needle = query.trim().toLowerCase();
  const haystack = text.toLowerCase();
  if (!needle || haystack.length !== text.length) return [];
  const ranges: MatchRange[] = [];
  let from = 0;
  while (from <= haystack.length - needle.length) {
    const start = haystack.indexOf(needle, from);
    if (start === -1) break;
    ranges.push({ start, end: start + needle.length });
    from = start + needle.length;
  }
  return ranges;
}

export interface HighlightMatchProps {
  text: string;
  /** The search term; blank shows the text as is. */
  query: string;
  /** Colour of the matched range (Figma SearchResult: text-primary). Inherits by default. */
  className?: string;
}

/** Renders `text` with each match of `query` as a bold `<mark>`. No HTML injection. */
export function HighlightMatch({ text, query, className }: HighlightMatchProps) {
  const ranges = findMatches(text, query);
  if (ranges.length === 0) return text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(({ start, end }) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className={cn("bg-transparent text-inherit", className)}>
        <strong>{text.slice(start, end)}</strong>
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

// Pure index helpers for list widgets (listbox, menu, tabs). Disabled items are skipped and
// movement stops at the ends (WAI-ARIA APG listbox: no wrap).

export interface NavigableItem {
  disabled?: boolean;
}

export type ListMove = "next" | "previous" | "first" | "last";

/** The index a key moves to, or `current` when nothing enabled lies in that direction. */
export function moveIndex(
  items: readonly NavigableItem[],
  current: number,
  move: ListMove,
): number {
  const enabled = (i: number) => items[i] && !items[i].disabled;
  if (move === "first" || move === "last") {
    const order = items.map((_, i) => i);
    if (move === "last") order.reverse();
    return order.find(enabled) ?? current;
  }
  const step = move === "next" ? 1 : -1;
  for (let i = current + step; i >= 0 && i < items.length; i += step) {
    if (enabled(i)) return i;
  }
  return current;
}

/** Maps a key to a list move: arrows, Home / End, PageUp / PageDown (to the ends). */
export function keyToMove(key: string): ListMove | null {
  switch (key) {
    case "ArrowDown":
      return "next";
    case "ArrowUp":
      return "previous";
    case "Home":
    case "PageUp":
      return "first";
    case "End":
    case "PageDown":
      return "last";
    default:
      return null;
  }
}

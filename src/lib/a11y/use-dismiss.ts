"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onDismiss` when the user presses the pointer or moves focus outside every element in
 * `refs` while `open`. Escape is left to the widget, which knows where focus should go.
 */
export function useDismiss(
  refs: readonly RefObject<HTMLElement | null>[],
  open: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node && refs.some((ref) => ref.current?.contains(target));

    const onPointerDown = (event: PointerEvent) => {
      if (!inside(event.target)) onDismiss();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!inside(event.target)) onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [refs, open, onDismiss]);
}

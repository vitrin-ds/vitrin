"use client";

import { useEffect, useRef, type RefObject } from "react";

// Modal behaviour shared by Dialog, Bottom Sheet and Right Sheet (WAI-ARIA APG dialog pattern):
// - the rest of the page is `inert` (no focus, no pointer, hidden from assistive technology);
// - Tab and Shift+Tab cycle inside the panel;
// - Escape closes the topmost modal only;
// - the page behind does not scroll;
// - on close, focus goes back to the element that had it when the modal opened.

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Tabbable elements inside `root`, in DOM order (hidden and inert subtrees excluded). */
export function tabbables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[hidden], [inert]"),
  );
}

/** Open modals, innermost last: only the top one reacts to Escape and Tab. */
const stack: HTMLElement[] = [];
const SCROLL_LOCK_CLASS = "overflow-hidden";

export interface UseModalOptions {
  /** Called on Escape. The owner decides whether to close. */
  onClose: () => void;
  /** Receives focus on open; defaults to the first tabbable element, else the panel. */
  initialFocus?: RefObject<HTMLElement | null>;
}

/** Wires the modal behaviour to `panelRef` while `open`. The panel must be portalled to body. */
export function useModal(
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
  { onClose, initialFocus }: UseModalOptions,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // The body child that holds this modal (its portal root) stays live; every other one goes inert.
    let root: HTMLElement = panel;
    while (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
    const inerted = [...document.body.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== root && !el.hasAttribute("inert"),
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    stack.push(panel);
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);

    const target = initialFocus?.current ?? tabbables(panel)[0] ?? panel;
    target.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (stack.at(-1) !== panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = tabbables(panel);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !(active instanceof Node) || !panel.contains(active);
      if (event.shiftKey && (active === first || active === panel || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(panel), 1);
      inerted.forEach((el) => el.removeAttribute("inert"));
      if (stack.length === 0) document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
      if (previous?.isConnected) previous.focus();
    };
  }, [panelRef, open, initialFocus]);
}

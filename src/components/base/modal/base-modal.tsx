"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useModal } from "@/lib/a11y/use-modal";

// Structure and behaviour shared by Dialog, Bottom Sheet and Right Sheet: a portal to <body>, the
// surface-overlay scrim, a surface-raised panel and the modal behaviour from useModal (inert page,
// focus trap, Escape, scroll lock, focus return). Motion (Figma overlay rule): enter 200ms
// ease-out, exit 150ms ease-in, none with reduced motion (motion-* utilities in globals.css).
// While the exit runs the page is already live again and the panel is aria-hidden.

/** Exit duration, as in the motion-* utilities. */
export const OVERLAY_EXIT_MS = 150;

const MOTION_CLASS = {
  dialog: "motion-dialog",
  "sheet-bottom": "motion-sheet-bottom",
  "sheet-right": "motion-sheet-right",
} as const;

export interface BaseModalProps {
  open: boolean;
  /** Escape, the scrim and close buttons call this. */
  onClose: () => void;
  /** `dialog`, or `alertdialog` for urgent confirmations (APG). */
  role?: "dialog" | "alertdialog";
  /** id of the visible title. */
  labelledBy?: string;
  /** Accessible name when there is no visible title. */
  label?: string;
  /** id of the main message. */
  describedBy?: string;
  /** Receives focus on open (APG: the least destructive action in a confirmation). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Dialog fades and scales; sheets slide from their edge. */
  motion: keyof typeof MOTION_CLASS;
  /** Positions the panel inside the fixed full-screen layer. */
  layoutClassName?: string;
  className?: string;
  children: ReactNode;
}

export function BaseModal({
  open,
  onClose,
  role = "dialog",
  labelledBy,
  label,
  describedBy,
  initialFocus,
  motion,
  layoutClassName,
  className,
  children,
}: BaseModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useIsClient();
  // `present` outlives `open` by the exit animation.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  useEffect(() => {
    if (open || !present) return;
    const timer = setTimeout(() => setPresent(false), prefersReducedMotion() ? 0 : OVERLAY_EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, present]);

  useModal(panelRef, open && mounted, { onClose, initialFocus });

  if (!present || !mounted) return null;
  const state = open ? "open" : "closed";
  return createPortal(
    <div
      className={cn("fixed inset-0 z-50 flex", !open && "pointer-events-none", layoutClassName)}
      aria-hidden={open ? undefined : true}
    >
      {/* The scrim is a pointer target only; keyboard users close with Escape or the close button. */}
      <div
        aria-hidden
        data-state={state}
        className="absolute inset-0 motion-overlay bg-surface-overlay"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        aria-describedby={describedBy}
        tabIndex={-1}
        data-state={state}
        className={cn(
          "relative flex flex-col bg-surface-raised outline-none",
          MOTION_CLASS[motion],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const noopSubscribe = () => () => undefined;

/** false during SSR and hydration, true after: the portal needs document.body. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

"use client";

import { cva } from "class-variance-authority";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Toast` (Usage × Tone) on the callout-* component tokens: radius 8, padding 16, shadow/lg,
// icon + body (body-medium), an underlined label-large action, inline (Single Line) or on its own
// row (Multiple Line), and a close button (`Show Close`, on by default). Neutral is the dark
// callout-neutral-solid toast; the other tones use the soft callout colours with a 1px inside
// border. One at a time, never stacked; it hides after TOAST_DURATION_MS unless the pointer or
// focus is on it (WCAG 2.2.1).

/** Figma Do: "Auto-dismiss after 3-5 seconds". */
export const TOAST_DURATION_MS = 5000;

export const toastVariants = cva("flex flex-col gap-12 rounded-overlay p-16 shadow-lg", {
  variants: {
    tone: {
      neutral: "bg-(--th-callout-neutral-solid-bg) text-(--th-callout-neutral-solid-text)",
      success:
        "bg-(--th-callout-success-soft-bg) text-(--th-callout-success-soft-text) inset-ring inset-ring-(--th-callout-success-soft-border)",
      error:
        "bg-(--th-callout-error-soft-bg) text-(--th-callout-error-soft-text) inset-ring inset-ring-(--th-callout-error-soft-border)",
      warning:
        "bg-(--th-callout-warning-soft-bg) text-(--th-callout-warning-soft-text) inset-ring inset-ring-(--th-callout-warning-soft-border)",
      info: "bg-(--th-callout-info-soft-bg) text-(--th-callout-info-soft-text) inset-ring inset-ring-(--th-callout-info-soft-border)",
    },
  },
});

export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";

const ICON_CLASS = {
  neutral: "text-(--th-callout-neutral-solid-icon)",
  success: "text-(--th-callout-success-soft-icon)",
  error: "text-(--th-callout-error-soft-icon)",
  warning: "text-(--th-callout-warning-soft-icon)",
  info: "text-(--th-callout-info-soft-icon)",
} as const satisfies Record<ToastTone, string>;

/** The tone's glyph, as for Alert. */
export const TOAST_ICONS = {
  neutral: "info",
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
} as const satisfies Record<ToastTone, IconName>;

export const TOAST_DEFAULTS = { usage: "single", tone: "neutral", showClose: true } as const;

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  /** Figma `Body Text`. Keep it under two lines. */
  children: ReactNode;
  /** Figma `Usage`: Single Line keeps the action inline, Multiple Line puts it below. */
  usage?: "single" | "multiple";
  /** Figma `Tone`: Neutral (dark) for most feedback; the others for success / problems. */
  tone?: ToastTone;
  /** Figma `Inner Action` / `Bottom Action`, e.g. Undo. */
  action?: ToastAction;
  /** Figma `Left Icon`; defaults to the tone's glyph. Decorative. */
  icon?: IconName;
  /** Figma `Show Close`. The button only renders when there is an `onDismiss`. */
  showClose?: boolean;
  /** Called by the close button ("Dismiss notification"). */
  onDismiss?: () => void;
  className?: string;
}

/** The toast surface. Normally shown through `useToast()`; rendered directly in Storybook. */
export function Toast({
  children,
  usage = TOAST_DEFAULTS.usage,
  tone = TOAST_DEFAULTS.tone,
  action,
  icon,
  showClose = TOAST_DEFAULTS.showClose,
  onDismiss,
  className,
}: ToastProps) {
  // Neutral is a solid fill (dark, inverted in dark mode): its controls get a double ring.
  const controlRing = tone === "neutral" ? "" : "";
  const actionButton = action && (
    <button
      type="button"
      onClick={action.onClick}
      className={cn("shrink-0 cursor-pointer rounded-4 text-label-lg underline", controlRing)}
    >
      {action.label}
    </button>
  );
  return (
    <div className={cn(toastVariants({ tone }), className)}>
      <div className="flex items-center gap-12">
        <Icon name={icon ?? TOAST_ICONS[tone]} tone="current" className={ICON_CLASS[tone]} />
        <p className="min-w-0 flex-1 text-body-md">{children}</p>
        {usage === "single" && actionButton}
        {showClose && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className={cn(
              "relative flex shrink-0 cursor-pointer rounded-4 before:absolute before:-inset-12",
              ICON_CLASS[tone],
              controlRing,
            )}
          >
            <Icon name="close_small" tone="current" />
          </button>
        )}
      </div>
      {usage === "multiple" && actionButton && (
        <div className="flex justify-end">{actionButton}</div>
      )}
    </div>
  );
}

type ShowToast = (toast: Omit<ToastProps, "onDismiss">) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** `const toast = useToast(); toast({ children: "Saved to wishlist" })`. */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

interface Current extends ToastProps {
  id: number;
}

/**
 * Owns the single toast slot: a polite live region fixed to the bottom centre (Figma Do:
 * "Position consistently"). A new toast replaces the current one.
 */
export interface ToastProviderProps {
  children: ReactNode;
  /**
   * `bottom-navigation`: below 1024px the toast sits above the fixed Bottom Navigation (76px)
   * instead of covering it.
   */
  inset?: "none" | "bottom-navigation";
}

const TOAST_INSET = {
  none: "bottom-0",
  "bottom-navigation": "bottom-76 desktop:bottom-0",
} as const;

export function ToastProvider({ children, inset = "none" }: ToastProviderProps) {
  const [current, setCurrent] = useState<Current | null>(null);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((toast) => {
    nextId.current += 1;
    setCurrent({ ...toast, id: nextId.current });
  }, []);

  const dismiss = useCallback(() => {
    setCurrent(null);
    setPaused(false);
  }, []);

  useEffect(() => {
    if (!current || paused) return;
    const timer = setTimeout(() => setCurrent(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current, paused]);

  const action = useMemo(
    () =>
      current?.action && {
        label: current.action.label,
        onClick: () => {
          current.action?.onClick();
          dismiss();
        },
      },
    [current, dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed inset-x-0 z-50 flex justify-center p-16",
          TOAST_INSET[inset],
        )}
      >
        {current && (
          <div
            key={current.id}
            className="pointer-events-auto w-full max-w-(--breakpoint-tablet) tablet:w-auto tablet:min-w-334"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Toast {...current} action={action || undefined} onDismiss={dismiss} />
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

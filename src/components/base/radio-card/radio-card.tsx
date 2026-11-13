"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";

// Selectable cards (Card.Address, Card.PaymentMethod.*: Figma `State=Selected`) as an APG radio
// group. The group is the radiogroup; each card renders a RadioCardControl, a role="radio" layer
// stretched over the card as its first child, so the card's own buttons (Edit, Delete, more)
// stay above it and outside the radio (no nested interactive content). Roving tabindex: the
// checked card is the tab stop (the first enabled card when none is); arrow keys move focus and
// select, wrapping; Space selects. Selected draws Figma's check_circle badge on the corner; the
// card draws its own 2px border-accent.

const NEXT_KEYS = ["ArrowDown", "ArrowRight"];
const PREV_KEYS = ["ArrowUp", "ArrowLeft"];
const RADIO_SELECTOR = '[role="radio"]:not([aria-disabled="true"])';

interface RadioCardContextValue {
  value: string | undefined;
  firstValue: string | undefined;
  select: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const RadioCardContext = createContext<RadioCardContextValue | null>(null);

export interface RadioCardGroupProps {
  /** The checked card's value. */
  value: string | undefined;
  onValueChange: (value: string) => void;
  /** Accessible name of the group, e.g. "Shipping address". Or use `labelledBy`. */
  label?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

export function RadioCardGroup({
  value,
  onValueChange,
  label,
  labelledBy,
  className,
  children,
}: RadioCardGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [firstValue, setFirstValue] = useState<string>();

  // The tab stop when nothing is checked: the first enabled card in DOM order.
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>(RADIO_SELECTOR);
    setFirstValue(first?.dataset.value);
  }, [children]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === " ") {
        event.preventDefault();
        const current = event.currentTarget.dataset.value;
        if (current) onValueChange(current);
        return;
      }
      const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;
      if (!step || !ref.current) return;
      event.preventDefault();
      const radios = Array.from(ref.current.querySelectorAll<HTMLElement>(RADIO_SELECTOR));
      const index = radios.indexOf(event.currentTarget);
      const next = radios[(index + step + radios.length) % radios.length];
      if (!next?.dataset.value) return;
      next.focus();
      onValueChange(next.dataset.value);
    },
    [onValueChange],
  );

  const context = useMemo(
    () => ({ value, firstValue, select: onValueChange, onKeyDown }),
    [value, firstValue, onValueChange, onKeyDown],
  );

  return (
    <RadioCardContext.Provider value={context}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-labelledby={labelledBy}
        className={className}
      >
        {children}
      </div>
    </RadioCardContext.Provider>
  );
}

/** Whether the card with this value is checked; false outside a RadioCardGroup. */
export function useRadioCardChecked(value: string | undefined): boolean {
  const context = useContext(RadioCardContext);
  return context !== null && value !== undefined && context.value === value;
}

export interface RadioCardControlProps {
  /** The card's value in the group. Without it (or outside a group) nothing renders. */
  value: string | undefined;
  /** id of the card's title: the radio's accessible name. */
  labelledBy: string;
  disabled?: boolean;
  /** Figma's check_circle corner badge on the checked card (Card.Store's Selected has none). */
  badge?: boolean;
  /** The card's radius, so the focus ring follows it (e.g. rounded-8). */
  className?: string;
}

export function RadioCardControl({
  value,
  labelledBy,
  disabled = false,
  badge = true,
  className,
}: RadioCardControlProps) {
  const context = useContext(RadioCardContext);
  if (!context || value === undefined) return null;
  const checked = context.value === value;
  const tabStop = checked || (context.value === undefined && context.firstValue === value);

  return (
    <>
      <div
        role="radio"
        aria-checked={checked}
        aria-labelledby={labelledBy}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? undefined : tabStop ? 0 : -1}
        data-value={value}
        onClick={disabled ? undefined : () => context.select(value)}
        onKeyDown={disabled ? undefined : context.onKeyDown}
        className={cn(
          "absolute inset-0",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      />
      {checked && badge && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-8 z-10 flex rounded-full bg-surface-primary"
        >
          <Icon name="check_circle" size="24" tone="accent" />
        </span>
      )}
    </>
  );
}

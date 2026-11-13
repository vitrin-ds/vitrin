"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button/button";
import { Chip } from "@/components/ui/chip/chip";
import { Icon } from "@/components/ui/icon/icon";
import { Text } from "@/components/ui/text/text";
import { TextInput } from "@/components/ui/text-input/text-input";

// CouponField: the discount code field of the cart and checkout summaries, a site component built
// from DS parts (Figma removed its Coupon Discount Code pattern on 9 Nov 2026). Collapsed by default
// (Figma Do: "keep the field collapsed until the user asks for it"): the Promo Code row, a
// dashed border-neutral row (radius 8, padding 8 · 12) with the `sell` glyph, "Discount or promo
// code" (body-small) and the action on the right, is a disclosure button (APG) that opens the
// entry: Text Input (Medium) with Button "Apply" (Small, Outline) as its trailing `action`. Validation happens on Apply; the error sits under
// the field (aria-describedby, aria-invalid) and the typed code stays (Figma Don't: don't clear
// the form when a code fails). Applied codes are removable success Chips. One code at a time
// unless `allowMultiple` (Figma Don't: no stacking unless the rules allow it). Apply / remove
// results are announced in a polite live region. The discount itself is the Order Summary's
// negative line (Figma Do: reflect it in the total immediately; the parent recomputes).

export type CouponFieldApplyResult = { ok: true } | { ok: false; error: string };

export interface CouponFieldLabels {
  trigger: string;
  open: string;
  field: string;
  apply: string;
  applying: string;
  applied: string;
  empty: string;
  duplicate: (code: string) => string;
  /** Live-region messages. */
  appliedMessage: (code: string) => string;
  removedMessage: (code: string) => string;
}

export const COUPON_FIELD_LABELS: CouponFieldLabels = {
  trigger: "Discount or promo code",
  open: "Add",
  field: "Discount or promo code",
  apply: "Apply",
  applying: "Applying…",
  applied: "Applied codes",
  empty: "Enter a code to apply it.",
  duplicate: (code) => `${code} is already applied.`,
  appliedMessage: (code) => `${code} applied. Your total has been updated.`,
  removedMessage: (code) => `${code} removed. Your total has been updated.`,
};

export const COUPON_FIELD_DEFAULTS = { allowMultiple: false, defaultExpanded: false } as const;

export interface CouponFieldProps {
  /** Codes on the cart, in the order they were applied. */
  applied: readonly string[];
  /** Validates and applies a code (already trimmed and upper-cased). May be async. */
  onApply: (code: string) => CouponFieldApplyResult | Promise<CouponFieldApplyResult>;
  onRemove: (code: string) => void;
  /** Allow more than one code (only when the promotion rules permit stacking). */
  allowMultiple?: boolean;
  /** Start with the entry open, e.g. after a failed code in a previous step. */
  defaultExpanded?: boolean;
  labels?: CouponFieldLabels;
  className?: string;
}

/** Codes are case-insensitive: compare and submit them trimmed and upper-cased. */
export function normalizeCouponCode(value: string): string {
  return value.trim().toUpperCase();
}

type FocusTarget = "trigger" | "input" | "applied" | null;

export function CouponField({
  applied,
  onApply,
  onRemove,
  allowMultiple = COUPON_FIELD_DEFAULTS.allowMultiple,
  defaultExpanded = COUPON_FIELD_DEFAULTS.defaultExpanded,
  labels = COUPON_FIELD_LABELS,
  className,
}: CouponFieldProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const appliedRef = useRef<HTMLUListElement>(null);
  const focusNext = useRef<FocusTarget>(null);

  const canAdd = allowMultiple || applied.length === 0;

  // Focus follows the content that replaced the control the user just used.
  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    if (target === "trigger") triggerRef.current?.focus();
    else if (target === "input") inputRef.current?.focus();
    else appliedRef.current?.focus();
  });

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next) focusNext.current = "input";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const code = normalizeCouponCode(value);
    if (!code) {
      setError(labels.empty);
      focusNext.current = "input";
      return;
    }
    if (applied.includes(code)) {
      setError(labels.duplicate(code));
      focusNext.current = "input";
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await onApply(code);
      if (result.ok) {
        setValue("");
        setExpanded(false);
        setAnnouncement(labels.appliedMessage(code));
        focusNext.current = "applied";
      } else {
        setError(result.error);
        focusNext.current = "input";
      }
    } finally {
      setPending(false);
    }
  }

  function remove(code: string) {
    onRemove(code);
    setAnnouncement(labels.removedMessage(code));
    focusNext.current = "trigger";
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {applied.length > 0 && (
        <ul
          ref={appliedRef}
          tabIndex={-1}
          aria-label={labels.applied}
          className="flex flex-wrap gap-8 rounded-8"
        >
          {applied.map((code) => (
            <li key={code}>
              <Chip color="success" leftIcon="sell" onRemove={() => remove(code)}>
                {code}
              </Chip>
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-entry`}
            onClick={toggle}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between gap-16 rounded-control px-8 py-12",
              "border border-dashed border-border-neutral hover:border-border-default",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon name="sell" weight={200} fill={false} />
              <Text as="span" variant="body-sm">
                {labels.trigger}
              </Text>
            </span>
            <span className="flex items-center gap-4">
              {!expanded && (
                <Text variant="label-md" tone="accent">
                  {labels.open}
                </Text>
              )}
              <Icon
                name={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                size="16"
                tone="primary"
              />
            </span>
          </button>
          <form
            id={`${id}-entry`}
            hidden={!expanded}
            noValidate
            onSubmit={submit}
            aria-busy={pending || undefined}
          >
            <TextInput
              ref={inputRef}
              label={labels.field}
              name="coupon"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError(null);
              }}
              errorText={error ?? undefined}
              action={
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  aria-disabled={pending || undefined}
                >
                  {pending ? labels.applying : labels.apply}
                </Button>
              }
            />
          </form>
        </>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

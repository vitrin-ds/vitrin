"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { keyToMove } from "@/lib/a11y/list-navigation";
import { useDismiss } from "@/lib/a11y/use-dismiss";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma contextual menu (`Dropdown Panel` of `Dropdown Item`s, e.g. 03.02 P0O2 on Card.Address):
// the more_vert action opens a raised panel (surface-raised + shadow-md, radius 8, 234 wide),
// aligned to its right edge. Item: padding 12, gap 8, a 20px icon (weight 200, outline, accent)
// and label-large. Behaviour follows the WAI-ARIA menu button pattern: Enter, Space and the arrow
// keys open it, the arrows and Home / End move, Escape and Tab close it, focus returns to the
// button.

export interface ActionMenuItem {
  label: string;
  /** Figma Dropdown Item `Left Icon`. Decorative. */
  icon: IconName;
  onSelect: () => void;
  /** Shown but not available (Figma: Set as Default on an expired card). */
  disabled?: boolean;
}

export interface ActionMenuProps {
  /** The button's accessible name, e.g. "More actions for Home". */
  label: string;
  items: readonly ActionMenuItem[];
  disabled?: boolean;
  className?: string;
}

export function ActionMenu({ label, items, disabled = false, className }: ActionMenuProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const first = Math.max(
    items.findIndex((item) => !item.disabled),
    0,
  );

  useDismiss([root], open, () => setOpen(false));

  useEffect(() => {
    if (open) rows.current[active]?.focus();
  }, [open, active]);

  function show(index: number) {
    setActive(index);
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    button.current?.focus();
  }

  function onButtonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      show(first);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      show(items.findLastIndex((item) => !item.disabled));
    }
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      // A menu inside a sheet closes alone, not the sheet with it.
      event.stopPropagation();
      hide();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    const move = keyToMove(event.key);
    if (!move) return;
    event.preventDefault();
    // Unlike a listbox, a menu wraps at its ends. Disabled items are passed over.
    const usable = items.flatMap((item, index) => (item.disabled ? [] : [index]));
    const at = usable.indexOf(active);
    const last = usable.length - 1;
    const next =
      move === "next"
        ? usable[at === last ? 0 : at + 1]
        : move === "previous"
          ? usable[at <= 0 ? last : at - 1]
          : usable[move === "first" ? 0 : last];
    if (next !== undefined) setActive(next);
  }

  return (
    <div ref={root} className={cn("relative z-10 flex shrink-0", className)}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show(first))}
        onKeyDown={onButtonKey}
        className={cn(
          "relative flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12",
          "disabled:cursor-not-allowed disabled:text-icon-disabled",
        )}
      >
        <Icon name="more_vert" weight={200} fill={false} tone="current" />
      </button>
      {open && (
        <div
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className="absolute end-0 top-full z-20 mt-8 flex w-234 flex-col overflow-hidden rounded-overlay bg-surface-raised shadow-md"
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                rows.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={index === active ? 0 : -1}
              aria-disabled={item.disabled || undefined}
              onPointerMove={() => !item.disabled && setActive(index)}
              onClick={() => {
                if (item.disabled) return;
                hide();
                item.onSelect();
              }}
              className="flex cursor-pointer items-center gap-8 p-12 text-left text-label-lg text-(--th-input-text-value) hover:bg-interactive-subtle-hover focus-visible:bg-interactive-subtle-hover aria-disabled:cursor-not-allowed aria-disabled:bg-surface-disabled aria-disabled:text-text-disabled"
            >
              <Icon
                name={item.icon}
                weight={200}
                fill={false}
                tone={item.disabled ? "disabled" : "accent"}
              />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

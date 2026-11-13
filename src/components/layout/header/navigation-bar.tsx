"use client";

import { cva } from "class-variance-authority";
import NextLink from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/a11y/use-dismiss";
import { Icon } from "@/components/ui/icon/icon";
import type { NavigationItem } from "./header-types";
import { MegaMenu } from "./mega-menu";

// Figma `Navigation Bar` (30559:37891) on `.Base Navigation Bar` + `.Asset Navigation Bar Item`
// (is Featured? × State): a 44px surface-primary strip with a 1px border-default underneath,
// items centred (padding 0 · 120 desktop, 0 · 16 tablet; mobile shows the first item only). Item:
// padding 6 · 2 around a pill (radius full, padding 6 · 12, gap 4) with label-large text and a
// keyboard_arrow_down. Hover: surface-secondary (Featured: surface-accent-strong). Active (open
// menu or current page): surface-secondary + 1px border-default (Featured: accent-strong +
// border-neutral). Featured (On Sale): surface-accent pill, text-on-accent.
//
// Behaviour: the WAI-ARIA APG disclosure navigation pattern. Items with a menu are buttons with
// aria-expanded / aria-controls that show a Mega Menu panel of links under the bar; items without
// one are links (aria-current="page" when current). Escape closes and returns focus to the
// button; a click or focus outside closes; Left / Right / Home / End move between top-level items.
// From 1024px a mouse hover opens the menu too (never hover-only: click and keyboard work alone).
// Below 1024px the 5-column panel doesn't fit: `onCompactMenu` hands the item to the Navigation
// Drawer instead (the Header wires it).

const DESKTOP_QUERY = "(min-width: 1024px)";

export const navigationItemVariants = cva(
  "flex cursor-pointer items-center gap-4 rounded-full px-12 py-6 text-label-lg whitespace-nowrap",
  {
    variants: {
      featured: {
        false: "text-text-primary hover:bg-surface-secondary focus-visible:bg-surface-secondary",
        true: "bg-surface-accent text-text-on-accent hover:bg-surface-accent-strong focus-visible:bg-surface-accent-strong",
      },
      active: { true: "inset-ring", false: "" },
    },
    compoundVariants: [
      {
        featured: false,
        active: true,
        className: "bg-surface-secondary inset-ring-border-default",
      },
      {
        featured: true,
        active: true,
        className: "bg-surface-accent-strong inset-ring-border-neutral",
      },
    ],
  },
);

export interface NavigationBarLabels {
  navigation: string;
}

export const NAVIGATION_BAR_LABELS: NavigationBarLabels = { navigation: "Main" };

export interface NavigationBarProps {
  /** Figma `.Asset Navigation Bar Item [1–6]`. */
  items: readonly NavigationItem[];
  /** The item for the current section: Figma `State=Active`, aria-current="page" on links. */
  currentId?: string;
  /** Below 1024px, items with a menu call this instead of opening the panel. */
  onCompactMenu?: (id: string) => void;
  labels?: NavigationBarLabels;
  className?: string;
}

export function NavigationBar({
  items,
  currentId,
  onCompactMenu,
  labels = NAVIGATION_BAR_LABELS,
  className,
}: NavigationBarProps) {
  const baseId = useId();
  const navRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const hoverOpened = useRef<string | null>(null);
  const close = useCallback(() => {
    hoverOpened.current = null;
    setOpenId(null);
  }, []);
  const refs = useMemo(() => [navRef], []);
  useDismiss(refs, openId !== null, close);

  const buttonFor = (id: string) =>
    navRef.current?.querySelector<HTMLElement>(`[data-nav-item="${CSS.escape(id)}"]`);

  function toggle(id: string, fromPointer: boolean) {
    if (onCompactMenu && !isDesktop()) {
      setOpenId(null);
      onCompactMenu(id);
      return;
    }
    // A mouse click right after hover opened the menu keeps it open instead of closing it again.
    const keepHoverOpen = fromPointer && hoverOpened.current === id;
    hoverOpened.current = null;
    if (keepHoverOpen) return;
    setOpenId((current) => (current === id ? null : id));
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && openId) {
      event.preventDefault();
      const id = openId;
      setOpenId(null);
      buttonFor(id)?.focus();
      return;
    }
    const target = event.target as HTMLElement;
    if (!target.dataset.navItem) return;
    const controls = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>("[data-nav-item]") ?? [],
    ).filter((el) => el === target || getComputedStyle(el.closest("li") ?? el).display !== "none");
    const index = controls.indexOf(target);
    const next = {
      ArrowRight: controls[(index + 1) % controls.length],
      ArrowLeft: controls[(index - 1 + controls.length) % controls.length],
      Home: controls[0],
      End: controls[controls.length - 1],
    }[event.key];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }

  return (
    <nav
      ref={navRef}
      aria-label={labels.navigation}
      onKeyDown={onKeyDown}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") close();
      }}
      className={cn(
        // Figma's stroke sits inside the 44px bar: a line over the bottom edge, not a border under it.
        "relative bg-surface-primary after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-border-default",
        className,
      )}
    >
      <ul className="mx-auto flex h-44 max-w-(--breakpoint-wide) items-center justify-center-safe overflow-x-auto px-16 desktop:px-120">
        {items.map((item, i) => {
          const panelId = `${baseId}-${item.id}`;
          const open = openId === item.id;
          const active = open || currentId === item.id;
          const featured = item.featured ?? false;
          const iconTone = featured ? "on-accent" : "accent";
          const rightIcon =
            item.rightIcon === undefined && item.menu ? "keyboard_arrow_down" : item.rightIcon;
          const pill = cn(
            navigationItemVariants({ featured, active }),
            // 32px pill, 44px tap target.
            "relative before:absolute before:inset-x-0 before:-inset-y-6",
          );
          return (
            <li
              key={item.id}
              className={cn("px-2 py-6", i > 0 && "hidden tablet:block")}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse" || !isDesktop()) return;
                const next = item.menu ? item.id : null;
                hoverOpened.current = next !== openId ? next : null;
                setOpenId(next);
              }}
            >
              {item.menu ? (
                <>
                  <button
                    type="button"
                    data-nav-item={item.id}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={(event) => toggle(item.id, event.detail > 0)}
                    className={pill}
                  >
                    {item.label}
                    {rightIcon && <Icon name={rightIcon} tone={iconTone} />}
                  </button>
                  <NavigationPanel id={panelId} open={open}>
                    <MegaMenu {...item.menu} />
                  </NavigationPanel>
                </>
              ) : (
                <NextLink
                  href={item.href}
                  data-nav-item={item.id}
                  aria-current={currentId === item.id ? "page" : undefined}
                  className={pill}
                >
                  {item.label}
                  {rightIcon && <Icon name={rightIcon} tone={iconTone} />}
                </NextLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavigationPanel({
  id,
  open,
  children,
}: {
  id: string;
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      hidden={!open}
      data-state={open ? "open" : "closed"}
      className="absolute inset-x-0 top-full z-40 motion-overlay"
    >
      {children}
    </div>
  );
}

function isDesktop(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_QUERY).matches;
}

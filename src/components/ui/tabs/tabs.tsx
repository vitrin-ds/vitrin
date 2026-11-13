"use client";

import { cva } from "class-variance-authority";
import NextLink from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Rows of Figma `Horizontal Tab`s (the row is not a Figma component; `layout` is code only), and `Vertical Tab` (State ×
// Selection), as the WAI-ARIA APG tabs pattern: role=tablist / tab / tabpanel, one tab in the tab
// order (roving tabindex), arrow keys move and select (automatic activation), Home / End jump,
// disabled tabs are skipped. The Figma indicator line (1px unselected, 2px selected) is drawn with
// ::after so selection never changes the tab's height. Keyboard focus is Figma's Focus cell: the
// line in interactive-active (and surface-primary behind a selected Horizontal or any Vertical tab).
//
//   <Tabs defaultValue="all">
//     <TabList label="Categories"><Tab value="all">All</Tab>…</TabList>
//     <TabPanel value="all">…</TabPanel>
//   </Tabs>

type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  baseId: string;
  value: string;
  select: (value: string) => void;
  orientation: Orientation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`${component} must be used inside <Tabs>`);
  return context;
}

const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;

export interface TabsProps {
  /** Selected tab (controlled). Figma: "Select exactly one tab". */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Horizontal Tab or Vertical Tab. */
  orientation?: Orientation;
  children: ReactNode;
  className?: string;
}

export const TABS_DEFAULTS = { orientation: "horizontal", layout: "scroll" } as const;

export function Tabs({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  orientation = TABS_DEFAULTS.orientation,
  children,
  className,
}: TabsProps) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const select = useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );
  return (
    <TabsContext.Provider value={{ baseId, value, select, orientation }}>
      <div className={cn(orientation === "vertical" ? "flex gap-24" : "flex flex-col", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const KEYS: Record<Orientation, { previous: string; next: string }> = {
  horizontal: { previous: "ArrowLeft", next: "ArrowRight" },
  vertical: { previous: "ArrowUp", next: "ArrowDown" },
};

export interface TabListProps {
  /** Accessible name of the tab list. */
  label: string;
  /**
   * Code only, no Figma property (TabGroup was removed): Scroll (hug tabs, scrolls sideways) · Fill (equal widths, 2–3 tabs) ·
   * Center (equal widths in a centred 976px group over the full-width rule: PDP Tab 31215:29161).
   */
  layout?: "scroll" | "fill" | "center";
  children: ReactNode;
  className?: string;
}

export function TabList({
  label,
  layout = TABS_DEFAULTS.layout,
  children,
  className,
}: TabListProps) {
  const { orientation } = useTabs("TabList");

  // APG: arrows wrap around; Home / End go to the ends. Selection follows focus.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = KEYS[orientation];
    const tabs = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    ];
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const target = {
      [keys.previous]: tabs[(index - 1 + tabs.length) % tabs.length],
      [keys.next]: tabs[(index + 1) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.click();
  }

  const vertical = orientation === "vertical";
  return (
    <div
      className={cn(
        // A 1px border-default rule under the tabs.
        !vertical &&
          "relative after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-border-default",
        !vertical && layout === "scroll" && "overflow-x-auto",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        onKeyDown={onKeyDown}
        className={cn(
          "relative z-10 flex",
          vertical
            ? "flex-col"
            : layout === "fill"
              ? "*:flex-1"
              : layout === "center"
                ? "mx-auto max-w-976 *:flex-1"
                : "w-max",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export const tabVariants = cva(
  [
    "relative flex cursor-pointer items-center justify-center text-label-lg whitespace-nowrap",
    "text-text-primary after:absolute",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
  ],
  {
    variants: {
      orientation: {
        horizontal: "gap-12 px-16 py-12 after:inset-x-0 after:bottom-0 after:h-1",
        vertical: "justify-start gap-12 p-16 after:inset-y-0 after:left-0 after:w-1",
      },
      selected: {
        true: "after:bg-interactive-default focus-visible:bg-surface-primary focus-visible:after:bg-interactive-active enabled:hover:after:bg-interactive-hover",
        false: "focus-visible:after:bg-interactive-active enabled:hover:after:bg-interactive-hover",
      },
    },
    compoundVariants: [
      // Figma Horizontal Tab: a neutral line at rest, surface-primary when selected or hovered;
      // Disabled + Selected keeps the line in interactive-active.
      {
        orientation: "horizontal",
        selected: false,
        className: "after:bg-border-neutral enabled:hover:bg-surface-primary",
      },
      {
        orientation: "horizontal",
        selected: true,
        className: "bg-surface-primary after:h-2 disabled:after:bg-interactive-active",
      },
      // Figma Vertical Tab: no line and no fill at rest; a focused one gets surface-primary.
      {
        orientation: "vertical",
        selected: false,
        className: "focus-visible:bg-surface-primary disabled:after:bg-border-disabled",
      },
      // Figma Vertical Selected: a 2px line, text-accent label, interactive-hover on hover.
      {
        orientation: "vertical",
        selected: true,
        className:
          "text-text-accent after:w-2 enabled:hover:text-interactive-hover disabled:after:bg-border-disabled",
      },
    ],
  },
);

export interface TabProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "value" | "onClick"
> {
  value: string;
  /** Figma `Label Text`: 1–2 words. */
  children: string;
  /** Figma `Left Icon` (20px, icon-accent). Decorative. */
  leftIcon?: IconName;
  /** The icon thin and unfilled (Weight 200, Fill Off), as Rewards 03.04. */
  leftIconOutline?: boolean;
  /** Figma `Badge`: a count (Badge Light · Small), e.g. new items. */
  badge?: number;
}

export function Tab({
  value,
  children,
  leftIcon,
  leftIconOutline = false,
  badge,
  disabled,
  className,
  ...props
}: TabProps) {
  const { baseId, value: selectedValue, select, orientation } = useTabs("Tab");
  const selected = value === selectedValue;
  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={selected}
      aria-controls={panelId(baseId, value)}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => select(value)}
      className={cn(tabVariants({ orientation, selected }), className)}
    >
      {leftIcon && (
        <Icon
          name={leftIcon}
          {...(leftIconOutline ? { weight: 200 as const, fill: false } : {})}
          tone="current"
          className={disabled ? "text-icon-disabled" : "text-icon-accent"}
        />
      )}
      {children}
      {badge !== undefined && <Badge count={badge} color="light" size="small" />}
    </button>
  );
}

export interface TabPanelProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  /**
   * Views that are tabs on small screens but sit side by side from a breakpoint up (Store Finder
   * List / Map): the panel stays mounted and is shown from `desktop` whether selected or not.
   * Hide the TabList from the same breakpoint.
   */
  revealFrom?: "desktop";
}

/**
 * Only the selected panel is rendered; the others are `hidden`. With `revealFrom`, an unselected
 * panel stays rendered and is hidden by CSS below that breakpoint only.
 */
export function TabPanel({ value, revealFrom, children, className, ...props }: TabPanelProps) {
  const { baseId, value: selectedValue } = useTabs("TabPanel");
  const selected = value === selectedValue;
  const revealed = revealFrom === "desktop";
  return (
    <div
      {...props}
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      hidden={!selected && !revealed}
      tabIndex={0}
      className={cn("rounded-4", !selected && revealed && "max-desktop:hidden", className)}
    >
      {(selected || revealed) && children}
    </div>
  );
}

const TAB_LINK_HOVER: Record<Orientation, Record<"true" | "false", string>> = {
  horizontal: {
    true: "hover:after:bg-interactive-hover",
    false: "hover:bg-surface-primary hover:after:bg-interactive-hover",
  },
  vertical: {
    true: "hover:text-interactive-hover hover:after:bg-interactive-hover",
    false: "hover:after:bg-interactive-hover",
  },
};

export interface TabLinkProps {
  href: string;
  /** Figma `Label Text`. */
  children: string;
  /** Figma Horizontal Tab or Vertical Tab. */
  orientation?: Orientation;
  /** Figma `Selection=Selected`: this link's page is showing (aria-current="page"). */
  current?: boolean;
  className?: string;
}

/**
 * A Figma Horizontal or Vertical Tab that opens its own page: a crawlable link, listed in a <nav>
 * rather than a tablist. Use Tab for panels inside a page. `enabled:` never matches a link, so its
 * hover is set here.
 */
export function TabLink({
  href,
  children,
  orientation = TABS_DEFAULTS.orientation,
  current = false,
  className,
}: TabLinkProps) {
  return (
    <NextLink
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        tabVariants({ orientation, selected: current }),
        TAB_LINK_HOVER[orientation][current ? "true" : "false"],
        className,
      )}
    >
      {children}
    </NextLink>
  );
}

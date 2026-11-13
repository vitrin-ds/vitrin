import NextLink from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge, formatBadgeCount } from "@/components/ui/badge/badge";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";

// Figma `Bottom Navigation` (Two-Layer, 02. Components › Navigation): a mobile-only bar fixed to
// the bottom, surface-primary with shadow-up (bars fixed to the bottom are the only place for it). `.Base Bottom
// Navigation` › Inner: px 16 · py 12, tabs spread (justify-between), each tab 64 wide: a 20px
// glyph over a label-small label, gap 2. `Active Tab` is the current page: its glyph is filled,
// the others are outlined (Fill Off). The Cart badge is a Small Light Badge centred above the
// glyph. `Show Bottom Spacer` adds 20px under the tabs for the home indicator.
// Hidden from 1024px up (Figma Don't: "use on desktop").

export interface BottomNavigationItem {
  /** Matches `activeTab`. Figma Active Tab values: home · categories · basket · favorites · account. */
  id: string;
  /** Figma `Tab-n Text`. One word (Figma Do). */
  label: string;
  /** Figma `Tab-n Icon`. */
  icon: IconName;
  /** Where the tab goes. A tab without one is a button that calls `onSelect`. */
  href?: string;
  /** For a tab that opens something on the page (a menu) instead of going to a page. */
  onSelect?: () => void;
  /**
   * Figma `Show Basket Badge`: a count over the glyph. Shown only above 0 (Figma Do: "only when
   * items are present"); its meaning comes from `labels.count`.
   */
  count?: number;
}

export interface BottomNavigationLabels {
  /** Accessible name of the landmark. */
  nav: string;
  /** Read after the tab label, e.g. "Cart, 2 items". */
  count: (count: number) => string;
}

export const BOTTOM_NAVIGATION_LABELS: BottomNavigationLabels = {
  nav: "Main",
  count: (count) => (count === 1 ? "1 item" : `${formatBadgeCount(count)} items`),
};

/** Figma `.Base Bottom Navigation` defaults (Tab-1…5). */
export const BOTTOM_NAVIGATION_ITEMS: readonly BottomNavigationItem[] = [
  { id: "home", label: "Home", icon: "home", href: "/" },
  { id: "categories", label: "Categories", icon: "dashboard", href: "/c" },
  { id: "basket", label: "Cart", icon: "shopping_basket", href: "/cart" },
  { id: "favorites", label: "Favourites", icon: "favorite", href: "/account/saved" },
  { id: "account", label: "Account", icon: "account_circle", href: "/account" },
];

export const BOTTOM_NAVIGATION_DEFAULTS = {
  items: BOTTOM_NAVIGATION_ITEMS,
  showLabels: true,
  bottomSpacer: true,
} as const;

export interface BottomNavigationProps extends Omit<
  ComponentPropsWithoutRef<"nav">,
  "children" | "aria-label"
> {
  /** Up to five tabs (Figma Do). */
  items?: readonly BottomNavigationItem[];
  /** Figma `Active Tab`: the `id` of the current page's tab (`aria-current="page"`). */
  activeTab?: string;
  /** Figma `Show Labels`. Hidden labels stay as the links' accessible names. */
  showLabels?: boolean;
  /** Figma `Show Bottom Spacer`: 20px under the tabs for devices with a home indicator. */
  bottomSpacer?: boolean;
  labels?: Partial<BottomNavigationLabels>;
}

export function BottomNavigation({
  items = BOTTOM_NAVIGATION_DEFAULTS.items,
  activeTab,
  showLabels = BOTTOM_NAVIGATION_DEFAULTS.showLabels,
  bottomSpacer = BOTTOM_NAVIGATION_DEFAULTS.bottomSpacer,
  labels: labelOverrides,
  className,
  ...props
}: BottomNavigationProps) {
  const labels = { ...BOTTOM_NAVIGATION_LABELS, ...labelOverrides };
  return (
    <nav
      {...props}
      aria-label={labels.nav}
      className={cn(
        "fixed inset-x-0 bottom-0 z-10 bg-surface-primary shadow-up desktop:hidden",
        bottomSpacer && "pb-20",
        className,
      )}
    >
      <ul className="flex items-center justify-between px-16 py-12">
        {items.map((item) => {
          const current = item.id === activeTab;
          const count = item.count ?? 0;
          return (
            <li key={item.id} className="flex w-64 justify-center">
              <Tab
                item={item}
                current={current}
                className={cn(
                  "group relative flex w-full flex-col items-center gap-2 rounded-4 text-text-primary",
                  // The tab is 32px tall; grow the hit area to the bar's 56px.
                  "before:absolute before:inset-x-0 before:-inset-y-12",
                )}
              >
                <span className="relative flex">
                  <Icon
                    name={item.icon}
                    fill={current}
                    className="group-hover:text-interactive-hover group-focus-visible:text-interactive-hover"
                  />
                  {count > 0 && (
                    <Badge
                      count={count}
                      size="small"
                      aria-hidden
                      className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-3"
                    />
                  )}
                </span>
                <span className={cn("text-label-sm", !showLabels && "sr-only")}>{item.label}</span>
                {count > 0 && <VisuallyHidden>{`, ${labels.count(count)}`}</VisuallyHidden>}
              </Tab>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A link to the tab's page, or a button when the tab opens something on the page instead. */
function Tab({
  item,
  current,
  className,
  children,
}: {
  item: BottomNavigationItem;
  current: boolean;
  className: string;
  children: ReactNode;
}) {
  if (item.href === undefined) {
    return (
      <button type="button" onClick={item.onSelect} aria-haspopup="dialog" className={className}>
        {children}
      </button>
    );
  }
  return (
    <NextLink href={item.href} aria-current={current ? "page" : undefined} className={className}>
      {children}
    </NextLink>
  );
}

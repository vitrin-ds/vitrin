"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Accordion } from "@/components/ui/accordion/accordion";
import { Icon } from "@/components/ui/icon/icon";
import { RightSheet } from "@/components/ui/right-sheet/right-sheet";
import type { MegaMenuContent, NavigationItem, NavigationLink } from "./header-types";

// The mobile and tablet navigation (Figma Mega Menu mobile compositions: drawer 30677:13451,
// Links Only / Mobile 30677:9956), opened by the Main Header menu trigger or a Navigation Bar
// item below 1024px. It is a drill-down inside the Right Sheet (full width below 560px):
//
// - Level 1 (`Main Group`): one 52px `List` row per Navigation Bar item (title-small,
//   text-primary, keyboard_arrow_right, a 1px border-neutral underneath, padding 16). Items with
//   a menu open level 2; the rest are links. Then the `Secondary Group` (account and service
//   links) and the `footer` slot (social accounts, payment methods; padding 20, gap 20).
// - Level 2: a back row (arrow_back + the item name in body-small, text-tertiary), the menu's Link
//   Groups as Full Width Accordions with the links inside, then the `Menu Footer`.
//
// Focus moves to the back row when a level opens and back to the item that opened it.

export interface NavigationDrawerLabels {
  title: string;
  navigation: string;
  /** Name of the back row, e.g. "Back to menu" (the visible text is the item name). */
  back: string;
}

export const NAVIGATION_DRAWER_LABELS: NavigationDrawerLabels = {
  title: "Menu",
  navigation: "Main",
  back: "Back to menu",
};

export interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  /** The Navigation Bar items (Figma `Main Group`). */
  items: readonly NavigationItem[];
  /** Figma `Secondary Group`: account and service links. */
  secondaryLinks?: readonly NavigationLink[];
  /** Opens straight on this item's menu (a Navigation Bar item tapped below 1024px). */
  initialItemId?: string;
  /** Figma bottom `Row`: social accounts, payment methods. */
  footer?: ReactNode;
  labels?: NavigationDrawerLabels;
}

const ROW =
  "flex w-full cursor-pointer items-center gap-12 border-b border-border-neutral p-16 text-left text-title-sm text-text-primary hover:bg-surface-secondary";

export function NavigationDrawer({
  open,
  onClose,
  items,
  secondaryLinks,
  initialItemId,
  footer,
  labels = NAVIGATION_DRAWER_LABELS,
}: NavigationDrawerProps) {
  const [levelId, setLevelId] = useState<string | null>(initialItemId ?? null);
  const [wasOpen, setWasOpen] = useState(open);
  // Each opening starts where the caller asked (adjusting state during render, not in an effect).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setLevelId(initialItemId ?? null);
  }

  const backRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const returnTo = useRef<string | null>(null);
  const level = items.find((item) => item.id === levelId && item.menu);

  useEffect(() => {
    if (!open) return;
    if (level) {
      backRef.current?.focus();
    } else if (returnTo.current) {
      itemRefs.current.get(returnTo.current)?.focus();
      returnTo.current = null;
    }
  }, [open, level]);

  function goBack() {
    returnTo.current = levelId;
    setLevelId(null);
  }

  return (
    <RightSheet open={open} onClose={onClose} title={labels.title}>
      <nav aria-label={labels.navigation} className="flex min-h-full flex-col">
        {level?.menu ? (
          <>
            <button
              ref={backRef}
              type="button"
              aria-label={`${labels.back}: ${level.label}`}
              onClick={goBack}
              className={cn(ROW, "text-body-sm text-text-tertiary")}
            >
              <Icon name="arrow_back" />
              {level.label}
            </button>
            <DrawerMenu menu={level.menu} onNavigate={onClose} />
          </>
        ) : (
          <>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {item.menu ? (
                    <button
                      ref={(node) => {
                        if (node) itemRefs.current.set(item.id, node);
                        else itemRefs.current.delete(item.id);
                      }}
                      type="button"
                      onClick={() => setLevelId(item.id)}
                      className={ROW}
                    >
                      <span className="flex-1">{item.label}</span>
                      <Icon name="keyboard_arrow_right" />
                    </button>
                  ) : (
                    <DrawerLink link={item} onNavigate={onClose} />
                  )}
                </li>
              ))}
            </ul>
            {secondaryLinks && secondaryLinks.length > 0 && (
              <ul className="mt-48">
                {secondaryLinks.map((link) => (
                  <li key={link.id}>
                    <DrawerLink link={link} onNavigate={onClose} />
                  </li>
                ))}
              </ul>
            )}
            {footer && <div className="mt-48 flex flex-col gap-20 p-20">{footer}</div>}
          </>
        )}
      </nav>
    </RightSheet>
  );
}

function DrawerLink({
  link,
  onNavigate,
}: {
  link: { label: string; href: string };
  onNavigate: () => void;
}) {
  return (
    <NextLink href={link.href} onClick={onNavigate} className={ROW}>
      <span className="flex-1">{link.label}</span>
      <Icon name="keyboard_arrow_right" />
    </NextLink>
  );
}

const PANEL_LINK =
  "relative flex rounded-4 px-2 py-6 text-label-lg text-text-secondary before:absolute before:inset-x-0 before:-inset-y-6 hover:text-text-primary hover:underline";
const PANEL_ACTION =
  "relative flex items-center justify-between gap-4 rounded-4 px-2 py-6 text-label-md text-text-accent before:absolute before:inset-x-0 before:-inset-y-6 hover:underline";

function DrawerMenu({ menu, onNavigate }: { menu: MegaMenuContent; onNavigate: () => void }) {
  const groups = menu.columns.flat();
  return (
    <>
      {groups.map((group, i) => (
        <Accordion key={group.id} title={group.title} defaultOpen={i === 0}>
          <ul className="flex flex-col gap-12">
            {group.links.map((link) => (
              <li key={link.id}>
                <NextLink href={link.href} onClick={onNavigate} className={PANEL_LINK}>
                  {link.label}
                </NextLink>
              </li>
            ))}
            {group.actions?.map((link) => (
              <li key={link.id}>
                <NextLink href={link.href} onClick={onNavigate} className={PANEL_ACTION}>
                  {link.label}
                  <Icon name="keyboard_arrow_right" />
                </NextLink>
              </li>
            ))}
          </ul>
        </Accordion>
      ))}
      {menu.footer && (
        <p className="mt-auto bg-surface-secondary px-16 py-12 text-label-md text-text-accent">
          {menu.footer}
        </p>
      )}
    </>
  );
}

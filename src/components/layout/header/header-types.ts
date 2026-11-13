import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/icon/icon-names";

// Data shared by Navigation Bar, Mega Menu and the mobile Navigation Drawer. One navigation tree
// feeds all three, so desktop and mobile keep the same information hierarchy (Figma Mega Menu
// Do: "Maintain the same information hierarchy between desktop and mobile views").

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  /** Figma Link Item `Show Right Icon=false`: Small action links only. */
  hideRightIcon?: boolean;
}

/** Figma `Link Group`: `.Asset Mega Menu Title Item` over a list of `.Asset Mega Menu Link Item`s. */
export interface MegaMenuGroup {
  id: string;
  /** Figma Title Item `Label Text`. */
  title: string;
  /** Figma `Size=Default` link items. */
  links: readonly NavigationLink[];
  /**
   * Figma `Size=Small` link items with the arrow ("Show All Products", "Lip Makeup Page"):
   * label-medium in text-accent, after the regular links.
   */
  actions?: readonly NavigationLink[];
}

/**
 * Figma Trending Product / Trending Brand Showcase: the tinted zone right of the link columns
 * (`.Asset Mega Menu Title Item` over Card.Product.Vertical.Small × 3 or Card.Category.Circle).
 */
export interface MegaMenuAside {
  /** Figma Title Item `Label Text` ("Trending Products"). */
  title: string;
  content: ReactNode;
  /** Zone width: Trending Product is 600px (default), Trending Brand 524px. */
  size?: "products" | "brands";
}

/** One sidebar entry of the Subcategory Showcase and the cards it shows. */
export interface MegaMenuShowcaseSection {
  id: string;
  /** Figma Title Item `Label Text` ("Skincare"). */
  title: string;
  /** Figma Title Item `Show Right Icon=false`. */
  hideRightIcon?: boolean;
  /** The Card.Category.Horizontal grid (4 columns). */
  content: ReactNode;
}

/** The panel behind a Navigation Bar item (Figma Mega Menu compositions). */
export interface MegaMenuContent {
  /**
   * Figma `Column`s, each holding one or more Link Groups (Links Only: 5 by default). With a
   * `showcase` they are not drawn on desktop: they are the drawer's version of it.
   */
  columns: readonly (readonly MegaMenuGroup[])[];
  /** Trending Product / Brand Showcase. Desktop only; the drawer lists the groups. */
  aside?: MegaMenuAside;
  /**
   * Figma Mega Menu [Subcategory Showcase]: a sidebar of Title Items (one per section, the
   * hovered or focused one selected) next to that section's cards. Desktop only.
   */
  showcase?: readonly MegaMenuShowcaseSection[];
  /** Figma `Menu Footer` text (one short message, e.g. a shipping promise). */
  footer?: ReactNode;
}

interface NavigationItemBase {
  id: string;
  /** Figma `Label Text`. */
  label: string;
  /** Figma `is Featured?=Yes`: the accent pill ("On Sale"). */
  featured?: boolean;
  /** Figma `Right Icon`. Menu items default to keyboard_arrow_down; `null` is `Show Right Icon=false`. */
  rightIcon?: IconName | null;
}

/**
 * Figma `.Asset Navigation Bar Item`. Items with a menu are disclosure buttons (the category page
 * itself is one of the menu's action links); items without one are links.
 */
export type NavigationItem = NavigationItemBase &
  ({ menu: MegaMenuContent; href?: never } | { menu?: never; href: string });

"use client";

import { useState } from "react";
import { SearchAutocomplete } from "../search/search-autocomplete";
import { filterSearchFixture } from "../search/search.fixtures";
import { PaymentNetwork } from "@/components/ui/payment-network/payment-network";
import { MainHeaderAction } from "./main-header";

// Story / test helpers: the header's real Search & Autocomplete over mock suggestions, and the
// Figma action and drawer-footer groups.

/** A stand-in for the store's logo (Main Header `logo` slot): a wordmark in the on-accent colour. */
/** Names the logo link with the stand-in's own word (axe: label-content-name-mismatch). */
export const STORY_HEADER_LABELS = { home: "Store home", menu: "Menu" };

export function StoryLogo() {
  return <span className="text-title-lg text-text-on-accent">Store</span>;
}

/** Figma header search: Search & Autocomplete, Small, hidden label. */
export function HeaderSearch() {
  const [query, setQuery] = useState("");
  return (
    <SearchAutocomplete
      label="Search"
      placeholder="Search by product, category, or brand name"
      options={filterSearchFixture(query)}
      onQueryChange={setQuery}
    />
  );
}

/** Figma Right group: Find a Store, Sign In / Register (labelled), Wishlist, Cart (icon only). */
export function HeaderActions({ cartCount = 2 }: { cartCount?: number }) {
  return (
    <>
      <MainHeaderAction icon="location_on" label="Find a Store" href="/stores" />
      <MainHeaderAction icon="account_circle" label="Sign In / Register" href="/login" />
      <MainHeaderAction icon="favorite" label="Wishlist" href="/account/saved" hideLabel />
      <MainHeaderAction
        icon="shopping_basket"
        label="Cart"
        href="/cart"
        hideLabel
        count={cartCount}
      />
    </>
  );
}

/** Drawer bottom row stand-in: accepted payment methods (social icons belong to the Footer set). */
export function DrawerFooter() {
  return (
    <ul aria-label="Accepted payment methods" className="flex flex-wrap items-center gap-12">
      {(["visa", "mastercard", "amex", "google-pay", "apple-pay"] as const).map((network) => (
        <li key={network} className="flex">
          <PaymentNetwork network={network} />
        </li>
      ))}
    </ul>
  );
}

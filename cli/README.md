# @vitrin-ds/cli

Adds [Vitrin](https://vitrin.design) e-commerce components and blocks to your Next.js project. The
code is copied into your project, so you own it and can change it.

```bash
npx @vitrin-ds/cli add mini-cart
```

## What you need

- Node.js 20 or newer
- Next.js (App Router)
- Tailwind CSS 4, with `@import "tailwindcss"` in your stylesheet
- A path alias in `tsconfig.json`, e.g. `"paths": { "@/*": ["./src/*"] }`

A project made with `create-next-app` and its defaults has all of these.

Every component in the design system is an item, named after it (`button`, `date-picker`,
`card-order-history` …); `vitrin list` shows them all.

## Commands

| Command                  | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `vitrin add <items...>`  | Adds items. Sets up the project the first time. |
| `vitrin init [items...]` | Sets up the project, with or without items.     |
| `vitrin list`            | Shows what the registry offers.                 |

| Option             |                                                  |
| ------------------ | ------------------------------------------------ |
| `--cwd <dir>`      | Project folder (default: this folder)            |
| `--css <file>`     | Your stylesheet, if it is not found by itself    |
| `--overwrite`      | Replace files you changed (default: keep them)   |
| `--dry-run`        | Show what would change, write nothing            |
| `--no-install`     | Name the npm packages instead of installing them |
| `--registry <url>` | Registry address                                 |

## What the first run changes

Run it with `--dry-run` first to see the list.

- **Files** go under `components/`, `lib/`, `styles/vitrin/` and `public/vitrin/`, inside `src/` if
  your alias points there. Nothing is written anywhere else.
- **Your stylesheet** gets four `@import` lines for Vitrin's tokens, theme, icons and utilities.
  They add to Tailwind's scales; your own classes (`p-8`, `text-lg`, `bg-blue-100`) keep their
  values. Token names start with `vitrin` (`--vitrin-surface-primary`, `shadow-vitrin-md`).
- **Packages**: `clsx`, `tailwind-merge` and `class-variance-authority`, installed with your
  package manager.
- **`vitrin.json`** records the registry, your alias, your stylesheet and the items you added.
  Commit it.

Run the same command again to update. A file you changed is kept and listed; `--overwrite` replaces
it.

Dark mode follows `data-theme="dark"` or the `dark` class on `<html>`.

## Use the Cart page

`cart` is the full cart page as a presentational block: lines, quantity, promo codes, the order
summary and Checkout. `cart-connected` puts it on a `CommerceCartAdapter` (a `CartAdapter` plus
`addLine`, `applyCoupon` and `removeCoupon`); it ships an in-memory mock to start with.

```bash
npx @vitrin-ds/cli add cart-connected
```

```tsx
"use client";

import { useMemo } from "react";
import { ConnectedCart } from "@/components/patterns/cart/connected-cart";
import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";
import type { Cart } from "@/lib/api/types/cart";

export function CartPage({ seed }: { seed: Cart }) {
  const adapter = useMemo(
    () =>
      createMockCartAdapter(seed, {
        coupons: { WELCOME10: { label: "10% off", amount: { amount: 500, currency: "EUR" } } },
      }),
    [seed],
  );
  return <ConnectedCart adapter={adapter} onError={console.error} />;
}
```

## Use the Checkout

`checkout` is the one-page checkout: contact, delivery address, delivery method, payment (card
form or saved cards), 3D Secure and the order summary with promo codes. It runs on a
`CheckoutAdapter` (customer, delivery options, `placeOrder`, `confirmThreeDSecure`); a declined
card is shown in Payment, other failures go to `onNotice`.

```bash
npx @vitrin-ds/cli add checkout
```

```tsx
<Checkout
  initial={{ cart, customer, methods }}
  cart={cart}
  adapter={checkoutAdapter}
  onPlaced={(orderId) => router.push(`/order/${orderId}`)}
  onNotice={({ text }) => toast(text)}
  onApplyCoupon={applyCoupon}
  onRemoveCoupon={removeCoupon}
/>
```

## Use the Product Detail

`product-detail` is the main product section: gallery, brand and title, price, variant
selector, stock, quantity, Add to Cart and Buy Now, the trust row and Key Benefits. It takes a
catalogue `Product` and sends adds out through `onAddToCart`; put it inside a `page-grid`.
`product-detail-connected` adds the line itself through the cart part of a `CommerceAdapter`.

```bash
npx @vitrin-ds/cli add product-detail-connected
```

```tsx
<ConnectedProductDetail
  product={product}
  adapter={commerce.cart}
  onAdded={(cart, { buyNow }) => (buyNow ? router.push("/checkout") : openMiniCart())}
  onError={() => toast("This item couldn't be added.")}
  onBuyNow={() => {}}
>
  {/* Delivery, payment … under Key Benefits */}
</ConnectedProductDetail>
```

## Use the Product List

`product-list` is the listing section of a category or search page: the filter sidebar
(desktop), the Filter / Sort bar with its sheets and applied chips (below 1024px), the product
grid, the empty state and crawlable pagination. It is controlled: you pass the products, the
facets and the filter / sort state, and handle `onFiltersChange` / `onSortChange` (usually by
writing the URL). `product-list-connected` adds the cards' Add to cart through the cart part of a
`CommerceAdapter`.

```bash
npx @vitrin-ds/cli add product-list-connected
```

```tsx
<ConnectedProductList
  items={items}
  total={total}
  page={page}
  pageCount={pageCount}
  pageSize={24}
  pageHref={(n) => (n > 1 ? `${path}?page=${n}` : path)}
  facets={facets}
  filters={filters}
  sort={sort}
  onFiltersChange={(next) => router.push(toUrl({ filters: next, sort }))}
  onSortChange={(next) => router.push(toUrl({ filters, sort: next }))}
  heading="Serums"
  empty={{ title: "No products match these filters", action: { label: "Clear", href: path } }}
  adapter={commerce.cart}
  onAdded={() => openMiniCart()}
  onError={() => toast("This item couldn't be added.")}
/>
```

## Use the account blocks

`account-orders` is the customer's order list: search, status filters, date sort, day groups
and Show More. Give it the orders (`undefined` while they load) and an `orderHref`.
`account-orders-connected` reads them through the orders part of a `CommerceAdapter`.

`account-addresses` is the address book: cards with a menu (edit, default shipping / billing,
delete), the add / edit form and the delete confirmation. Every change goes through an
`AddressBookAdapter` (the `addresses` part of a `CommerceAdapter`) and the list redraws from its
answer; outcomes go to `onNotice`.

```bash
npx @vitrin-ds/cli add account-orders-connected account-addresses
```

```tsx
<ConnectedAccountOrders
  adapter={commerce.orders}
  orderHref={(order) => `/account/orders/${order.id}`}
  onError={() => toast("Your orders couldn't be loaded.")}
/>

<AccountAddresses
  addresses={customer.addresses}
  adapter={commerce.addresses}
  onNotice={({ tone, text }) => toast({ tone, children: text })}
/>
```

## Use the Mini Cart

`mini-cart` is the presentational block: you give it lines and handlers.
`mini-cart-connected` adds a data contract: you give it a `CartAdapter` and it reads and changes
the cart by itself.

```bash
npx @vitrin-ds/cli add mini-cart-connected
```

```tsx
"use client";

import { useMemo, useState } from "react";
import { ConnectedMiniCart } from "@/components/patterns/mini-cart/connected-mini-cart";
import { createShopifyCartAdapter } from "@/lib/commerce/shopify-cart-adapter";

export function CartButton({ cartId }: { cartId: string }) {
  const [open, setOpen] = useState(false);
  const adapter = useMemo(
    () =>
      createShopifyCartAdapter({
        // Your shop's Storefront API address, with the API version you use.
        endpoint: "https://your-shop.myshopify.com/api/<version>/graphql.json",
        storefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
        cartId,
      }),
    [cartId],
  );
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Cart
      </button>
      <ConnectedMiniCart
        adapter={adapter}
        open={open}
        onClose={() => setOpen(false)}
        onError={(error) => console.error(error)}
        checkoutHref="/checkout"
        cartHref="/cart"
        shopHref="/"
      />
    </>
  );
}
```

To try it without a backend, use `createMockCartAdapter()` from
`@/lib/commerce/mock-cart-adapter`: an in-memory cart that starts empty (or from a `Cart` you
give it). Every block that touches the cart installs both adapters, so moving to Shopify is
swapping one for the other.

For another backend, write the three methods of `CartAdapter`
(`lib/commerce/cart-adapter.ts`): `getCart`, `setLineQuantity` and `removeLine`. Each answers with
the whole cart, with amounts in minor units (`{ amount: 1999, currency: "EUR" }` is €19.99).

The Shopify adapter implements the whole cart contract (`CommerceCartAdapter`): it reads the
cart, adds, changes and removes lines, and applies and removes a discount code, so
`cart-connected`, `mini-cart-connected` and the Add to Cart of `product-detail-connected` /
`product-list-connected` run on it unchanged. Shipping is only known in Shopify's checkout, so
the cart's shipping stays empty. Refusals arrive as our error codes (`out-of-stock`,
`invalid-coupon` …), so the blocks show the same messages on every backend.

## Remote images

Product images render through `next/image`. If yours come from another host, allow it in
`next.config.ts`, or Next answers with an "unconfigured host" error:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
};

export default nextConfig;
```

## Good to know

- Components use your project's font. Vitrin does not install one.
- Icons come from a Material Symbols font file that is copied into `styles/vitrin/`, with its
  licence next to it.
- Tested with Next.js 16 and Tailwind CSS 4, with npm and pnpm. Other frameworks are not supported
  yet.
- The CLI treats the registry as untrusted: it checks every path and package name before it writes
  the first file.

## Licence

MIT (see [LICENSE](LICENSE)): every component and every block. Every installed file
starts with a one-line copyright notice; keep it. Third-party material and the use of the Vitrin
name are described in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Links

- Components and their states: <https://vitrin.design/storybook/>
- Demo store: <https://demo.vitrin.design>
- Ready-made stores (themes) and the agency licence: <https://vitrin.design/pricing>

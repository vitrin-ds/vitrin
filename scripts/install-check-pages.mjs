// The runtime half of scripts/test-install-all.mjs: one page per connected block, written into the
// fresh project, each on the adapter the block installs with and no other setup. A check opens the
// page in a browser and does the block's main action; `[data-check]` shows what the block reported.
// The pages import the installed paths (components/patterns/…), not this repo's.

const STATUS = `<output data-check>{status}</output>`;
const head = (imports) => `"use client";

import { useState } from "react";
${imports.join("\n")}
`;

const SAMPLE_IMAGE = `{ src: "/vitrin/add-image.svg", alt: "", width: 512, height: 512 }`;

export const CHECK_PAGES = {
  "product-list-connected": {
    source: `${head([
      'import { ConnectedProductList } from "@/components/patterns/product-list/connected-product-list";',
      'import { EMPTY_FILTERS } from "@/components/patterns/listing/filters/filter-types";',
      'import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";',
    ])}
const adapter = createMockCartAdapter();
const ITEMS = [
  {
    id: "sample-serum",
    variantId: "sample-serum-30",
    inStock: true,
    name: "Sample Serum",
    href: "/p/sample-serum",
    image: ${SAMPLE_IMAGE},
    price: { amount: 1900, currency: "EUR" },
  },
];

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <ConnectedProductList
        items={ITEMS}
        total={1}
        page={1}
        pageCount={1}
        pageSize={24}
        pageHref={() => "/"}
        facets={[]}
        filters={EMPTY_FILTERS}
        sort="relevance"
        onFiltersChange={() => {}}
        onSortChange={() => {}}
        heading="Sample products"
        empty={{ title: "Nothing here" }}
        adapter={adapter}
        onAdded={(cart) => setStatus(\`added:\${cart.lines[0]?.name}\`)}
        onError={(error) => setStatus(\`error:\${String(error)}\`)}
      />
    </>
  );
}
`,
    action: "add to cart",
    async check(page) {
      // The card shows Add to cart on hover (desktop).
      await page
        .getByRole("link", { name: /Sample Serum/ })
        .first()
        .hover();
      await page
        .getByRole("button", { name: /add to cart/i })
        .first()
        .click();
      return "added:Sample Serum";
    },
  },

  "product-detail-connected": {
    source: `${head([
      'import { ConnectedProductDetail } from "@/components/patterns/product-detail/connected-product-detail";',
      'import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";',
      'import type { Product } from "@/lib/api/types/catalog";',
    ])}
const adapter = createMockCartAdapter();
const PRODUCT: Product = {
  id: "sample-cream",
  slug: "sample-cream",
  name: "Sample Night Cream",
  brandId: "sample",
  categoryIds: [],
  description: "A sample product.",
  images: [${SAMPLE_IMAGE}],
  rating: 4.5,
  reviewCount: 3,
  badges: [],
  attributes: {},
  variants: [
    {
      id: "sample-cream-50",
      productId: "sample-cream",
      sku: "SAMPLE-50",
      options: [{ name: "size", value: "50 ml" }],
      price: { amount: 2800, currency: "EUR" },
      stock: "in-stock",
      quantityAvailable: 20,
    },
  ],
};

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <div className="page-grid">
      ${STATUS}
      <ConnectedProductDetail
        product={PRODUCT}
        brand={{ name: "Sample" }}
        adapter={adapter}
        onAdded={(cart) => setStatus(\`added:\${cart.lines[0]?.name}\`)}
        onError={(error) => setStatus(\`error:\${String(error)}\`)}
        onBuyNow={() => {}}
        onVariantChange={() => {}}
      />
    </div>
  );
}
`,
    action: "add to cart",
    async check(page) {
      await page.getByRole("button", { name: "Add to Cart" }).first().click();
      return "added:Sample Night Cream";
    },
  },

  "cart-connected": {
    source: `${head([
      'import { ConnectedCart } from "@/components/patterns/cart/connected-cart";',
      'import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";',
    ])}
const adapter = createMockCartAdapter(undefined, {
  catalog: {
    "sample-serum-30": {
      productId: "sample-serum",
      name: "Sample Serum",
      slug: "sample-serum",
      image: ${SAMPLE_IMAGE},
      unitPrice: { amount: 1900, currency: "EUR" },
    },
  },
});
void adapter.addLine("sample-serum-30", 2);

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <ConnectedCart adapter={adapter} onError={(error) => setStatus(\`error:\${String(error)}\`)} />
    </>
  );
}
`,
    action: "remove a line",
    async check(page) {
      await page
        .getByRole("button", { name: /remove/i })
        .first()
        .click();
      await page.getByText("Your cart is empty").waitFor();
      return "ready";
    },
  },

  "mini-cart-connected": {
    source: `${head([
      'import { ConnectedMiniCart } from "@/components/patterns/mini-cart/connected-mini-cart";',
      'import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";',
    ])}
const adapter = createMockCartAdapter(undefined, {
  catalog: {
    "sample-serum-30": {
      productId: "sample-serum",
      name: "Sample Serum",
      slug: "sample-serum",
      unitPrice: { amount: 1900, currency: "EUR" },
    },
  },
});
void adapter.addLine("sample-serum-30", 1);

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <ConnectedMiniCart
        adapter={adapter}
        open
        onClose={() => setStatus("closed")}
        onError={(error) => setStatus(\`error:\${String(error)}\`)}
        checkoutHref="/checkout"
        cartHref="/cart"
        shopHref="/"
      />
    </>
  );
}
`,
    action: "show the cart",
    async check(page) {
      await page
        .getByRole("link", { name: /Sample Serum/ })
        .first()
        .waitFor();
      return "ready";
    },
  },

  "account-orders-connected": {
    source: `${head([
      'import { ConnectedAccountOrders } from "@/components/patterns/account-orders/connected-account-orders";',
      'import { createMockOrderAdapter } from "@/lib/commerce/mock-order-adapter";',
    ])}
const adapter = createMockOrderAdapter();

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <ConnectedAccountOrders
        adapter={adapter}
        orderHref={(order) => \`/account/orders/\${order.id}\`}
        onError={(error) => setStatus(\`error:\${String(error)}\`)}
      />
    </>
  );
}
`,
    action: "list orders",
    async check(page) {
      await page.locator('a[href="/account/orders/order-1002"]').first().waitFor();
      await page.locator('a[href="/account/orders/order-1001"]').first().waitFor();
      return "ready";
    },
  },

  "account-addresses": {
    source: `${head([
      'import { AccountAddresses } from "@/components/patterns/account-addresses/account-addresses";',
      'import { createMockAddressBookAdapter } from "@/lib/commerce/mock-address-book-adapter";',
      'import { SAMPLE_ADDRESS } from "@/lib/commerce/mock-samples";',
    ])}
const adapter = createMockAddressBookAdapter();

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <AccountAddresses
        addresses={[SAMPLE_ADDRESS]}
        adapter={adapter}
        onNotice={({ tone, text }) => setStatus(\`\${tone}:\${text}\`)}
      />
    </>
  );
}
`,
    action: "add an address",
    async check(page) {
      await page
        .getByRole("button", { name: /add (a )?new address/i })
        .first()
        .click();
      const sheet = page.getByRole("dialog", { name: "Add new address" });
      await sheet.waitFor();
      await sheet.getByLabel("First name").fill("Ada");
      await sheet.getByLabel("Last name").fill("Smith");
      await sheet.getByLabel("Postcode").fill("NW1 8AB");
      await sheet.getByLabel("Address line 1").fill("42 Sample Place");
      await sheet.getByLabel("Town / City").fill("London");
      await sheet.getByLabel("Phone number").fill("7700900245");
      await sheet.getByRole("button", { name: /save/i }).click();
      // The block reports the outcome through onNotice: a success, not an error.
      await page.waitForFunction(() =>
        document.querySelector("[data-check]")?.textContent?.startsWith("success:"),
      );
      return null;
    },
  },

  checkout: {
    source: `${head([
      'import { Checkout } from "@/components/patterns/checkout/checkout";',
      'import { createMockCheckoutAdapter } from "@/lib/commerce/mock-checkout-adapter";',
      'import { createMockCartAdapter, emptyCart } from "@/lib/commerce/mock-cart-adapter";',
      'import { SAMPLE_SHIPPING_METHODS } from "@/lib/commerce/mock-samples";',
    ])}
const cart = createMockCartAdapter();
const adapter = createMockCheckoutAdapter({ getCart: cart.getCart });
const CART = {
  ...emptyCart(),
  lines: [
    {
      id: "line-1",
      productId: "sample-serum",
      variantId: "sample-serum-30",
      name: "Sample Serum",
      slug: "sample-serum",
      quantity: 1,
      maxQuantity: 10,
      unitPrice: { amount: 1900, currency: "EUR" },
      lineTotal: { amount: 1900, currency: "EUR" },
    },
  ],
  subtotal: { amount: 1900, currency: "EUR" },
  total: { amount: 1900, currency: "EUR" },
};

export default function Page() {
  const [status, setStatus] = useState("ready");
  return (
    <>
      ${STATUS}
      <Checkout
        initial={{ cart: CART, customer: null, methods: SAMPLE_SHIPPING_METHODS }}
        cart={CART}
        adapter={adapter}
        onPlaced={(orderId) => setStatus(\`placed:\${orderId}\`)}
        onNotice={({ text }) => setStatus(\`notice:\${text}\`)}
        onApplyCoupon={() => ({ ok: false, error: "Not in the sample" })}
        onRemoveCoupon={() => {}}
      />
    </>
  );
}
`,
    action: "place an order",
    async check(page) {
      await page.getByText("Next day").first().waitFor();
      const fields = [
        ["Email address", "jane@example.com"],
        ["First name", "Jane"],
        ["Last name", "Doe"],
        ["Postcode", "NW1 8AB"],
        ["Address line 1", "42 Sample Place"],
        ["Town / City", "London"],
        ["Phone number", "7700900245"],
        ["Card number", "4242 4242 4242 4242"],
        ["Expiry date", "12/30"],
        ["Security code", "123"],
        ["Name on card", "Jane Doe"],
      ];
      for (const [label, value] of fields) await page.getByLabel(label).first().fill(value);
      // Country is a Dropdown with no default at checkout.
      await page
        .getByRole("combobox", { name: /Country/ })
        .first()
        .click();
      await page.getByRole("option", { name: "United Kingdom" }).click();
      await page.getByRole("button", { name: /^Pay €/ }).click();
      await page.waitForFunction(() =>
        document.querySelector("[data-check]")?.textContent?.startsWith("placed:"),
      );
      return null;
    },
  },
};

#!/usr/bin/env node
// Builds the Vitrin registry that @vitrin-ds/cli installs from: Foundations, components and blocks as
// JSON. Each item lists its full import closure, read from the source, so
// nothing is listed by hand.
//
// This repo's spacing unit is 1px (p-16 = 16px, matching Figma); standard Tailwind's is 0.25rem
// (p-4 = 16px). Projects keep Tailwind's defaults, so what ships is translated: spacing classes are
// divided by four, and the theme adds to Tailwind's scales instead of replacing them.
//
//   node scripts/build-registry.mjs --out <dir>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const NPM_ALLOWED = new Set(["class-variance-authority", "clsx", "tailwind-merge"]);
const PROVIDED_BY_PROJECT = new Set(["react", "react-dom", "next"]);
const FOUNDATION_PACKAGES = ["clsx", "tailwind-merge"];
const STYLES = "styles/vitrin";

// Every shipped code file carries the open core's copyright line: MIT asks for the notice to
// travel with the code, and these files are copied into other projects.
const NOTICE =
  "Vitrin (https://vitrin.design) · MIT License · Copyright (c) 2026 Things Reklam ve Bilişim Ltd. Şti.";
const withNotice = (target, content) =>
  /\.css$/.test(target) ? `/* ${NOTICE} */\n${content}` : `// ${NOTICE}\n${content}`;
const ICON_FONT = "material-symbols-rounded.woff2";

// Every folder in components/ui is one registry item, named after the folder, with all of its
// source files as entries: the whole system is open, so nothing is listed by hand.
const UI = "src/components/ui";
// Tests, stories and Figma Code Connect files (`x.figma.ts`, `x.figma.batch.ts`) stay here.
const NOT_SHIPPED = /\.(test|stories|figma|code-connect)\.|\.d\.ts$/;

function sourcesIn(dir) {
  return fs
    .readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .flatMap((entry) => {
      const relative = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return sourcesIn(relative);
      return /\.tsx?$/.test(entry.name) && !NOT_SHIPPED.test(entry.name) ? [relative] : [];
    })
    .sort();
}

export function uiComponents() {
  return fs
    .readdirSync(path.join(ROOT, UI), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((name) => [name, sourcesIn(`${UI}/${name}`)])
    .filter(([, entries]) => entries.length > 0);
}

// Published before every folder was an item; kept so `add card-product-vertical` keeps working.
const LEGACY_COMPONENTS = [
  ["card-product-vertical", "src/components/ui/card-product/card-product-vertical.tsx"],
];
export const BLOCKS = [
  ["mini-cart", "src/components/patterns/mini-cart/mini-cart.tsx"],
  ["cart", "src/components/patterns/cart/cart.tsx"],
  [
    "checkout",
    ["src/components/patterns/checkout/checkout.tsx", "src/lib/commerce/mock-checkout-adapter.ts"],
  ],
  ["product-detail", "src/components/patterns/product-detail/product-detail.tsx"],
  ["product-list", "src/components/patterns/product-list/product-list.tsx"],
  ["account-orders", "src/components/patterns/account-orders/account-orders.tsx"],
  [
    "account-addresses",
    [
      "src/components/patterns/account-addresses/account-addresses.tsx",
      "src/lib/commerce/mock-address-book-adapter.ts",
    ],
  ],
];
const ADAPTER_ENTRIES = [
  "src/components/patterns/mini-cart/connected-mini-cart.tsx",
  "src/lib/commerce/mock-cart-adapter.ts",
  "src/lib/commerce/shopify-cart-adapter.ts",
];
// Every block that touches the cart ships with both cart adapters: the in-memory mock to start
// with, and Shopify's, so moving to a store is one line (cli/README.md).
const CART_ADAPTERS = [
  "src/lib/commerce/mock-cart-adapter.ts",
  "src/lib/commerce/shopify-cart-adapter.ts",
];

const CART_CONNECTED_ENTRIES = [
  "src/components/patterns/cart/connected-cart.tsx",
  ...CART_ADAPTERS,
];

const PRODUCT_DETAIL_CONNECTED_ENTRIES = [
  "src/components/patterns/product-detail/connected-product-detail.tsx",
  ...CART_ADAPTERS,
];

const PRODUCT_LIST_CONNECTED_ENTRIES = [
  "src/components/patterns/product-list/connected-product-list.tsx",
  ...CART_ADAPTERS,
];

const ACCOUNT_ORDERS_CONNECTED_ENTRIES = [
  "src/components/patterns/account-orders/connected-account-orders.tsx",
  "src/lib/commerce/mock-order-adapter.ts",
];

const SPACING_UTILITIES = [
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "ps",
  "pe",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "ms",
  "me",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "w",
  "h",
  "size",
  "min-w",
  "min-h",
  "max-w",
  "max-h",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
  "translate-x",
  "translate-y",
  "basis",
  "indent",
  "scroll-m",
  "scroll-mt",
  "scroll-mb",
  "scroll-ml",
  "scroll-mr",
  "scroll-mx",
  "scroll-my",
  "scroll-p",
  "scroll-pt",
  "scroll-pb",
  "scroll-pl",
  "scroll-pr",
  "scroll-px",
  "scroll-py",
].sort((a, b) => b.length - a.length);
const SPACING_CLASS = new RegExp(
  `(?<![\\w-])(-?)(${SPACING_UTILITIES.join("|")})-(\\d+(?:\\.\\d+)?)(?![\\w./%-])`,
  "g",
);

// Our shadow and blur scales share names with Tailwind's but not values. Under their own names
// they leave the project's `shadow-md` as it was.
const ELEVATION_CLASS =
  /(?<![\w-])(shadow|backdrop-blur|blur)-(sm|base|md|lg|xl|2xl|inner|up)(?![\w-])/g;

export function toDefaultScale(source) {
  return source
    .replace(SPACING_CLASS, (_, minus, utility, value) => `${minus}${utility}-${Number(value) / 4}`)
    .replace(ELEVATION_CLASS, (_, utility, size) => `${utility}-vitrin-${size}`);
}

function shippedTheme(css) {
  return css
    .split("\n")
    .filter((line) => !/^\s*--[a-z]+-\*: initial;/.test(line))
    .filter((line) => !/^\s*--spacing: 1px;/.test(line))
    .filter((line) => !/^\s*--font-(sans|mono): /.test(line))
    .map((line) =>
      line.replace(/^(\s*--(?:shadow|blur))-(sm|base|md|lg|xl|2xl|inner|up):/, "$1-vitrin-$2:"),
    )
    .join("\n");
}

/** globals.css without what belongs to the project: its imports, dark variant and base font. */
function shippedUtilities() {
  const css = fs
    .readFileSync(path.join(SRC, "styles/globals.css"), "utf8")
    .split("\n")
    .filter((line) => !/^@import /.test(line))
    .join("\n")
    .replace(/^@custom-variant dark .*$/m, "")
    .replace(/^\s*html \{ font-family:.*$/m, "")
    .replace(/^\s*body \{ overflow-x: clip; \}$/m, "");
  return shipped(css);
}

const ICONS_CSS = `/* Material Symbols Rounded (Apache-2.0, see material-symbols-LICENSE.txt), subset to the icons Vitrin uses. */
@font-face {
  font-family: "Vitrin Icons";
  src: url("./${ICON_FONT}") format("woff2");
  font-weight: 200 400;
  font-display: block;
}
:root { --font-icon: "Vitrin Icons"; }
`;

/** What a project sees: standard Tailwind classes, under the product's name. */
export function shipped(source) {
  return (
    toDefaultScale(source)
      .replaceAll("/brand/add-image.svg", "/vitrin/add-image.svg")
      // Blocks move to components/patterns/ (installTarget), so imports between them move too.
      .replaceAll("@/app/(site)/_components/", "@/components/patterns/")
      .replaceAll("--th-", "--vitrin-")
      .replace(/(?<![\\w-])th-(fade|dialog|slide)-/g, "vitrin-$1-")
      .replaceAll("TH-001", "Vitrin")
  );
}

export function toDarkSelector(css) {
  return css.replace(/^\[data-theme="dark"\] \{/m, '[data-theme="dark"], .dark {');
}

const ELEVATION_SIZES = ["sm", "base", "md", "lg", "xl", "2xl", "inner", "up"];

/** tailwind-merge has to know the renamed shadow and blur classes to resolve conflicts. */
function shippedCn(source) {
  const names = JSON.stringify(ELEVATION_SIZES.map((size) => `vitrin-${size}`));
  const replacements = [
    ['shadow: [{ shadow: ["base", "up"] }]', `shadow: [{ shadow: ${names} }]`],
    ['blur: [{ blur: ["base"] }]', `blur: [{ blur: ${names} }]`],
    [
      '"backdrop-blur": [{ "backdrop-blur": ["base"] }]',
      `"backdrop-blur": [{ "backdrop-blur": ${names} }]`,
    ],
  ];
  return replacements.reduce((text, [from, to]) => {
    if (!text.includes(from)) throw new Error(`cn.ts changed: cannot find ${from}`);
    return text.replace(from, to);
  }, source);
}

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function resolveImport(spec, from) {
  if (!spec.startsWith("@/") && !spec.startsWith(".")) return null;
  const base = spec.startsWith("@/")
    ? path.join(SRC, spec.slice(2))
    : path.resolve(path.dirname(from), spec);
  const match = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
  if (!match) throw new Error(`Cannot resolve ${spec} from ${path.relative(ROOT, from)}`);
  return match;
}

/** Every local file the entry reaches, and the npm packages they name. */
export function closure(entries) {
  const files = new Set();
  const packages = new Set();
  const walk = (file) => {
    if (files.has(file)) return;
    files.add(file);
    const source = fs.readFileSync(file, "utf8");
    // Only import and export statements and dynamic imports: a comment such as `"JD" from "Jane"`
    // is not an import.
    const specs = source.matchAll(
      /^\s*(?:import|export)\b[^;'"]*?\bfrom\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']/gm,
    );
    for (const [, from, sideEffect, dynamic] of specs) {
      const spec = from ?? sideEffect ?? dynamic;
      const resolved = resolveImport(spec, file);
      if (resolved === null) packages.add(spec.split("/")[0]);
      else if (/\.tsx?$/.test(resolved)) walk(resolved);
    }
  };
  for (const entry of [entries].flat()) walk(path.join(ROOT, entry));
  return { files: [...files], packages: [...packages] };
}

function assertPackages(packages, item) {
  for (const name of packages) {
    if (!NPM_ALLOWED.has(name) && !PROVIDED_BY_PROJECT.has(name)) {
      throw new Error(`${item} needs ${name}, which the registry does not allow`);
    }
  }
}

/** "clsx" → "clsx@^2.1.1": the range this repo builds and tests with. */
function pinned(name) {
  const { dependencies } = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  return `${name}@${dependencies[name]}`;
}

// Blocks live at page level in this repo (`app/(site)/_components/`); a project that installs
// them gets them under `components/patterns/`, where the block was before it moved.
function installTarget(relative) {
  return relative.replace(/^app\/\(site\)\/_components\//, "components/patterns/");
}

function sourceFile(file) {
  const content = shipped(fs.readFileSync(file, "utf8"));
  // Targets are always posix paths: the registry may be built on Windows, where `path` uses `\`.
  const target = installTarget(path.relative(SRC, file).split(path.sep).join("/"));
  return {
    target,
    content: withNotice(
      target,
      file === path.join(SRC, "lib/cn.ts") ? shippedCn(content) : content,
    ),
  };
}

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative));
}

function foundations() {
  return {
    name: "foundations",
    type: "foundations",
    title: "Foundations",
    description: "Tokens, Tailwind theme, utilities, icon font and the cn helper.",
    dependencies: FOUNDATION_PACKAGES.map(pinned),
    files: [
      {
        target: `${STYLES}/tokens.css`,
        content: withNotice(
          ".css",
          toDarkSelector(shipped(read("src/styles/tokens.css").toString())),
        ),
      },
      {
        target: `${STYLES}/theme.css`,
        content: withNotice(".css", shipped(shippedTheme(read("src/styles/theme.css").toString()))),
      },
      { target: `${STYLES}/utilities.css`, content: withNotice(".css", shippedUtilities()) },
      { target: `${STYLES}/icons.css`, content: withNotice(".css", ICONS_CSS) },
      {
        target: `${STYLES}/${ICON_FONT}`,
        content: read(`src/fonts/${ICON_FONT}`).toString("base64"),
        encoding: "base64",
      },
      {
        target: `${STYLES}/material-symbols-LICENSE.txt`,
        content: read("src/fonts/material-symbols-LICENSE.txt").toString(),
      },
      {
        target: "public/vitrin/add-image.svg",
        content: read("public/brand/add-image.svg").toString(),
        root: true,
      },
      sourceFile(path.join(SRC, "lib/cn.ts")),
    ],
    css: {
      imports: ["tokens", "theme", "icons", "utilities"].map((file) => `${STYLES}/${file}.css`),
    },
  };
}

function componentItem(name, entry, type) {
  const { files, packages } = closure(entry);
  assertPackages(packages, name);
  const inFoundations = path.join(SRC, "lib/cn.ts");
  return {
    name,
    type,
    title: name,
    requires: ["foundations"],
    dependencies: packages
      .filter((pkg) => NPM_ALLOWED.has(pkg) && !FOUNDATION_PACKAGES.includes(pkg))
      .map(pinned),
    files: files.filter((file) => file !== inFoundations).map(sourceFile),
  };
}

function main() {
  const out = arg("--out");
  if (!out) throw new Error("--out <dir> is required");
  fs.mkdirSync(out, { recursive: true });

  const items = [
    foundations(),
    ...uiComponents().map(([name, entries]) => componentItem(name, entries, "component")),
    ...LEGACY_COMPONENTS.map(([name, entry]) => componentItem(name, entry, "component")),
    ...BLOCKS.map(([name, entry]) => componentItem(name, entry, "block")),
    componentItem("mini-cart-connected", ADAPTER_ENTRIES, "block"),
    componentItem("cart-connected", CART_CONNECTED_ENTRIES, "block"),
    componentItem("product-detail-connected", PRODUCT_DETAIL_CONNECTED_ENTRIES, "block"),
    componentItem("product-list-connected", PRODUCT_LIST_CONNECTED_ENTRIES, "block"),
    componentItem("account-orders-connected", ACCOUNT_ORDERS_CONNECTED_ENTRIES, "block"),
  ];
  for (const item of items) {
    fs.writeFileSync(path.join(out, `${item.name}.json`), JSON.stringify(item));
  }
  fs.writeFileSync(
    path.join(out, "index.json"),
    JSON.stringify({
      items: items.map(({ name, type, title }) => ({ name, type, title })),
    }),
  );
  const report = items.map((item) => {
    const bytes = fs.statSync(path.join(out, `${item.name}.json`)).size;
    return `${item.name.padEnd(20)} ${String(item.files.length).padStart(3)} files  ${Math.round(bytes / 1024)} KB`;
  });
  console.log(report.join("\n"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

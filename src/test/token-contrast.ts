import { readFileSync } from "node:fs";
import path from "node:path";

// WCAG contrast between two semantic tokens, read from the generated tokens.css (so a token
// change in Figma is checked without a browser). Light is `:root`, dark is
// `[data-theme="dark"]`, which falls back to `:root` for primitives.

const CSS = readFileSync(path.resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

function block(selector: string): Map<string, string> {
  const start = CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`tokens.css has no ${selector} block`);
  const body = CSS.slice(start, CSS.indexOf("\n}", start));
  return new Map(
    [...body.matchAll(/(--th-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name!,
      value!.trim(),
    ]),
  );
}

const LIGHT = block(":root");
const DARK = block('[data-theme="dark"]');

export type Theme = "light" | "dark";

/** Resolves `--th-name` through var() aliases to a hex colour. */
export function tokenHex(name: string, theme: Theme): string {
  let value = (theme === "dark" ? DARK.get(name) : undefined) ?? LIGHT.get(name);
  for (let hops = 0; value?.startsWith("var("); hops += 1) {
    if (hops > 10) throw new Error(`${name}: alias loop`);
    const alias = value.slice(4, -1).trim();
    value = (theme === "dark" ? DARK.get(alias) : undefined) ?? LIGHT.get(alias);
  }
  if (!value || !/^#[0-9a-f]{6}$/i.test(value))
    throw new Error(`${name}: not a hex colour (${value})`);
  return value;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio of two tokens (names without the `--th-` prefix). */
export function tokenContrast(foreground: string, background: string, theme: Theme): number {
  const [a, b] = [
    luminance(tokenHex(`--th-${foreground}`, theme)),
    luminance(tokenHex(`--th-${background}`, theme)),
  ];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

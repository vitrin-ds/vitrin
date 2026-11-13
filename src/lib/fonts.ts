import { Figtree, Nunito, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

// next/font self-hosts these and registers them under their real family names,
// which is what --th-font-sans / --th-font-mono in tokens.css reference.
// Only Figtree is preloaded: it sets the LCP text on most routes. Preloads are fetched at high
// priority ahead of the LCP resources, so the other two families wait until a page uses them.
export const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-figtree",
});

// Code styles only (text-code-*): rare and never the LCP text.
export const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-roboto-mono",
  preload: false,
});

// Preset fonts (tokens/presets.json): declared here so next/font self-hosts them, but not
// preloaded; the browser fetches one only on a page whose preset uses it (burrowly).
export const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-nunito",
  preload: false,
});

// Material Symbols Rounded, subset to the Figma icon set (pnpm icons). `block` keeps the
// ligature names ("arrow_back") from flashing as text before the font arrives. Not preloaded:
// at ~100 KB it was the heaviest request ahead of the LCP on every route. The browser requests it
// once icon-font.ts lets the icons draw (after the first paint following `load`); .icon boxes
// are a fixed 1em square (globals.css), so nothing shifts when it arrives.
export const materialSymbols = localFont({
  src: "../fonts/material-symbols-rounded.woff2",
  display: "block",
  weight: "200 400",
  variable: "--font-icon",
  preload: false,
});

export const fontVariables = `${figtree.variable} ${robotoMono.variable} ${nunito.variable} ${materialSymbols.variable}`;

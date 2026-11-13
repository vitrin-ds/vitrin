// Downloads Material Symbols Rounded from Google Fonts, subset to the icons in
// src/components/ui/icon/icon-names.ts, and stores it in src/fonts/ so next/font/local
// can self-host it. Run with `pnpm icons` after changing the name list.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const NAMES_FILE = "src/components/ui/icon/icon-names.ts";
const OUT_FILE = "src/fonts/material-symbols-rounded.woff2";
// Axes: optical size, weight 200–400 (Figma uses 200 and 400), fill 0–1, grade fixed at 0.
const AXES = "opsz,wght,FILL,GRAD@20..48,200..400,0..1,0";
// Google only serves woff2 to browsers it recognises.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const names = [...readFileSync(NAMES_FILE, "utf8").matchAll(/^\s+"([a-z0-9_]+)",$/gm)]
  .map((m) => m[1])
  .sort();
if (names.length === 0) throw new Error(`No icon names found in ${NAMES_FILE}`);

const cssUrl =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:" +
  `${AXES}&icon_names=${names.join(",")}&display=block`;

const cssResponse = await fetch(cssUrl, { headers: { "User-Agent": USER_AGENT } });
if (!cssResponse.ok) throw new Error(`Google Fonts CSS: ${cssResponse.status} ${cssUrl}`);
const css = await cssResponse.text();

const fontUrl = /src:\s*url\((https:[^)]+)\)\s*format\('woff2'\)/.exec(css)?.[1];
if (!fontUrl) throw new Error(`No woff2 URL in Google Fonts response:\n${css}`);

const fontResponse = await fetch(fontUrl);
if (!fontResponse.ok) throw new Error(`Font download: ${fontResponse.status} ${fontUrl}`);
const font = Buffer.from(await fontResponse.arrayBuffer());

mkdirSync("src/fonts", { recursive: true });
writeFileSync(OUT_FILE, font);
console.log(`OK  icons=${names.length}  ${OUT_FILE} (${(font.length / 1024).toFixed(1)} KB)`);

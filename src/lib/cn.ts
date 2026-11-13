import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge, validators } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default scales. Teach it Vitrin's, otherwise
// `text-title-md` (font size) and `text-text-primary` (colour) look like the same group
// and one of them is silently dropped.
const TYPE_STYLES = [
  "display-lg",
  "display-md",
  "display-sm",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-sm",
  "label-xs",
  "code-lg",
  "code-md",
  "code-sm",
];

/** Radius roles (tokens/presets.json can change them): rounded-control, rounded-card … */
const RADIUS_ROLES = ["control", "card", "surface", "overlay"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: { radius: [validators.isNumber, ...RADIUS_ROLES] },
    classGroups: {
      "font-size": [{ text: TYPE_STYLES }],
      shadow: [{ shadow: ["base", "up"] }],
      blur: [{ blur: ["base"] }],
      "backdrop-blur": [{ "backdrop-blur": ["base"] }],
      rounded: [{ rounded: [validators.isNumber] }],
    },
  },
});

/** clsx + tailwind-merge with Vitrin's type, shadow, blur, radius scales and radius roles. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

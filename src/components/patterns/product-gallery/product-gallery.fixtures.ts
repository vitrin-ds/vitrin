import type { ImageAsset } from "@/lib/api/types/catalog";

// Mock gallery for stories and tests: square dev images with real alt text (placeholder product).

const VIEWS = [
  "front",
  "back with ingredients",
  "open cap",
  "texture swatch",
  "in hand",
  "side",
  "box",
  "travel size",
  "set",
] as const;

export const GALLERY_IMAGES: readonly ImageAsset[] = VIEWS.map((view, i) => ({
  src: i % 2 === 0 ? "/dev/sample-square.webp" : "/dev/sample-white.webp",
  alt: `Hydrating Gel Cream 50 ml, ${view}`,
  width: 1024,
  height: 1024,
}));

export const GALLERY_FEW_IMAGES: readonly ImageAsset[] = GALLERY_IMAGES.slice(0, 3);

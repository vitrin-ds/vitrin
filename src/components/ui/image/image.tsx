import { cva, type VariantProps } from "class-variance-authority";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/cn";

// The frame reserves the space before the image loads, so nothing shifts. `surface`:
// `skeleton` (default) fills it with the skeleton surface until the image paints over it; `none`
// leaves it clear, so a transparent cut-out sits on whatever is behind (product cards: the card's
// own colour at rest, on hover and in dark mode).
export const imageFrameVariants = cva("relative block w-full overflow-hidden", {
  variants: {
    surface: { skeleton: "bg-surface-skeleton", none: "" },
    ratio: {
      "1/1": "aspect-square",
      "4/5": "aspect-4/5",
      "6/5": "aspect-6/5",
      // Card.Product.Vertical `Top`: 200 tall at any card width (Figma 30105:84858).
      card: "h-200",
      "3/4": "aspect-3/4",
      "4/3": "aspect-4/3",
      "3/2": "aspect-3/2",
      "16/9": "aspect-video",
      // PDP Tab Content image (Figma 31215:29169): 660 × 400.
      "33/20": "aspect-33/20",
      // Responsive editorial frames (Journal 13.01 / 13.02), mobile → tablet → desktop:
      // Featured article 343 × 240 · 712 × 400 · 790 × 480; article hero 343 × 240 · 712 × 400 ·
      // 1360 × 620.
      feature: "aspect-3/2 tablet:aspect-video desktop:aspect-5/3",
      hero: "aspect-3/2 tablet:aspect-video desktop:aspect-11/5",
    },
  },
});

export const imageVariants = cva("", {
  variants: {
    fit: { cover: "object-cover", contain: "object-contain" },
  },
});

export const IMAGE_DEFAULTS = {
  ratio: "1/1",
  surface: "skeleton",
  fit: "cover",
} as const satisfies Required<
  VariantProps<typeof imageFrameVariants> & VariantProps<typeof imageVariants>
>;

export interface ImageProps extends Omit<
  NextImageProps,
  "fill" | "width" | "height" | "style" | "placeholder" | "priority" | "preload"
> {
  /**
   * The page's LCP image (or one of the few that can be, per viewport): loaded eagerly at high
   * fetch priority. Every other image stays lazy. Next 16 deprecated next/image `priority`; its
   * replacement `preload` only adds a low-priority <link rel=preload>, so this sets
   * `loading="eager"` + `fetchPriority="high"` as the Next docs recommend.
   */
  priority?: boolean;
  /** Required: describe the image, or pass "" when it is purely decorative. */
  alt: string;
  /** Product shots are 1/1 on white; scenes 16/9 or 3/2. */
  ratio?: NonNullable<VariantProps<typeof imageFrameVariants>["ratio"]>;
  /** `none` for transparent cut-outs on a coloured surface (product cards). */
  surface?: NonNullable<VariantProps<typeof imageFrameVariants>["surface"]>;
  /** `contain` for product shots that must not be cropped. */
  fit?: NonNullable<VariantProps<typeof imageVariants>["fit"]>;
  /** Rendered width per breakpoint, e.g. "(min-width: 1024px) 448px, 50vw". */
  sizes: string;
}

/** next/image in a fixed-ratio frame. Use `priority` only for the LCP image. */
export function Image({
  ratio = IMAGE_DEFAULTS.ratio,
  surface = IMAGE_DEFAULTS.surface,
  fit = IMAGE_DEFAULTS.fit,
  className,
  priority = false,
  ...props
}: ImageProps) {
  const lcp = priority ? ({ loading: "eager", fetchPriority: "high" } as const) : {};
  return (
    <span className={cn(imageFrameVariants({ ratio, surface }), className)}>
      <NextImage {...props} {...lcp} fill className={imageVariants({ fit })} />
    </span>
  );
}

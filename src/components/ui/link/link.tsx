import { cva, type VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `Link` (Style × State): inline text, label-large, dotted underline that never goes away
// and turns solid on hover. Accent = text-accent (hover interactive-hover), Neutral = text-primary.
// Size Inline takes the surrounding text style instead of label-large, for a link inside a
// sentence (e.g. "Cookie Policy" in the Cookie Banner's body-small copy). Size Small
// (label-medium) is the section "View All" of the account overview (Figma WD.03.P002 `Title`);
// it carries an invisible 44-tall hit area, as LinkButton's Default does. Underline Hover is for
// a link that stands on its own in the accent colour, never inside running text (PDP brand name
// and "Read all", Figma 06.01 Brand & Fav Count / Reviews Scores): it underlines on hover only.
export const linkVariants = cva("cursor-pointer", {
  variants: {
    underline: {
      always: "link-underline hover:decoration-solid",
      hover: "hover:underline",
    },
    size: {
      default: "text-label-lg",
      sm: "relative text-label-md before:absolute before:inset-x-0 before:top-1/2 before:h-44 before:-translate-y-1/2",
      // Filter Panel Title "Clear" / "Clear All" (label-small); the hit area grows to 44 like Small.
      xs: "relative text-label-sm before:absolute before:inset-x-0 before:top-1/2 before:h-44 before:-translate-y-1/2",
      inline: "",
    },
    variant: {
      accent: "text-text-accent hover:text-interactive-hover",
      neutral: "text-text-primary",
      // Filter Panel Title actions (Clear, Clear All): text-secondary.
      secondary: "text-text-secondary hover:text-text-primary",
    },
    error: { true: "text-text-error hover:text-text-error", false: "" },
    disabled: {
      true: "cursor-not-allowed text-text-disabled hover:text-text-disabled hover:decoration-dotted",
      false: "",
    },
  },
  // LinkButton builds its classes from linkVariants too: the underline stays on by default.
  defaultVariants: { underline: "always" },
});

export const LINK_DEFAULTS = {
  underline: "always",
  size: "default",
  variant: "accent",
  error: false,
  disabled: false,
} as const satisfies Required<VariantProps<typeof linkVariants>>;

export type LinkProps = Omit<ComponentPropsWithRef<typeof NextLink>, "href"> & {
  /** Internal path or absolute URL. */
  href: string;
  /** Default (label-large), Small (label-medium) or Inline: the text style of its sentence. */
  size?: NonNullable<VariantProps<typeof linkVariants>["size"]>;
  /** Figma `Style`: Accent for standalone CTAs, Neutral for in-content links. */
  variant?: NonNullable<VariantProps<typeof linkVariants>["variant"]>;
  /** `hover`: no resting underline, for a standalone accent link (never inside a sentence). */
  underline?: NonNullable<VariantProps<typeof linkVariants>["underline"]>;
  /** Figma `State=Error`, e.g. a link inside an error message. */
  error?: boolean;
  /**
   * Figma `State=Disabled`. Renders a non-interactive `role="link"` with `aria-disabled`, so it
   * stays in the reading order but can't be followed or focused.
   */
  disabled?: boolean;
};

/**
 * Navigation only; actions use `Button` (Figma: "Don't use links for actions"), or `LinkButton`
 * where the design draws the action as a link ("Clear all", checkout "Change").
 */
export function Link({
  underline = LINK_DEFAULTS.underline,
  size = LINK_DEFAULTS.size,
  variant = LINK_DEFAULTS.variant,
  error = LINK_DEFAULTS.error,
  disabled = LINK_DEFAULTS.disabled,
  className,
  href,
  children,
  ...props
}: LinkProps) {
  const classes = cn(linkVariants({ underline, size, variant, error, disabled }), className);
  if (disabled) {
    return (
      <span role="link" aria-disabled="true" className={classes}>
        {children}
      </span>
    );
  }
  return (
    <NextLink {...props} href={href} className={classes}>
      {children}
    </NextLink>
  );
}

/** A link-styled action at Size Default: a 44-tall hit area centred on the ~20px line. */
const LINK_BUTTON_HIT_AREA =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-44 before:-translate-y-1/2";

export type LinkButtonProps = Omit<ComponentPropsWithRef<"button">, "type" | "children"> & {
  /** Default (label-large) or Inline: inherits the text style of the sentence it sits in. */
  size?: LinkProps["size"];
  /** Figma `Style`: Accent or Neutral, as Link. */
  variant?: LinkProps["variant"];
  /** Figma `Underline`, as Link. */
  underline?: LinkProps["underline"];
  /** Figma `State=Error`. */
  error?: boolean;
  /** Figma `State=Disabled`: a native disabled button, out of the tab order like Link's. */
  disabled?: boolean;
  /** `submit` only for a link-styled submit; actions default to `button`. */
  type?: "button" | "submit";
  children: ReactNode;
};

/**
 * The inverse of `ButtonLink`: an action (no navigation) that looks exactly like `Link`, for
 * places where the design draws the action as a link ("Clear all", checkout "Change"). A real
 * <button>, so Enter and Space activate it and screen readers announce a button; same
 * `linkVariants`, sizes, tones and global focus ring as Link. Size Default adds an invisible
 * 44-tall hit area (WCAG 2.5.8); Inline keeps the line box so it never overlaps
 * neighbouring lines of text.
 */
export function LinkButton({
  size = LINK_DEFAULTS.size,
  variant = LINK_DEFAULTS.variant,
  underline = LINK_DEFAULTS.underline,
  error = LINK_DEFAULTS.error,
  disabled = LINK_DEFAULTS.disabled,
  type = "button",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={cn(
        linkVariants({ size, variant, underline, error, disabled }),
        size === "default" && LINK_BUTTON_HIT_AREA,
        className,
      )}
    >
      {children}
    </button>
  );
}

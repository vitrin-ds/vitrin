import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

// One utility per Figma text style: it sets size (per breakpoint), line height and weight.
export const textVariants = cva("", {
  variants: {
    variant: {
      "display-lg": "text-display-lg",
      "display-md": "text-display-md",
      "display-sm": "text-display-sm",
      "headline-lg": "text-headline-lg",
      "headline-md": "text-headline-md",
      "headline-sm": "text-headline-sm",
      "title-lg": "text-title-lg",
      "title-md": "text-title-md",
      "title-sm": "text-title-sm",
      "body-lg": "text-body-lg",
      "body-md": "text-body-md",
      "body-sm": "text-body-sm",
      "label-lg": "text-label-lg",
      "label-md": "text-label-md",
      "label-sm": "text-label-sm",
      "label-xs": "text-label-xs",
      "code-lg": "font-mono text-code-lg",
      "code-md": "font-mono text-code-md",
      "code-sm": "font-mono text-code-sm",
    },
    tone: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      tertiary: "text-text-tertiary",
      accent: "text-text-accent",
      assistive: "text-text-assistive",
      inverse: "text-text-inverse",
      "on-accent": "text-text-on-accent",
      disabled: "text-text-disabled",
      success: "text-text-success",
      warning: "text-text-warning",
      error: "text-text-error",
      info: "text-text-info",
      inherit: "",
    },
    numeric: { true: "tabular-nums", false: "" },
    truncate: { true: "truncate", false: "" },
  },
});

export type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;
export type TextTone = NonNullable<VariantProps<typeof textVariants>["tone"]>;

export const TEXT_DEFAULTS = {
  variant: "body-md",
  tone: "primary",
  numeric: false,
  truncate: false,
} as const satisfies { variant: TextVariant; tone: TextTone; numeric: boolean; truncate: boolean };

/** Element each style renders when `as` is not given. Headings still need an explicit level. */
const DEFAULT_ELEMENT: Record<TextVariant, ElementType> = {
  "display-lg": "p",
  "display-md": "p",
  "display-sm": "p",
  "headline-lg": "p",
  "headline-md": "p",
  "headline-sm": "p",
  "title-lg": "p",
  "title-md": "p",
  "title-sm": "p",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-lg": "span",
  "label-md": "span",
  "label-sm": "span",
  "label-xs": "span",
  "code-lg": "code",
  "code-md": "code",
  "code-sm": "code",
};

type TextOwnProps<E extends ElementType> = {
  /** Element to render: pick the heading level from the document outline, not from the size. */
  as?: E;
  variant?: TextVariant;
  tone?: TextTone;
  /** Tabular figures for prices, counts and tables. */
  numeric?: boolean;
  /** Single line with an ellipsis. */
  truncate?: boolean;
  children?: ReactNode;
};

export type TextProps<E extends ElementType = "p"> = TextOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof TextOwnProps<E>>;

/** Applies a Figma text style and a text/* colour to any element. */
export function Text<E extends ElementType = "p">({
  as,
  variant = TEXT_DEFAULTS.variant,
  tone = TEXT_DEFAULTS.tone,
  numeric = TEXT_DEFAULTS.numeric,
  truncate = TEXT_DEFAULTS.truncate,
  className,
  ...props
}: TextProps<E>) {
  const Component: ElementType = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Component
      {...props}
      className={cn(textVariants({ variant, tone, numeric, truncate }), className)}
    />
  );
}

export interface HeadingProps extends Omit<TextProps<"h2">, "as"> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const HEADING_ELEMENT = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

/** `<Text>` for headings: the level is required so the outline stays explicit (one h1, then h2 / h3). */
export function Heading({ level, variant = "headline-md", ...props }: HeadingProps) {
  return <Text as={HEADING_ELEMENT[level]} variant={variant} {...props} />;
}

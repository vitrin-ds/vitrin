import { cva, type VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

// Figma `.Asset Footer Link Item` (asset layer of Footer): a label link on the accent-strong
// footer, text-on-accent, padding 6 / 2, no underline until hover. Figma rows are 32 tall; the
// `column` size grows them to 44 below `tablet:` for touch. `legal` is the
// label-medium bottom row (Terms, Privacy, Cookie settings). Focus uses the double ring for
// accent fills, so it reads on the purple (also inside the mobile Accordion, Tone On Accent).

export const footerLinkVariants = cva(
  "cursor-pointer rounded-4 text-text-on-accent underline-offset-2 hover:underline",
  {
    variants: {
      size: {
        column: "flex min-h-44 w-full items-center px-2 py-6 text-label-lg tablet:min-h-0",
        // 16px of text; ::before grows the hit area to 44.
        legal:
          "relative inline-flex text-label-md before:absolute before:-inset-x-4 before:-inset-y-14",
        inline: "underline",
        // Contact detail (phone, email): body-small; ::before grows the 18px line to 44.
        detail:
          "relative self-start text-body-sm before:absolute before:-inset-x-4 before:-inset-y-13",
        // Figma social button: a 40px circle (border-accent) around the 24px Solid logo;
        // ::before grows the hit area to 44.
        social:
          "relative flex size-40 items-center justify-center rounded-full inset-ring inset-ring-border-accent before:absolute before:-inset-2",
      },
    },
  },
);

export const FOOTER_LINK_DEFAULTS = { size: "column" } as const;

type FooterLinkVariants = VariantProps<typeof footerLinkVariants>;

export type FooterLinkProps = Omit<ComponentPropsWithRef<typeof NextLink>, "href"> & {
  href: string;
  /** Column (link groups) · Legal (bottom row) · Inline (inside a sentence). */
  size?: NonNullable<FooterLinkVariants["size"]>;
};

export function FooterLink({
  size = FOOTER_LINK_DEFAULTS.size,
  className,
  ...props
}: FooterLinkProps) {
  return <NextLink {...props} className={cn(footerLinkVariants({ size }), className)} />;
}

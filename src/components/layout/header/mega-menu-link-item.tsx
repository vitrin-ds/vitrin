import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";

// Figma `.Asset Mega Menu Link Item` (30621:9720): padding 6 · 2, gap 4, label-large with a 20px
// keyboard_arrow_right. Size=Default is text-secondary, Size=Small text-accent. State=Hover draws a
// 1px border-neutral under the label; keyboard focus matches it (Figma has no Focus state).

export const megaMenuLinkItemVariants = cva(
  "group/link flex items-center gap-4 rounded-4 px-2 py-6 text-label-lg",
  {
    variants: {
      size: { default: "text-text-secondary", sm: "justify-between text-text-accent" },
    },
    defaultVariants: { size: "default" },
  },
);

export const MEGA_MENU_LINK_ITEM_DEFAULTS = { size: "default" } as const;

export interface MegaMenuLinkItemProps extends VariantProps<typeof megaMenuLinkItemVariants> {
  href: string;
  /** Figma `Label Text`. */
  label: string;
  /** Figma `Show Right Icon`: keyboard_arrow_right after the label. */
  chevron?: boolean;
  className?: string;
}

export function MegaMenuLinkItem({ href, label, size, chevron, className }: MegaMenuLinkItemProps) {
  return (
    <NextLink href={href} className={cn(megaMenuLinkItemVariants({ size }), className)}>
      <span className="relative min-w-0 flex-1 after:absolute after:inset-x-0 after:bottom-0 after:h-1 group-hover/link:after:bg-border-neutral group-focus-visible/link:after:bg-border-neutral">
        {label}
      </span>
      {chevron && <Icon name="keyboard_arrow_right" />}
    </NextLink>
  );
}

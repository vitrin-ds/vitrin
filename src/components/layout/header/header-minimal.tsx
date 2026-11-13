import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { NavigationLink } from "./header-types";

// Figma `Header [Minimal]` (31697:34288), Tone: Default · Inverse. Text links in label-large:
// `Left` (gap 40) and one link on the right ("Cart (0)"). Default is text-primary; Inverse is
// text-on-accent, for a dark image or accent surface. No background of its own, and no logo.

const linkVariants = cva(
  "relative rounded-4 text-label-lg before:absolute before:-inset-x-4 before:-inset-y-12 hover:underline focus-visible:underline",
  {
    variants: {
      tone: { default: "text-text-primary", inverse: "text-text-on-accent" },
    },
  },
);

export const HEADER_MINIMAL_DEFAULTS = { tone: "default" } as const;

export const HEADER_MINIMAL_LABELS = { navigation: "Main" };

export interface HeaderMinimalProps {
  /** Figma `Tone`. */
  tone?: NonNullable<VariantProps<typeof linkVariants>["tone"]>;
  /** Figma `Left`: "Our story", "Shop". */
  links: readonly NavigationLink[];
  /** The right link: "Cart (0)". */
  action?: NavigationLink;
  labels?: typeof HEADER_MINIMAL_LABELS;
  className?: string;
}

export function HeaderMinimal({
  tone = HEADER_MINIMAL_DEFAULTS.tone,
  links,
  action,
  labels = HEADER_MINIMAL_LABELS,
  className,
}: HeaderMinimalProps) {
  const link = linkVariants({ tone });
  return (
    <nav
      aria-label={labels.navigation}
      className={cn("flex items-center justify-between", className)}
    >
      <ul className="flex items-center gap-40">
        {links.map((item) => (
          <li key={item.id} className="flex">
            <NextLink href={item.href} className={link}>
              {item.label}
            </NextLink>
          </li>
        ))}
      </ul>
      {action && (
        <NextLink href={action.href} className={link}>
          {action.label}
        </NextLink>
      )}
    </nav>
  );
}

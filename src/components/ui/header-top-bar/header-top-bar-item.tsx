import { BrandImage } from "@/components/base/brand-image/brand-image";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `.Asset Header Top Bar Item` (30543:358654): a desktop utility link in the Header Top Bar,
// label-medium text-on-accent, gap 4. Left items (Help Centre, Find a Store, Contact) are text
// only; the right one (Language & Region) leads with a 20px national flag and ends with a 12px
// keyboard_arrow_down. Use it in HeaderTopBar's `start` / `end`.

export interface HeaderTopBarItemProps {
  href: string;
  /** Figma `Label Text`; always the accessible name. */
  label: string;
  /** Figma `Left Icon` as a Material Symbol. */
  leftIcon?: IconName;
  /** Figma `Left Icon` as a national flag (20px), e.g. `/brand/flags/eu.svg`. Decorative. */
  flag?: string;
  /** Hides the visible label (Figma `Show Label=false`). */
  hideLabel?: boolean;
  /** Figma `Show Right Icon`: keyboard_arrow_down, the item opens a choice (Language & Region). */
  chevron?: boolean;
  className?: string;
}

export function HeaderTopBarItem({
  href,
  label,
  leftIcon,
  flag,
  hideLabel,
  chevron,
  className,
}: HeaderTopBarItemProps) {
  return (
    <NextLink
      href={href}
      aria-label={hideLabel ? label : undefined}
      className={cn(
        "flex shrink-0 items-center gap-4 rounded-4 text-label-md whitespace-nowrap text-text-on-accent",
        "underline-offset-2 hover:underline",
        className,
      )}
    >
      {leftIcon && <Icon name={leftIcon} tone="on-accent" />}
      {flag && (
        <BrandImage
          src={flag}
          alt=""
          width={20}
          height={20}
          fallback={<span aria-hidden className="size-20 rounded-full bg-surface-accent-subtle" />}
        />
      )}
      {!hideLabel && label}
      {chevron && <Icon name="keyboard_arrow_down" size="sm" tone="on-accent" />}
    </NextLink>
  );
}

import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";

// Figma `.Base Button`: structure and slots only (Left Icon · Button Text · Right Icon).
// `Show Left Icon` / `Show Button Text` / `Show Right Icon` map to whether the slot is given.
// Colours, sizes and states come from the main `Button`.

/** Text, or icon-only with a required accessible name (Figma: "Don't use icon-only without accessible label"). */
export type BaseButtonContent =
  { children: ReactNode; "aria-label"?: string } | { children?: never; "aria-label": string };

/** Everything except the content; `Omit` on the full props would flatten the content union. */
export type BaseButtonOwnProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "aria-label"
> & {
  /** Figma `Left Icon` (instance swap). Decorative: hidden from assistive technology. */
  leftIcon?: IconName;
  /** Figma `Right Icon` (instance swap). Decorative: hidden from assistive technology. */
  rightIcon?: IconName;
  /** Colour classes for both icon slots (Figma colours icons separately from the text). */
  iconClassName?: string;
  /** Figma icon `Fill`: On (default) or Off (outlined glyph, e.g. the gallery's favourite). */
  iconFill?: boolean;
};

export type BaseButtonProps = BaseButtonOwnProps & BaseButtonContent;

export function BaseButton({
  leftIcon,
  rightIcon,
  iconClassName,
  iconFill,
  children,
  className,
  type = "button",
  ...props
}: BaseButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn("inline-flex items-center justify-center whitespace-nowrap", className)}
    >
      {leftIcon && <Slot name={leftIcon} fill={iconFill} className={iconClassName} />}
      {children}
      {rightIcon && <Slot name={rightIcon} fill={iconFill} className={iconClassName} />}
    </button>
  );
}

function Slot({ name, fill, className }: { name: IconName; fill?: boolean; className?: string }) {
  return <Icon name={name} tone="current" fill={fill} className={cn("shrink-0", className)} />;
}

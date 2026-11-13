import { BrandImage } from "@/components/base/brand-image/brand-image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Dropdown Item` (State) on `.Base Dropdown Item`: one option of a Dropdown list, padding 12,
// gap 8, label-large on the input-option tokens. Hover = `highlighted`, Active = `selected` (shows
// check_circle in the Right Icon place), Disabled = `disabled`. Show Avatar, Show Left Icon and Show
// Right Icon: the slot shows when it is given.

export interface DropdownItemProps extends Omit<ComponentPropsWithoutRef<"li">, "children"> {
  /** Figma `Item Text`. */
  label: string;
  /** Figma `State=Active`. */
  selected?: boolean;
  /** Figma `State=Hover`: also the keyboard's current option. */
  highlighted?: boolean;
  /** Figma `State=Disabled`. */
  disabled?: boolean;
  /** Figma `Avatar`: a picture, e.g. a country's flag. Decorative. */
  image?: string;
  /** Figma `Left Icon`. Decorative. */
  icon?: IconName;
  /** Figma `Right Icon`. Decorative; a selected item shows check_circle instead. */
  rightIcon?: IconName;
}

export function DropdownItem({
  label,
  selected = false,
  highlighted = false,
  disabled = false,
  image,
  icon,
  rightIcon,
  className,
  ...props
}: DropdownItemProps) {
  const iconClass = disabled ? "text-(--th-input-icon-disabled)" : "text-(--th-input-icon-accent)";
  return (
    <li
      {...props}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? "" : undefined}
      className={cn(
        "flex cursor-pointer items-center gap-8 p-12 text-label-lg",
        "bg-(--th-input-option-bg) text-(--th-input-text-value)",
        "aria-selected:bg-(--th-input-option-bg-active) data-highlighted:bg-(--th-input-option-bg-hover)",
        "aria-disabled:cursor-not-allowed aria-disabled:bg-(--th-input-bg-disabled) aria-disabled:text-(--th-input-text-disabled)",
        className,
      )}
    >
      {icon && <Icon name={icon} tone="current" className={iconClass} />}
      {image && (
        <BrandImage
          src={image}
          alt=""
          width={20}
          height={20}
          className="size-20 rounded-full object-cover"
          fallback={
            <span aria-hidden className="size-20 shrink-0 rounded-full bg-surface-secondary" />
          }
        />
      )}
      <span className="min-w-0 flex-1">{label}</span>
      {selected && (
        <Icon name="check_circle" tone="current" className="text-(--th-input-icon-accent)" />
      )}
      {!selected && rightIcon && <Icon name={rightIcon} tone="current" className={iconClass} />}
    </li>
  );
}

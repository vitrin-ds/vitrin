import { cva, type VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Chip` (Color × State) on the indicator-* component tokens: padding 8 × 4, gap 4,
// radius 8, label-large text, 16px icons, a 4px dot and a cancel (remove) button. Figma Color →
// tone/emphasis: Primary = accent solid, Light = accent outline, Success / Warning / Error /
// Info = soft. Hover is drawn for Primary (bg-hover) and Light (border-hover). Light / Selected
// (filter chips) is accent solid like Primary and announced with aria-pressed. Focus is Figma's
// per-colour state: Primary bg-active, Light border-hover, the soft colours their outline cell
// with a 2px stroke. A removable chip takes it while its cancel button has focus.

export const chipVariants = cva(
  "inline-flex items-center gap-4 rounded-control px-8 py-4 text-label-lg whitespace-nowrap",
  {
    variants: {
      color: {
        primary: "bg-(--th-indicator-accent-solid-bg) text-(--th-indicator-accent-solid-text)",
        light:
          "bg-(--th-indicator-accent-outline-bg) text-(--th-indicator-accent-outline-text) inset-ring inset-ring-(--th-indicator-accent-outline-border-active)",
        success:
          "bg-(--th-indicator-success-soft-bg) text-(--th-indicator-success-soft-text) inset-ring inset-ring-(--th-indicator-success-soft-border)",
        warning:
          "bg-(--th-indicator-warning-soft-bg) text-(--th-indicator-warning-soft-text) inset-ring inset-ring-(--th-indicator-warning-soft-border)",
        error:
          "bg-(--th-indicator-error-soft-bg) text-(--th-indicator-error-soft-text) inset-ring inset-ring-(--th-indicator-error-soft-border)",
        info: "bg-(--th-indicator-info-soft-bg) text-(--th-indicator-info-soft-text) inset-ring inset-ring-(--th-indicator-info-soft-border)",
      },
      interactive: { true: "cursor-pointer", false: "" },
      // Figma `Light / Selected`: accent solid, same as Primary.
      selected: {
        true: "bg-(--th-indicator-accent-solid-bg) text-(--th-indicator-accent-solid-text) inset-ring-0",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed bg-(--th-indicator-disabled-bg) text-(--th-indicator-disabled-text) inset-ring-(--th-indicator-disabled-border)",
        false: "",
      },
    },
    compoundVariants: [
      {
        color: "primary",
        interactive: true,
        disabled: false,
        className: "hover:bg-(--th-indicator-accent-solid-bg-hover)",
      },
      {
        color: "light",
        interactive: true,
        selected: false,
        disabled: false,
        className: "hover:inset-ring-(--th-indicator-accent-outline-border-hover)",
      },
      {
        selected: true,
        disabled: false,
        className: "hover:bg-(--th-indicator-accent-solid-bg-hover)",
      },
      // Figma: Primary disabled has no border.
      { color: "primary", disabled: true, className: "inset-ring-0" },
    ],
  },
);

const FOCUS_CLASS = {
  primary:
    "focus-visible:bg-(--th-indicator-accent-solid-bg-active) has-focus-visible:bg-(--th-indicator-accent-solid-bg-active)",
  light:
    "focus-visible:inset-ring-(--th-indicator-accent-outline-border-hover) has-focus-visible:inset-ring-(--th-indicator-accent-outline-border-hover)",
  success:
    "focus-visible:bg-(--th-indicator-success-outline-bg) focus-visible:inset-ring-2 focus-visible:inset-ring-(--th-indicator-success-outline-border) has-focus-visible:bg-(--th-indicator-success-outline-bg) has-focus-visible:inset-ring-2 has-focus-visible:inset-ring-(--th-indicator-success-outline-border)",
  warning:
    "focus-visible:bg-(--th-indicator-warning-outline-bg) focus-visible:inset-ring-2 focus-visible:inset-ring-(--th-indicator-warning-outline-border) has-focus-visible:bg-(--th-indicator-warning-outline-bg) has-focus-visible:inset-ring-2 has-focus-visible:inset-ring-(--th-indicator-warning-outline-border)",
  error:
    "focus-visible:bg-(--th-indicator-error-outline-bg) focus-visible:inset-ring-2 focus-visible:inset-ring-(--th-indicator-error-outline-border) has-focus-visible:bg-(--th-indicator-error-outline-bg) has-focus-visible:inset-ring-2 has-focus-visible:inset-ring-(--th-indicator-error-outline-border)",
  info: "focus-visible:bg-(--th-indicator-info-outline-bg) focus-visible:inset-ring-2 focus-visible:inset-ring-(--th-indicator-info-outline-border) has-focus-visible:bg-(--th-indicator-info-outline-bg) has-focus-visible:inset-ring-2 has-focus-visible:inset-ring-(--th-indicator-info-outline-border)",
} as const;

const ICON_CLASS = {
  primary: "text-(--th-indicator-accent-solid-icon)",
  light: "text-(--th-indicator-accent-outline-icon)",
  success: "text-(--th-indicator-success-soft-icon)",
  warning: "text-(--th-indicator-warning-soft-icon)",
  error: "text-(--th-indicator-error-soft-icon)",
  info: "text-(--th-indicator-info-soft-icon)",
} as const;

export interface ChipLabels {
  /** Name of the cancel button: "Remove Red". */
  remove: (text: string) => string;
}

export const CHIP_LABELS: ChipLabels = {
  remove: (text) => `Remove ${text}`,
};

export const CHIP_DEFAULTS = {
  color: "primary",
} as const;

type ChipColor = NonNullable<VariantProps<typeof chipVariants>["color"]>;

/** `data-*` attributes go to the root element (tests, analytics). */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

interface ChipBaseProps extends DataAttributes {
  /** Figma `Chip Text`: under 20 characters. */
  children: string;
  /** Figma `Left Icon` (16px). Decorative. */
  leftIcon?: IconName;
  /** Figma `Right Icon` (16px). Decorative. */
  rightIcon?: IconName;
  /** Figma `Show Avatar`: a 16px round image or initials before the text. */
  avatar?: ReactNode;
  /** Figma `Show Dot`: a 4px dot in the icon colour before the text. */
  dot?: boolean;
  /** A fuller name for a button chip; it must start with the visible text (WCAG 2.5.3). */
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

export type ChipProps = ChipBaseProps &
  (
    | {
        /** Filter chip: a toggle button. Only Light has a Selected state in Figma. */
        color?: "light";
        href?: never;
        current?: never;
        onClick: () => void;
        onRemove?: never;
        /** Figma `State=Selected` (aria-pressed). */
        pressed: boolean;
      }
    | {
        /** Figma `Color`. */
        color?: ChipColor;
        href?: never;
        current?: never;
        /** Makes the whole chip a button (e.g. a quick action). */
        onClick: () => void;
        onRemove?: never;
        pressed?: never;
      }
    | {
        /** Figma `Color`. */
        color?: ChipColor;
        /** Link chip (e.g. related categories on the 410 page): an anchor with the hover state. */
        href: string;
        /**
         * The link to the page being shown (a filter link, e.g. the 15.03 topic chips): drawn as
         * Light / Selected and announced with `aria-current="page"`.
         */
        current?: boolean;
        onClick?: never;
        onRemove?: never;
        pressed?: never;
      }
    | {
        /** Figma `Color`. */
        color?: ChipColor;
        href?: never;
        current?: never;
        onClick?: never;
        /** Figma `Show Cancel`: shows the cancel button, named by `labels.remove` ("Remove {text}"). */
        onRemove?: () => void;
        pressed?: never;
      }
  ) & {
    /** UI strings (i18n). */
    labels?: ChipLabels;
  };

export function Chip({
  children,
  color: colorProp,
  leftIcon,
  rightIcon,
  avatar,
  dot = false,
  disabled = false,
  href,
  current = false,
  onClick,
  onRemove,
  pressed,
  labels = CHIP_LABELS,
  className,
  ...data
}: ChipProps) {
  // A filter chip is always Light; pressed turns it into Light / Selected.
  const isToggle = pressed !== undefined || current;
  const color = isToggle ? "light" : (colorProp ?? CHIP_DEFAULTS.color);
  const selected = pressed === true || current;
  const iconClass = disabled
    ? "text-(--th-indicator-disabled-icon)"
    : selected
      ? ICON_CLASS.primary
      : ICON_CLASS[color];
  const focusClass = selected ? FOCUS_CLASS.primary : FOCUS_CLASS[color];
  const content = (
    <>
      {avatar && <span className="size-16 shrink-0 overflow-hidden rounded-full">{avatar}</span>}
      {dot && <span aria-hidden className={cn("size-4 rounded-full bg-current", iconClass)} />}
      {leftIcon && <Icon name={leftIcon} size="16" tone="current" className={iconClass} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size="16" tone="current" className={iconClass} />}
    </>
  );

  if (href !== undefined) {
    return (
      <NextLink
        {...data}
        href={href}
        aria-current={current ? "page" : undefined}
        className={cn(
          chipVariants({ color, interactive: true, selected, disabled: false }),
          "focus-visible:outline-none",
          focusClass,
          className,
        )}
      >
        {content}
      </NextLink>
    );
  }

  if (onClick) {
    return (
      <button
        {...data}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={pressed}
        className={cn(
          chipVariants({ color, interactive: true, selected, disabled }),
          "focus-visible:outline-none",
          focusClass,
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      {...data}
      // Static chips can't be `disabled`; aria-disabled marks them inactive (WCAG 1.4.3 exemption).
      aria-disabled={disabled || undefined}
      className={cn(
        chipVariants({ color, interactive: false, selected: false, disabled }),
        focusClass,
        className,
      )}
    >
      {content}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={labels.remove(children)}
          className={cn(
            "relative flex cursor-pointer rounded-full disabled:cursor-not-allowed",
            "before:absolute before:-inset-14",
            iconClass,
          )}
        >
          <Icon name="cancel" size="16" tone="current" />
        </button>
      )}
    </span>
  );
}

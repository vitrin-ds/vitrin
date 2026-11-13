"use client";

import { cva, type VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `List` (5504:9291, Type × State) on `.Base List` (5496:12895). One Figma `List` is one
// row; in code `List` is the <ul> and `ListItem` the row.
//
// .Base List: padding 16, gap 12: [Thumb] (36px: 20px icon at Weight 200 / Fill Off, padding 8,
// surface-neutral, 1px border-neutral, radius 4) · Left (gap 12: Left Icon 20px · Text: Main Title
// title-small text-primary over Subtitle body-small text-secondary, gap 2) · Right (gap 8: Badge Small · Current
// Selected label-small text-accent · Right Icon 20px). Figma `Show X` booleans are slots here: a
// part renders when it is given. `children` replaces the text block for a row that holds its own
// control (e.g. a Toggle); such a row is not itself interactive.
//
// Type: List Item = bottom border (border-neutral); Card = border all round, radius 8, cards 8px
// apart. As in Card.Address, the border is drawn on ::after (Figma's inside stroke), so the 2px
// selected card border doesn't shift the content.
//
// Interactive rows: `href` renders a link (NextLink), `onClick` a button; both fill the row, are at
// least 44px tall. As in Figma, State only recolours the border and the fill stays
// surface-primary: Hover & Tap = interactive-subtle-hover (List Item 1px bottom, Card 2px all
// round), keyboard Focus = interactive-subtle-active (1px). Selected: a List Item row gets the
// interactive-subtle-active fill, a Card row a 2px border-accent; both set aria-current ("page"
// on links, "true" on buttons: one current item in a set, without turning buttons into toggles).
// Disabled: surface-disabled fill, border-disabled, text-disabled; a disabled link renders no
// href (aria-disabled), a disabled button is `disabled`.

export type ListType = "list-item" | "card";

export const LIST_DEFAULTS = {
  type: "list-item",
} as const satisfies { type: ListType };

const ListTypeContext = createContext<ListType>(LIST_DEFAULTS.type);

export const listVariants = cva("flex flex-col", {
  variants: {
    type: { "list-item": "", card: "gap-8" },
  },
});

export interface ListProps extends ComponentPropsWithRef<"ul"> {
  /** Figma `Type`, for every row in the list. */
  type?: ListType;
}

export function List({ type = LIST_DEFAULTS.type, className, children, ...props }: ListProps) {
  return (
    <ListTypeContext.Provider value={type}>
      <ul {...props} className={cn(listVariants({ type }), className)}>
        {children}
      </ul>
    </ListTypeContext.Provider>
  );
}

export const listItemVariants = cva(
  "relative flex after:pointer-events-none after:absolute after:inset-0",
  {
    variants: {
      type: {
        "list-item": "after:border-b",
        card: "rounded-card after:rounded-card after:border",
      },
      selected: { true: "", false: "" },
      interactive: { true: "", false: "" },
      disabled: {
        true: "bg-surface-disabled text-text-disabled after:border-border-disabled",
        false: "bg-surface-primary after:border-border-neutral",
      },
    },
    compoundVariants: [
      {
        interactive: true,
        selected: false,
        className:
          "hover:after:border-interactive-subtle-hover has-focus-visible:after:border-interactive-subtle-active",
      },
      { type: "card", interactive: true, selected: false, className: "hover:after:border-2" },
      {
        type: "list-item",
        selected: true,
        disabled: false,
        className: "bg-interactive-subtle-active",
      },
      {
        type: "card",
        selected: true,
        disabled: false,
        className: "after:border-2 after:border-border-accent",
      },
    ],
  },
);

const rowClass = "flex min-h-44 w-full min-w-0 items-center gap-12 p-16 text-left";

type ListItemVariants = VariantProps<typeof listItemVariants>;

type RowAttributes = Omit<
  ComponentPropsWithoutRef<"button">,
  "title" | "children" | "type" | "onClick" | "disabled" | "className"
>;

export interface ListItemProps extends RowAttributes {
  /** Figma `Title Text`. */
  title?: ReactNode;
  /** Figma `Subtitle Text`. */
  subtitle?: ReactNode;
  /** Figma `Left Icon` (20px, icon-accent). */
  leftIcon?: IconName;
  /** Figma `Thumb Icon`: the icon in the 38px Thumb box, before everything else. */
  thumbIcon?: IconName;
  /** Figma `Thumb` as any element, e.g. a payment network's logo, in place of `thumbIcon`. */
  thumb?: ReactNode;
  /** Figma's thumb icon is thin and unfilled (Weight 200, Fill Off); false fills it. */
  thumbOutline?: boolean;
  /** Figma `Badge` (Small, Light): a count. Name what it counts in `title` or `aria-label`. */
  badge?: number;
  /** Figma `Current Selected Text`, e.g. "XL" or "€25 – €50". */
  currentSelected?: ReactNode;
  /** Figma `Right Icon` (20px), usually `keyboard_arrow_right` on rows that open something. */
  rightIcon?: IconName;
  /** Custom content in place of the text block (a row holding its own control). */
  children?: ReactNode;
  /** Makes the row a link. */
  href?: string;
  /** With `href`: false keeps the page where it is, for a sheet over it. */
  scroll?: boolean;
  /** Makes the row a button. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Business state: the current item of the set (aria-current). */
  selected?: boolean;
  disabled?: boolean;
  /** Figma `Type`; defaults to the List's. */
  type?: NonNullable<ListItemVariants["type"]>;
  /** Classes for the <li>. */
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  thumbIcon,
  thumb,
  thumbOutline = true,
  badge,
  currentSelected,
  rightIcon,
  children,
  href,
  scroll,
  onClick,
  selected = false,
  disabled = false,
  type: typeProp,
  className,
  ...rowProps
}: ListItemProps) {
  const listType = useContext(ListTypeContext);
  const type = typeProp ?? listType;
  const interactive = !disabled && (href !== undefined || onClick !== undefined);

  const subtitleTone = disabled ? "text-text-disabled" : "text-text-secondary";

  const content = (
    <>
      {thumb}
      {thumbIcon && (
        <span className="flex shrink-0 rounded-4 bg-surface-neutral p-8 inset-ring inset-ring-border-neutral">
          <Icon
            name={thumbIcon}
            tone={disabled ? "disabled" : "accent"}
            {...(thumbOutline ? { weight: 200 as const, fill: false } : {})}
          />
        </span>
      )}
      {leftIcon && <Icon name={leftIcon} tone={disabled ? "disabled" : "accent"} />}
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        {title && (
          <span
            className={cn("text-title-sm", disabled ? "text-text-disabled" : "text-text-primary")}
          >
            {title}
          </span>
        )}
        {/* Spaces between the parts keep the accessible name readable ("Brands 2 selected");
            flex drops them visually. */}{" "}
        {subtitle && <span className={cn("text-body-sm", subtitleTone)}>{subtitle}</span>}
        {children}
      </span>{" "}
      {(badge !== undefined || currentSelected || rightIcon) && (
        <span className="flex shrink-0 items-center justify-end gap-8">
          {badge !== undefined && <Badge size="small" count={badge} />}{" "}
          {currentSelected && (
            <span
              className={cn("text-label-sm", disabled ? "text-text-disabled" : "text-text-accent")}
            >
              {currentSelected}
            </span>
          )}
          {rightIcon && <Icon name={rightIcon} tone={disabled ? "disabled" : "primary"} />}
        </span>
      )}
    </>
  );

  const hover = interactive && "cursor-pointer";
  const rounded = type === "card" && "rounded-card";

  let row: ReactNode;
  if (href !== undefined && !disabled) {
    row = (
      <NextLink
        scroll={scroll}
        {...(rowProps as ComponentPropsWithoutRef<"a">)}
        href={href}
        aria-current={selected ? "page" : undefined}
        className={cn(rowClass, rounded, hover)}
      >
        {content}
      </NextLink>
    );
  } else if (onClick !== undefined || (href !== undefined && disabled)) {
    row =
      href !== undefined ? (
        <a
          {...(rowProps as ComponentPropsWithoutRef<"a">)}
          aria-disabled="true"
          className={cn(rowClass, rounded)}
        >
          {content}
        </a>
      ) : (
        <button
          {...rowProps}
          type="button"
          disabled={disabled}
          aria-current={selected ? "true" : undefined}
          onClick={onClick}
          className={cn(rowClass, rounded, hover, disabled && "cursor-not-allowed")}
        >
          {content}
        </button>
      );
  } else {
    row = <div className={rowClass}>{content}</div>;
  }

  return (
    <li className={cn(listItemVariants({ type, selected, disabled, interactive }), className)}>
      {row}
    </li>
  );
}

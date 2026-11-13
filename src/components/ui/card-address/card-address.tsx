"use client";

import { cva } from "class-variance-authority";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RadioCardControl, useRadioCardChecked } from "@/components/base/radio-card/radio-card";
import { TextAction } from "@/components/base/text-action/text-action";
import { Divider } from "../divider/divider";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label } from "../label/label";

// Figma `Card.Address` (Type × State) on `.Base.Card.Address`: a top bar (surface-neutral, padding
// 8, gap 4) with the 20px icon, title (title-small), role Labels (Default Ship / Default Bill in
// Info, Business in Default) and the more_vert action; the address (padding 12): name (title-small),
// lines (body-small, gap 2) and phone (label-medium, text-tertiary), with Edit / Delete (44px rows)
// on the right; then the optional invoice block below a divider. List Item: bottom border; Card:
// radius 8, border all round. The border is drawn on ::after so it stays above the top bar's fill,
// like Figma's inside stroke. Disabled greys everything out. The Labels wrap instead of clipping.
// Inside a RadioCardGroup the card is selectable (checkout): Selected is a 2px border-accent plus
// the check_circle badge. Figma State=Focus (keyboard focus on the card's radio or open layer): a
// 1px interactive-focus-ring stroke outside the card (Card: all round; List Item: under it). The
// more_vert action sits at the top bar's top-right (8 in), which keeps 36 clear on the right.

export const cardAddressVariants = cva(
  "group/card relative flex flex-col after:pointer-events-none after:absolute after:inset-0",
  {
    variants: {
      type: {
        list: "after:border-b has-[:is([role=radio],[data-card-open]):focus-visible]:after:-bottom-px has-[:is([role=radio],[data-card-open]):focus-visible]:after:border-interactive-focus-ring",
        card: "rounded-card after:rounded-card after:border has-[:is([role=radio],[data-card-open]):focus-visible]:outline has-[:is([role=radio],[data-card-open]):focus-visible]:outline-interactive-focus-ring",
      },
      disabled: {
        true: "bg-surface-disabled after:border-border-disabled",
        false: "bg-surface-primary after:border-border-neutral",
      },
      selected: { true: "after:border-2 after:border-border-accent", false: "" },
    },
    compoundVariants: [
      // Figma Hover & Tap: interactive-subtle-hover fill, border-default.
      {
        disabled: false,
        selected: false,
        className: "hover:bg-interactive-subtle-hover hover:after:border-border-default",
      },
    ],
  },
);

export interface CardAddressLabels {
  defaultShipping: string;
  defaultBilling: string;
  business: string;
  invoiceDetails: string;
  edit: string;
  delete: string;
  editFor: (title: string) => string;
  deleteFor: (title: string) => string;
  more: (title: string) => string;
}

export const CARD_ADDRESS_LABELS: CardAddressLabels = {
  defaultShipping: "DEFAULT SHIP",
  defaultBilling: "DEFAULT BILL",
  business: "BUSINESS",
  invoiceDetails: "INVOICE DETAILS",
  edit: "Edit",
  delete: "Delete",
  editFor: (title) => `Edit ${title}`,
  deleteFor: (title) => `Delete ${title}`,
  more: (title) => `More actions for ${title}`,
};

export const CARD_ADDRESS_DEFAULTS = { type: "list", icon: "star", headingLevel: 3 } as const;

export interface CardAddressProps {
  /** Value in a RadioCardGroup (checkout address selection). */
  value?: string;
  /** Figma `Title Text`, e.g. "Home". */
  title: string;
  /** Figma `Top Left Icon` (20px, decorative). */
  icon?: IconName;
  /** Figma `Label [Default Ship]` / `[Default Bill]` / `[Business]`. */
  roles?: { defaultShipping?: boolean; defaultBilling?: boolean; business?: boolean };
  /** Figma `Name & Surname Text`. */
  name: string;
  /** Figma `Address line 1`, `Address line 2`, `City & Country` (formatAddressLines). */
  lines: readonly string[];
  /** Figma `Phone Text`. */
  phone?: string;
  /** Figma `Invoice Details`: business invoice name and VAT number. */
  invoice?: { name: string; vatNumber?: string };
  /** Figma `Edit` (shown when given; Figma Don't: not during checkout selection). */
  onEdit?: () => void;
  /** Figma `Delete` (shown when given). */
  onDelete?: () => void;
  /** Figma `Right Action` (more_vert): opens the owner's menu. */
  onMore?: () => void;
  /** Figma `Right Action` as the menu itself (Action Menu), in place of `onMore`. */
  menu?: ReactNode;
  /** The whole card opens it ("Tap any to edit", 03.02), named `labels.editFor`. */
  onOpen?: () => void;
  /** Figma `Type`: List Item in checkout, Card in the address book. */
  type?: "list" | "card";
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4;
  labels?: CardAddressLabels;
  className?: string;
}

export function CardAddress({
  value,
  title,
  icon = CARD_ADDRESS_DEFAULTS.icon,
  roles = {},
  name,
  lines,
  phone,
  invoice,
  onEdit,
  onDelete,
  onMore,
  menu,
  onOpen,
  type = CARD_ADDRESS_DEFAULTS.type,
  disabled = false,
  headingLevel = CARD_ADDRESS_DEFAULTS.headingLevel,
  labels = CARD_ADDRESS_LABELS,
  className,
}: CardAddressProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const text = disabled ? "text-text-disabled" : "text-text-primary";
  const selected = useRadioCardChecked(value);

  return (
    <section
      data-card="address"
      aria-labelledby={`${id}-title`}
      className={cn(cardAddressVariants({ type, disabled, selected }), className)}
    >
      {onOpen && !disabled && (
        <button
          type="button"
          aria-label={labels.editFor(title)}
          data-card-open
          onClick={onOpen}
          className={cn("absolute inset-0 cursor-pointer", type === "card" && "rounded-card")}
        />
      )}
      <RadioCardControl
        value={value}
        labelledBy={`${id}-title`}
        disabled={disabled}
        className={type === "card" ? "rounded-card" : undefined}
      />
      {/* Inactive card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3); a
          region can't carry it, so a layout-free wrapper does. */}
      <div className="contents" aria-disabled={disabled || undefined}>
        <div
          className={cn(
            "relative flex items-center gap-4 py-8 pr-36 pl-8",
            type === "card" && "rounded-t-card",
            disabled ? "bg-surface-disabled" : "bg-surface-neutral",
          )}
        >
          <Icon name={icon} weight={200} fill={false} tone={disabled ? "disabled" : "primary"} />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <Heading id={`${id}-title`} className={cn("text-title-sm", text)}>
              {title}
            </Heading>
            {roles.defaultShipping && <Label color="info">{labels.defaultShipping}</Label>}
            {roles.defaultBilling && <Label color="info">{labels.defaultBilling}</Label>}
            {roles.business && <Label>{labels.business}</Label>}
          </div>
          {menu && <div className="absolute top-8 right-8 flex">{menu}</div>}
          {onMore && (
            <button
              type="button"
              aria-label={labels.more(title)}
              onClick={onMore}
              disabled={disabled}
              className={cn(
                "absolute top-8 right-8 flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12",
                "disabled:cursor-not-allowed disabled:text-icon-disabled",
              )}
            >
              <Icon name="more_vert" weight={200} fill={false} tone="current" />
            </button>
          )}
        </div>

        <div className="flex gap-20 p-12">
          <address className="flex min-w-0 flex-1 flex-col gap-8 not-italic">
            <p className={cn("text-title-sm", text)}>{name}</p>
            <p className={cn("flex flex-col gap-2 text-body-sm", text)}>
              {lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            {phone && (
              <p
                className={cn(
                  "text-label-md",
                  disabled ? "text-text-disabled" : "text-text-tertiary",
                )}
              >
                {phone}
              </p>
            )}
          </address>
          {(onEdit || onDelete) && (
            <div className="flex flex-col items-end justify-end">
              {onEdit && (
                <TextAction
                  icon="edit_square"
                  label={labels.edit}
                  name={labels.editFor(title)}
                  onClick={onEdit}
                  disabled={disabled}
                  underline
                />
              )}
              {onDelete && (
                <TextAction
                  icon="delete"
                  label={labels.delete}
                  name={labels.deleteFor(title)}
                  onClick={onDelete}
                  disabled={disabled}
                  underline
                />
              )}
            </div>
          )}
        </div>

        {invoice && (
          <div className="flex flex-col gap-12 px-12 pb-12">
            <Divider />
            <p className={cn("flex items-center gap-4 text-label-md", text)}>
              <Icon
                name="credit_card"
                weight={200}
                fill={false}
                tone={disabled ? "disabled" : "primary"}
              />
              {labels.invoiceDetails}
            </p>
            <p className={cn("flex flex-col gap-2 text-body-sm", text)}>
              <span>{invoice.name}</span>
              {invoice.vatNumber && <span>{invoice.vatNumber}</span>}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

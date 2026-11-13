"use client";

import { useId, useRef, useState, type RefObject } from "react";
import { Alert } from "@/components/ui/alert/alert";
import { BOTTOM_SHEET_LABELS, BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { Button, ButtonLink } from "@/components/ui/button/button";
import { Chip } from "@/components/ui/chip/chip";
import { BaseModal } from "@/components/base/modal/base-modal";
import { CloseButton } from "@/components/base/modal/close-button";
import { Price } from "@/components/ui/price/price";
import { Rating } from "@/components/ui/rating/rating";
import { Stepper } from "@/components/ui/stepper/stepper";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { ProductGallery } from "@/components/patterns/product-gallery/product-gallery";
import { useIsDesktop } from "@/lib/use-is-desktop";

// Figma pattern `Quick View` (03. Patterns › Discovery, 31513:2). Desktop (31513:1157): a
// 904px modal, padding 24: header (title + close), then the image (420, 1:1) left and the info
// right, gap 24: brand (label-small, text-accent), name, Rating + count, Price (lg), the variant
// label and Chips (selected = Primary), Stepper + Add to bag, "View full details" (Ghost link).
// Mobile (31513:2456): a Bottom Sheet with the image on top, name, price and chips. State Full: at
// Half (Figma's table) a phone shows only the image, and the sheet has no expand gesture. The
// full-width Add to bag (and its error) sits in the sheet's fixed footer. Brand, rating and stepper are desktop only, as in Figma.
//
// Desktop is its own 904 panel on BaseModal (Dialog is one width, 360; the product panel is not a
// dialog description). APG dialog: labelled by "Quick view" + the product name, focus starts on the close
// button, Tab is trapped, Escape / scrim / close close it, focus goes back to the opener (Figma Do:
// "Return focus to the card"). The selection lives here, so it survives the breakpoint switch, and
// resets on every open. The gallery is the compact one (no thumbnails, Slider Pagination Bar)
// without zoom (Figma Don't: "nest another dialog inside"). Add to bag stays in the modal (Figma
// Don't: "navigate away"); the owner opens the Mini Cart.

export interface QuickViewVariantOption {
  value: string;
  /** Chip text, e.g. "50 ml". */
  label: string;
  /** Out of stock. */
  disabled?: boolean;
}

export interface QuickViewProduct {
  name: string;
  /** The product page (Figma "View full details"). */
  href: string;
  brand?: string;
  images: readonly ImageAsset[];
  rating?: { value: number; reviewCount: number };
  price: Money;
  compareAt?: Money;
  /** One variant dimension (Figma: size / shade). */
  variants?: { label: string; options: readonly QuickViewVariantOption[] };
}

export interface QuickViewSelection {
  variant?: string;
  quantity: number;
}

export interface QuickViewLabels {
  title: string;
  close: string;
  quantity: string;
  addToBag: string;
  viewDetails: string;
  reviewCount: (count: number) => string;
  selectVariant: (label: string) => string;
  addFailed: string;
}

export const QUICK_VIEW_LABELS: QuickViewLabels = {
  title: "Quick view",
  close: "Close",
  quantity: "Quantity",
  addToBag: "Add to bag",
  viewDetails: "View full details",
  reviewCount: (count) =>
    `(${new Intl.NumberFormat("en").format(count)} ${count === 1 ? "review" : "reviews"})`,
  selectVariant: (label) => `Select a ${label.toLowerCase()} first.`,
  addFailed: "We couldn't add this to your bag. Please try again.",
};

export const QUICK_VIEW_DEFAULTS = { locale: "en", maxQuantity: 10 } as const;

export interface QuickViewProps {
  open: boolean;
  onClose: () => void;
  product: QuickViewProduct;
  /** Pre-selected variant value (e.g. the one picked on the card). */
  defaultVariant?: string;
  /** Called with the selection; reject to show the error. The owner opens the Mini Cart. */
  onAddToBag: (selection: QuickViewSelection) => void | Promise<void>;
  maxQuantity?: number;
  locale?: string;
  labels?: QuickViewLabels;
}

export function QuickView({ open, onClose, labels = QUICK_VIEW_LABELS, ...props }: QuickViewProps) {
  const isDesktop = useIsDesktop();
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const titleId = `${baseId}-title`;
  // The chip group: Add to bag focuses its first chip when no variant is chosen.
  const variantsRef = useRef<HTMLDivElement>(null);
  const purchase = usePurchase(open, props, variantsRef);
  const content = { ...props, labels, nameId, purchase, variantsRef };

  if (!isDesktop) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        state="full"
        title={labels.title}
        footer={<AddToBag purchase={purchase} labels={labels} />}
        labels={{ ...BOTTOM_SHEET_LABELS, close: labels.close }}
      >
        <QuickViewBody {...content} layout="mobile" />
      </BottomSheet>
    );
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      labelledBy={`${titleId} ${nameId}`}
      motion="dialog"
      layoutClassName="items-center justify-center p-16"
      className="max-h-full w-full max-w-904 gap-16 overflow-y-auto rounded-overlay p-24 shadow-md"
    >
      <div className="flex items-center gap-8">
        <h2 id={titleId} className="min-w-0 flex-1 text-title-md text-text-primary">
          {labels.title}
        </h2>
        <CloseButton label={labels.close} onClick={onClose} />
      </div>
      <QuickViewBody {...content} layout="desktop" />
    </BaseModal>
  );
}

interface Purchase {
  variant?: string;
  selectVariant: (value: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  variantError: boolean;
  failed: boolean;
  addToBag: () => Promise<void>;
}

/** The selection and Add to bag, shared by the body and the mobile footer; reset on every open. */
function usePurchase(
  open: boolean,
  { product, defaultVariant, onAddToBag }: Omit<QuickViewProps, "open" | "onClose" | "labels">,
  variantsRef: RefObject<HTMLDivElement | null>,
): Purchase {
  const [variant, setVariant] = useState(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setVariant(defaultVariant);
      setQuantity(1);
      setVariantError(false);
      setFailed(false);
    }
  }

  async function addToBag() {
    if (pending) return;
    if (product.variants && !variant) {
      setVariantError(true);
      variantsRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      return;
    }
    setFailed(false);
    setPending(true);
    try {
      await onAddToBag({ variant, quantity });
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return {
    variant,
    selectVariant: (value) => {
      setVariant(value);
      setVariantError(false);
    },
    quantity,
    setQuantity,
    variantError,
    failed,
    addToBag,
  };
}

interface QuickViewBodyProps extends Omit<QuickViewProps, "open" | "onClose" | "labels"> {
  labels: QuickViewLabels;
  nameId: string;
  purchase: Purchase;
  variantsRef: RefObject<HTMLDivElement | null>;
  layout: "desktop" | "mobile";
}

function QuickViewBody({
  product,
  maxQuantity = QUICK_VIEW_DEFAULTS.maxQuantity,
  locale = QUICK_VIEW_DEFAULTS.locale,
  labels,
  nameId,
  purchase,
  variantsRef,
  layout,
}: QuickViewBodyProps) {
  const id = useId();
  const desktop = layout === "desktop";
  const { variants } = product;

  return (
    <div
      className={cn(
        "flex",
        desktop ? "flex-row items-start gap-24" : "flex-col gap-12 px-16 pt-8 pb-16",
      )}
    >
      <ProductGallery
        images={product.images}
        thumbnails={false}
        zoom={false}
        sizes={desktop ? "420px" : "100vw"}
        className={desktop ? "w-420 shrink-0" : "w-full"}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-12">
        {desktop && product.brand && (
          <p className="text-label-sm text-text-accent">{product.brand}</p>
        )}
        <h3
          id={nameId}
          className={cn("text-text-primary", desktop ? "text-headline-sm" : "text-title-md")}
        >
          {product.name}
        </h3>
        {desktop && product.rating && (
          <p className="flex items-center gap-8">
            <Rating value={product.rating.value} locale={locale} />
            <span className="text-body-sm text-text-tertiary">
              {labels.reviewCount(product.rating.reviewCount)}
            </span>
          </p>
        )}
        <Price price={product.price} compareAt={product.compareAt} size="lg" locale={locale} />

        {variants && (
          <div className="flex flex-col gap-12">
            <p id={`${id}-variant-label`} className="text-title-sm text-text-primary">
              {variants.label}
            </p>
            <div
              ref={variantsRef}
              role="group"
              aria-labelledby={`${id}-variant-label`}
              aria-describedby={purchase.variantError ? `${id}-variant-error` : undefined}
              className="flex flex-wrap gap-8"
            >
              {variants.options.map((option) => (
                <Chip
                  key={option.value}
                  pressed={option.value === purchase.variant}
                  disabled={option.disabled}
                  onClick={() => purchase.selectVariant(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            {purchase.variantError && (
              <p id={`${id}-variant-error`} className="text-label-sm text-text-error">
                {labels.selectVariant(variants.label)}
              </p>
            )}
          </div>
        )}

        {desktop && (
          <div className="flex items-center gap-8">
            <Stepper
              label={labels.quantity}
              size="md"
              value={purchase.quantity}
              max={maxQuantity}
              onValueChange={purchase.setQuantity}
            />
            <Button size="lg" onClick={purchase.addToBag} className="flex-1">
              {labels.addToBag}
            </Button>
          </div>
        )}
        {desktop && purchase.failed && <AddFailed labels={labels} />}
        <ButtonLink href={product.href} variant="ghost" className="self-start">
          {labels.viewDetails}
        </ButtonLink>
      </div>
    </div>
  );
}

/** Mobile footer: the error (when adding failed) above the full-width Add to bag. */
function AddToBag({ purchase, labels }: { purchase: Purchase; labels: QuickViewLabels }) {
  return (
    <div className="flex flex-col gap-12">
      {purchase.failed && <AddFailed labels={labels} />}
      <Button onClick={purchase.addToBag} className="w-full">
        {labels.addToBag}
      </Button>
    </div>
  );
}

function AddFailed({ labels }: { labels: QuickViewLabels }) {
  return (
    <Alert usage="negative" width="card">
      {labels.addFailed}
    </Alert>
  );
}

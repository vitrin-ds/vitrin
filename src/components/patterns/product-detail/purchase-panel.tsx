"use client";

import { useId, useState } from "react";
import { VariantSelector } from "@/components/patterns/variant-selector/variant-selector";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { Label } from "@/components/ui/label/label";
import { Price } from "@/components/ui/price/price";
import { Stepper } from "@/components/ui/stepper/stepper";
import type { Money, ProductVariant } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";
import { saving, unitPrice, variantTitle } from "./product-detail-helpers";
import type { ProductDetailLabels } from "./product-detail-labels";

// The buying part of the 06.01 "Right" column: Prices (Price xl + the "Save" Label, gap 8; the
// member price under it, gap 12), the Variant Selector, the stock Alert, then Buttons (gap 20):
// Stepper + Add to Cart (Filled Large), and Buy Now (Outline Large, full width). The selected
// variant is the block's state (the gallery follows it). Out-of-stock variants are visible but
// disabled (Variant Selector); one selected anyway disables the buttons and the Alert says why.

/** Most units one add can take (stock permitting). */
export const MAX_QUANTITY = 10;

export interface PurchasePanelProps {
  variants: readonly ProductVariant[];
  variant: ProductVariant;
  onVariantChange: (variantId: string) => void;
  /** Adds the selection; resolves once the backend took it. */
  onAdd: (quantity: number, buyNow: boolean) => Promise<void>;
  /** Shows Buy Now when given. */
  buyNow: boolean;
  /** Member price row (e.g. a loyalty card): shown when given. */
  memberPrice?: (price: Money) => Money;
  labels: ProductDetailLabels;
}

export function PurchasePanel({
  variants,
  variant,
  onVariantChange,
  onAdd,
  buyNow,
  memberPrice,
  labels: L,
}: PurchasePanelProps) {
  const id = useId();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const soldOut = variant.stock === "out-of-stock";
  const max = Math.max(1, Math.min(MAX_QUANTITY, variant.quantityAvailable));
  const saved = saving(variant);
  const axis = variant.options[0]?.name;

  function select(next: string) {
    setQuantity(1);
    onVariantChange(next);
  }

  async function add(now: boolean) {
    if (soldOut || pending) return;
    setPending(true);
    try {
      await onAdd(Math.min(quantity, max), now);
    } finally {
      setPending(false);
    }
  }

  const stock = L.stock[variant.stock];
  const stockBody =
    variant.stock === "low-stock"
      ? L.stock["low-stock"].body(variant.quantityAvailable)
      : (stock.body as string);
  const describedBy = soldOut ? `${id}-stock` : undefined;

  return (
    <div className="flex flex-col gap-24" data-variant={variant.id}>
      <div className="flex flex-col gap-12">
        <div className="flex flex-wrap items-center gap-8">
          <Price price={variant.price} compareAt={variant.compareAtPrice} size="xl" />
          {saved && <Label>{L.save(formatMoney(saved))}</Label>}
        </div>
        {memberPrice && (
          <p className="flex items-start gap-4 text-body-lg text-text-accent">
            <Icon name="credit_card_heart" fill={false} />
            <span>
              <strong>{L.cardPrice.brand}</strong>
              {L.cardPrice.label}
              <strong>{formatMoney(memberPrice(variant.price))}</strong>
            </span>
          </p>
        )}
      </div>

      {variants.length > 1 && axis && (
        <VariantSelector
          label={L.axis[axis] ?? axis}
          name="variant"
          value={variant.id}
          onValueChange={select}
          options={variants.map((item) => {
            const perUnit = unitPrice(item);
            return {
              value: item.id,
              label: variantTitle(item),
              description: perUnit && L.unitPrice(formatMoney(perUnit), "100 ml"),
              swatch: item.options[0]?.swatch,
              unavailable: item.stock === "out-of-stock",
            };
          })}
          labels={{ unavailable: L.unavailableOption, unavailableList: L.unavailableList }}
        />
      )}

      <Alert
        id={`${id}-stock`}
        usage={soldOut ? "negative" : variant.stock === "low-stock" ? "notice" : "positive"}
        width="card"
        title={stock.title}
      >
        {stockBody}
      </Alert>

      <div className="flex flex-col gap-20">
        <div className="flex items-center gap-20">
          <Stepper
            label={L.quantity}
            size="md"
            value={Math.min(quantity, max)}
            max={max}
            onValueChange={setQuantity}
            disabled={soldOut}
            className="w-140 shrink-0"
          />
          <Button
            size="lg"
            className="flex-1"
            onClick={() => void add(false)}
            disabled={soldOut}
            aria-describedby={describedBy}
          >
            {L.addToCart}
          </Button>
        </div>
        {buyNow && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => void add(true)}
            disabled={soldOut}
            aria-describedby={describedBy}
          >
            {L.buyNow}
          </Button>
        )}
      </div>
    </div>
  );
}

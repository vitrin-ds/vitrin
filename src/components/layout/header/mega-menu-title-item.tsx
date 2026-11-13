import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";

// Figma `.Asset Mega Menu Title Item` (30659:8579): padding 6 · 2, gap 4, title-medium text-primary
// with a 20px keyboard_arrow_right. State=Hover & Selected fills it with surface-secondary. A Link
// Group's title is static text (`p`); the Subcategory sidebar's is a tab (`button`), the only one
// that reacts to hover. Group titles are not headings, so a menu never adds to the page outline.

const TITLE_ITEM =
  "flex items-center gap-4 rounded-4 px-2 py-6 text-start text-title-md text-text-primary";

interface MegaMenuTitleItemBase {
  /** Figma `Label Text`. */
  label: string;
  /** Figma `Show Right Icon`: keyboard_arrow_right after the label. */
  chevron?: boolean;
  /** Figma `State=Hover & Selected`, as a business state. */
  selected?: boolean;
}

export type MegaMenuTitleItemProps = MegaMenuTitleItemBase &
  (
    | ({ as?: "p" } & Omit<ComponentPropsWithRef<"p">, "children">)
    | ({ as: "button" } & Omit<ComponentPropsWithRef<"button">, "children">)
  );

export function MegaMenuTitleItem({
  label,
  chevron,
  selected,
  className,
  ...props
}: MegaMenuTitleItemProps) {
  const content = (
    <>
      <span className="min-w-0 flex-1">{label}</span>
      {chevron && <Icon name="keyboard_arrow_right" />}
    </>
  );
  const fill = selected && "bg-surface-secondary";
  if (props.as === "button") {
    const { as: _as, ...button } = props;
    return (
      <button
        type="button"
        {...button}
        className={cn(TITLE_ITEM, "cursor-pointer hover:bg-surface-secondary", fill, className)}
      >
        {content}
      </button>
    );
  }
  const { as: _as, ...text } = props;
  return (
    <p {...text} className={cn(TITLE_ITEM, fill, className)}>
      {content}
    </p>
  );
}

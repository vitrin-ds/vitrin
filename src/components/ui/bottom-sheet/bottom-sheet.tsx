"use client";

import { useId, type ReactNode } from "react";
import { BaseModal } from "@/components/base/modal/base-modal";
import { SheetFooter } from "@/components/base/modal/sheet-footer";
import { cn } from "@/lib/cn";
import { ToolbarSheetTitle } from "../toolbar/toolbar-sheet-title";

// Figma `BottomSheet` (State: Half · Full) with `Toolbar.Sheet.Title`: a 36×5 grabber
// (surface-inverse), an optional back button (Left Button: outline circle, arrow_back), the centred
// title (label-medium) + subtitle, and the close button (Right Button: a 44px interactive-default
// circle with close_small in icon-on-accent, the toolbar's own button, not the overlay close);
// then the Content slot, which scrolls. Half takes at most half the viewport; Full leaves 64 at
// the top (Figma WM.09.01.02: the page shows under the scrim, like an iOS sheet). Only the top
// corners are rounded (24). Slides up from the bottom edge. Mobile surface (Figma: "Don't use sheets on
// desktop"); from tablet up it is 445px wide and centred. The grabber is decorative: there is no
// drag gesture. An optional `footer` is a fixed action bar under the scrolling content
// (surface-raised + shadow-up, see SheetFooter).

export interface BottomSheetLabels {
  close: string;
  back: string;
}

export const BOTTOM_SHEET_LABELS: BottomSheetLabels = { close: "Close", back: "Back" };

export const BOTTOM_SHEET_DEFAULTS = { state: "half" } as const;

export interface BottomSheetProps {
  open: boolean;
  /** Escape, the scrim and the close button call this. */
  onClose: () => void;
  /** Figma `State`: Half for quick choices (filters, sort), Full for longer flows. */
  state?: "half" | "full";
  /** Figma `Main Title Text`. */
  title: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  /** Figma `Left Button` (arrow_back): shown when given, e.g. to step back inside the sheet. */
  onBack?: () => void;
  /** Figma `Content` slot. */
  children: ReactNode;
  /** Fixed action bar under the scrolling content (e.g. Clear all + Show results). */
  footer?: ReactNode;
  labels?: BottomSheetLabels;
}

export function BottomSheet({
  open,
  onClose,
  state = BOTTOM_SHEET_DEFAULTS.state,
  title,
  subtitle,
  onBack,
  children,
  footer,
  labels = BOTTOM_SHEET_LABELS,
}: BottomSheetProps) {
  const id = useId();
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      labelledBy={`${id}-title`}
      motion="sheet-bottom"
      layoutClassName="items-end justify-center"
      className={cn(
        "w-full rounded-t-24 shadow-md tablet:max-w-445",
        // Full: stretches to the viewport height minus its 64 top margin.
        state === "half" ? "max-h-1/2" : "mt-64 self-stretch",
      )}
    >
      <ToolbarSheetTitle
        title={title}
        subtitle={subtitle}
        titleId={`${id}-title`}
        leftAction={onBack && { icon: "arrow_back", label: labels.back, onClick: onBack }}
        rightAction={{ icon: "close_small", label: labels.close, onClick: onClose }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <SheetFooter>{footer}</SheetFooter>}
    </BaseModal>
  );
}

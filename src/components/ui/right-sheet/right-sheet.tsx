"use client";

import { useId, type ReactNode } from "react";
import { BaseModal } from "@/components/base/modal/base-modal";
import { ToolbarSidePanelTitle } from "../toolbar/toolbar-sidepanel-title";
import { SheetFooter } from "@/components/base/modal/sheet-footer";

// Figma `RightSheet` with `Toolbar.SidePanel.Title`: a full-height panel on the right edge, 560px
// wide (full width below that), no radius, shadow/md, sliding in from the right. Toolbar: title
// (title-large) + subtitle (body-small, text-tertiary) and the overlay close button (top right),
// padding 20 · 12, gap 20, a 1px border-neutral underneath. The Content slot scrolls (Figma
// `Show Scroll Bar`). For filters, mini cart and detail panels on tablet and desktop. An optional
// `footer` is a fixed action bar under the scrolling content (surface-raised + shadow-up).

export interface RightSheetLabels {
  close: string;
  back?: string;
}

export const RIGHT_SHEET_LABELS: RightSheetLabels = { close: "Close", back: "Back" };

export interface RightSheetProps {
  open: boolean;
  /** Escape, the scrim and the close button call this. */
  onClose: () => void;
  /** Figma `Main Title Text`. */
  title: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  /** A step inside the sheet: arrow_back before the title, as the Bottom Sheet's Left Button. */
  onBack?: () => void;
  /** Figma `Content` slot. */
  children: ReactNode;
  /** Fixed action bar under the scrolling content (e.g. Checkout + View cart). */
  footer?: ReactNode;
  labels?: RightSheetLabels;
}

export function RightSheet({
  open,
  onClose,
  title,
  subtitle,
  onBack,
  children,
  footer,
  labels = RIGHT_SHEET_LABELS,
}: RightSheetProps) {
  const id = useId();
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      labelledBy={`${id}-title`}
      motion="sheet-right"
      layoutClassName="justify-end"
      className="h-full w-full max-w-560 shadow-md"
    >
      <ToolbarSidePanelTitle
        title={title}
        subtitle={subtitle}
        titleId={`${id}-title`}
        leftAction={
          onBack && {
            icon: "arrow_back",
            label: labels.back ?? RIGHT_SHEET_LABELS.back ?? "",
            onClick: onBack,
          }
        }
        rightAction={{ label: labels.close, onClick: onClose }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <SheetFooter>{footer}</SheetFooter>}
    </BaseModal>
  );
}

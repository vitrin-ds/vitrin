"use client";

import type { ReactNode } from "react";
import { TABLET_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { RightSheet } from "@/components/ui/right-sheet/right-sheet";

// One sheet for two breakpoints, as Figma draws the task sheets: a Right Sheet from 744px (WD /
// WT) and a Full Bottom Sheet on mobile (WM). The checkout's change sheets (09.03.05–06) and My
// Account's Cancel Order (03.01.03) use it; the action buttons go in the fixed `footer` or, where
// Figma scrolls them with the content, at the end of `children`.

export interface AdaptiveSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** A step inside the sheet: arrow_back in the toolbar. */
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function AdaptiveSheet({
  open,
  onClose,
  title,
  subtitle,
  onBack,
  footer,
  children,
}: AdaptiveSheetProps) {
  const wide = useMediaQuery(TABLET_QUERY);
  return wide ? (
    <RightSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      footer={footer}
    >
      {children}
    </RightSheet>
  ) : (
    <BottomSheet
      open={open}
      onClose={onClose}
      state="full"
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      footer={footer}
    >
      {children}
    </BottomSheet>
  );
}

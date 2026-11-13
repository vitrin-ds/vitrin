"use client";

import type { ReactNode } from "react";
import { AdaptiveSheet } from "@/components/patterns/adaptive-sheet/adaptive-sheet";

// The checkout's change sheets (Figma WD/WT.09.03.05–06: Right Sheet; WM: Bottom Sheet, Full),
// with the confirm button in the fixed footer: the AdaptiveSheet pattern.

export interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer: ReactNode;
  children: ReactNode;
}

export function CheckoutSheet(props: CheckoutSheetProps) {
  return <AdaptiveSheet {...props} />;
}

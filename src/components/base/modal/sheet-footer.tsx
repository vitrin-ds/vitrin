import type { ReactNode } from "react";

// The fixed action bar at the bottom of Bottom Sheet and Right Sheet (the `footer` slot): outside
// the scrolling Content, so the actions stay visible however long the content is. A bar fixed to
// the bottom of a raised surface: surface-raised + shadow-up (shadow-up is only for bars fixed to
// the bottom), padding 12 · 16 · 16
// (the Filters and Sort sheets' action bars). `relative` paints its shadow over the content's text.
// The safe-area inset is not added: the app does not set viewport-fit=cover, so it is always 0.

export function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <div className="relative shrink-0 bg-surface-raised px-16 pt-12 pb-16 shadow-up">
      {children}
    </div>
  );
}

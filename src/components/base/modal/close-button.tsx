import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";

// Figma overlay close standard (Faz 2c review): a 32px circle with a 24px close_small in
// icon-primary, hover interactive-subtle-hover, top right of Dialog, Pop Up and the sheets.
// ::before grows the hit area to 44px+. Keyboard focus looks like hover.

export interface CloseButtonProps {
  /** Accessible name, e.g. "Close". */
  label: string;
  onClick: () => void;
  /** The same control for a sheet's way back (arrow_back). */
  icon?: IconName;
  className?: string;
}

export function CloseButton({ label, onClick, icon = "close_small", className }: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "text-icon-primary hover:bg-interactive-subtle-hover focus-visible:bg-interactive-subtle-hover active:bg-interactive-subtle-active",
        "before:absolute before:-inset-8",
        className,
      )}
    >
      <Icon name={icon} size="24" tone="current" />
    </button>
  );
}

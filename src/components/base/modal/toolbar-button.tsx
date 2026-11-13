import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";

// The round buttons of Figma's Toolbar.Sheet.Title: a 44px circle, padding 12, 20px icon.
// - `outline` (Left Button, e.g. back): surface-primary with a 1px border-neutral, icon-primary;
//   hover uses the interactive-hover border.
// - `accent` (Right Button, the sheet's close with close_small): interactive-default fill,
//   icon-on-accent; hover / pressed interactive-hover / -active.
// Focus is the global ring. Dialogs and the right sheet close with the overlay CloseButton.

export interface ToolbarButtonProps {
  icon: IconName;
  /** Accessible name (icon-only). */
  label: string;
  onClick: () => void;
  /** id of the element the button controls (e.g. a carousel's slides for Pause / Play). */
  controls?: string;
  /** `outline` (default, Left Button) or `accent` (Right Button: close). */
  tone?: "outline" | "accent";
  className?: string;
}

export function ToolbarButton({
  icon,
  label,
  onClick,
  controls,
  tone = "outline",
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer rounded-full p-12",
        tone === "outline"
          ? "bg-surface-primary text-icon-accent inset-ring inset-ring-border-neutral hover:inset-ring-interactive-hover focus-visible:inset-ring-interactive-hover"
          : "bg-interactive-default text-icon-on-accent hover:bg-interactive-hover focus-visible:bg-interactive-hover active:bg-interactive-active",
        className,
      )}
    >
      {/* Accent is the sheet's close: Figma's close_small is 8 × 8 in the 20 box (opsz 24). */}
      <Icon name={icon} tone="current" opticalSize={tone === "accent" ? 24 : undefined} />
    </button>
  );
}

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";

// The small text actions of the account cards (Card.Address, Card.PaymentMethod.Minimal: Edit,
// Delete, Make Default): a 20px icon-accent glyph (weight 200) + label-medium text-primary, gap 4,
// optionally underlined. Each action is a 44px-tall row (Figma Faz 3a: 44px tap targets), so
// stacked actions sit flush with no gap and their targets never overlap.

export interface TextActionProps {
  icon: IconName;
  /** Visible text. */
  label: string;
  /** Accessible name; starts with the visible label (WCAG 2.5.3), e.g. "Edit Home address". */
  name: string;
  onClick: () => void;
  disabled?: boolean;
  underline?: boolean;
}

export function TextAction({
  icon,
  label,
  name,
  onClick,
  disabled = false,
  underline = false,
}: TextActionProps) {
  return (
    <button
      type="button"
      aria-label={name}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex h-44 cursor-pointer items-center gap-4 rounded-4 text-label-md text-text-primary",
        "hover:text-interactive-hover disabled:cursor-not-allowed disabled:text-text-disabled",
      )}
    >
      <Icon
        name={icon}
        weight={200}
        fill={false}
        tone="current"
        className="text-icon-accent group-disabled:text-icon-disabled"
      />
      <span className={cn(underline && "underline")}>{label}</span>
    </button>
  );
}

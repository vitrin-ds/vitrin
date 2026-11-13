import type { ReactNode } from "react";
import { Toggle } from "@/components/ui/toggle/toggle";
import { cn } from "@/lib/cn";

// Figma `Box For Default Select` (03.02, 03.03, 03.04, 03.05.01), a plain frame in the design: padding
// 16, title-small over body-small, a Toggle on the right, radius 12. What opens more goes in an
// Accordion with `indicator="toggle"`, as Figma draws it.

export function PreferenceBox({
  title,
  body,
  checked,
  onChange,
  plain = false,
  leading,
}: {
  title: string;
  body: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** A row without its box (03.05.01 Newsletter, Communication channels). */
  plain?: boolean;
  /** A glyph before the title. Decorative. */
  leading?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        !plain && "rounded-12 inset-ring",
        !plain && "bg-surface-primary inset-ring-border-neutral",
      )}
    >
      <div className={cn("flex items-center gap-12", plain ? "py-16 pr-16" : "p-16")}>
        {leading && <span className="flex shrink-0 self-start">{leading}</span>}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-title-sm text-text-primary">{title}</p>
          <p className="text-body-sm text-text-secondary">{body}</p>
        </div>
        <Toggle
          label={title}
          hideLabel
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      </div>
    </div>
  );
}

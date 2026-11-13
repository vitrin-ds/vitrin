import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Shared by Toolbar.Top.Title and Toolbar.Top.Search: a 52-tall bar on surface-primary, padding 12,
// gap 8. `scrolled` (Figma `State=Swipe Down`) adds the 1px border-default under it. The buttons are
// 20px glyphs in icon-accent with a 44px hit area; the second icon can carry a Small Red Badge.

export interface ToolbarAction {
  icon: IconName;
  /** Accessible name (icon only). */
  label: string;
  onClick: () => void;
  /** Figma `Show Basket Has Item`: a count on the icon; say it in `label` too. */
  badge?: number;
}

export interface ToolbarTopBaseProps {
  /** Figma `Show Left Button` + `Left Icon`: back navigation on inner screens. */
  leftAction?: Omit<ToolbarAction, "badge">;
  /** Figma `Show Text Action` + `Action Text`, e.g. "Skip". */
  textAction?: { label: string; onClick: () => void };
  /** Figma `1st Action` and `2nd Action` (Figma Do: at most two). */
  actions?: readonly ToolbarAction[];
  /** Figma `State=Swipe Down`: the page has scrolled under the bar. */
  scrolled?: boolean;
  className?: string;
}

export const TOOLBAR_TOP_DEFAULTS = { scrolled: false } as const;

export function ToolbarIconButton({ icon, label, onClick, badge }: ToolbarAction) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex shrink-0 cursor-pointer rounded-4 before:absolute before:-inset-12"
    >
      <Icon name={icon} />
      {badge !== undefined && (
        <Badge
          aria-hidden
          count={badge}
          color="red"
          size="small"
          className="absolute -top-11 -right-6"
        />
      )}
    </button>
  );
}

export function ToolbarTopFrame({
  scrolled = TOOLBAR_TOP_DEFAULTS.scrolled,
  className,
  children,
}: {
  scrolled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        "relative flex h-52 items-center gap-8 bg-surface-primary p-12",
        scrolled && "border-b border-border-default",
        className,
      )}
    >
      {children}
    </header>
  );
}

export function ToolbarTopActions({
  textAction,
  actions,
}: Pick<ToolbarTopBaseProps, "textAction" | "actions">) {
  if (!textAction && !actions?.length) return null;
  return (
    <div className="relative flex shrink-0 items-center gap-12">
      {textAction && (
        <button
          type="button"
          onClick={textAction.onClick}
          className="relative min-w-35 cursor-pointer rounded-4 text-right text-label-sm text-text-primary before:absolute before:-inset-14"
        >
          {textAction.label}
        </button>
      )}
      {!!actions?.length && (
        <div className="flex items-center gap-16">
          {actions.map((action) => (
            <ToolbarIconButton key={action.label} {...action} />
          ))}
        </div>
      )}
    </div>
  );
}

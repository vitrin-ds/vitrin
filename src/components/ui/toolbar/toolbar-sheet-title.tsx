import { ToolbarButton } from "@/components/base/modal/toolbar-button";
import { cn } from "@/lib/cn";
import type { IconName } from "../icon/icon-names";

// Figma `Toolbar.Sheet.Title` (30704:16358) on `.Base.Toolbar.Sheet.Title`: top padding 4, gap 4, a
// 36×5 grabber (surface-inverse), then the row (padding-x 8): the 44px Left Button (outline), the
// centred title (label-medium) + subtitle (label-xsmall, text-tertiary), the 44px Right Button
// (accent). The grabber is decorative: there is no drag gesture.

export interface ToolbarSheetAction {
  icon: IconName;
  /** Accessible name (icon only). */
  label: string;
  onClick: () => void;
}

export interface ToolbarSheetTitleProps {
  /** Figma `Main Title Text`. */
  title?: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  /** Figma `Show Left Button` + `Left Icon`. */
  leftAction?: ToolbarSheetAction;
  /** Figma `Show Right Button` + `Right Icon`. */
  rightAction?: ToolbarSheetAction;
  /** Id for the title: the sheet names itself with it. */
  titleId?: string;
  className?: string;
}

export function ToolbarSheetTitle({
  title,
  subtitle,
  leftAction,
  rightAction,
  titleId,
  className,
}: ToolbarSheetTitleProps) {
  return (
    <header className={cn("flex flex-col items-center gap-4 pt-4", className)}>
      <span aria-hidden className="h-5 w-36 rounded-full bg-surface-inverse" />
      <div className="grid w-full grid-cols-3 items-center px-8">
        <div className="justify-self-start">{leftAction && <ToolbarButton {...leftAction} />}</div>
        <div className="flex min-w-0 flex-col items-center text-center">
          {title && (
            <h2 id={titleId} className="text-label-md text-text-primary">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-label-xs text-text-tertiary">{subtitle}</p>}
        </div>
        {rightAction && (
          <ToolbarButton {...rightAction} tone="accent" className="justify-self-end" />
        )}
      </div>
    </header>
  );
}

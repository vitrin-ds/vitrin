import { CloseButton } from "@/components/base/modal/close-button";
import { cn } from "@/lib/cn";
import type { IconName } from "../icon/icon-names";

// Figma `Toolbar.SidePanel.Title` (30837:252747) on `.Base.Toolbar.Sidepanel.Title`: padding 20 · 20
// · 12, gap 20, a 1px border-neutral inside that bottom padding (78px in all). Title (title-large) + subtitle (body-small,
// text-tertiary); 44px buttons holding a 32px circle with a 24px glyph. The component's default
// shows the Left Button; RightSheet turns it off and shows the Right Button.

export interface ToolbarSidePanelAction {
  icon?: IconName;
  /** Accessible name (icon only). */
  label: string;
  onClick: () => void;
}

export interface ToolbarSidePanelTitleProps {
  /** Figma `Main Title Text`. */
  title?: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  /** Figma `Show Left Button` + `Left Icon`: close_small unless given. */
  leftAction?: ToolbarSidePanelAction;
  /** Figma `Show Right Button`: close_small unless given. */
  rightAction?: ToolbarSidePanelAction;
  /** Id for the title: the panel names itself with it. */
  titleId?: string;
  className?: string;
}

export function ToolbarSidePanelTitle({
  title,
  subtitle,
  leftAction,
  rightAction,
  titleId,
  className,
}: ToolbarSidePanelTitleProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-20 border-b border-border-neutral px-20 pt-20 pb-11",
        className,
      )}
    >
      {leftAction && <CloseButton {...leftAction} className="m-6" />}
      <div className="flex min-w-0 flex-1 flex-col">
        {title && (
          <h2 id={titleId} className="text-title-lg text-text-primary">
            {title}
          </h2>
        )}
        {subtitle && <p className="text-body-sm text-text-tertiary">{subtitle}</p>}
      </div>
      {rightAction && <CloseButton {...rightAction} className="m-6" />}
    </header>
  );
}

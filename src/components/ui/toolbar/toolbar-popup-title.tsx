import { CloseButton } from "@/components/base/modal/close-button";
import { cn } from "@/lib/cn";
import type { IconName } from "../icon/icon-names";

// Figma `Toolbar.PopUp.Title` (30705:2339) on `.Base.Toolbar.Popup.Title`: top padding 12, inner row
// padding-x 8. Title (title-medium) + subtitle (body-small, text-tertiary) on the left with 12 more
// inset; the 44px Right Button holds a 32px circle with a 24px glyph. Transparent: it sits on the
// popup's surface.

export interface ToolbarPopupTitleProps {
  /** Figma `Main Title Text`. */
  title?: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  /** Figma `Show Right Button` + `Right Icon`: close_small unless given. */
  rightAction?: { icon?: IconName; label: string; onClick: () => void };
  /** Id for the title: the popup names itself with it. */
  titleId?: string;
  headingLevel?: 2 | 3;
  className?: string;
}

export function ToolbarPopupTitle({
  title,
  subtitle,
  rightAction,
  titleId,
  headingLevel = 2,
  className,
}: ToolbarPopupTitleProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header className={cn("flex items-center justify-between px-8 pt-12", className)}>
      <div className="flex min-w-0 flex-1 flex-col pl-12">
        {title && (
          <Heading id={titleId} className="truncate text-title-md text-text-primary">
            {title}
          </Heading>
        )}
        {subtitle && <p className="truncate text-body-sm text-text-tertiary">{subtitle}</p>}
      </div>
      {rightAction && (
        <CloseButton
          icon={rightAction.icon}
          label={rightAction.label}
          onClick={rightAction.onClick}
          className="m-6"
        />
      )}
    </header>
  );
}

import {
  ToolbarIconButton,
  ToolbarTopActions,
  ToolbarTopFrame,
  type ToolbarTopBaseProps,
} from "./toolbar-parts";

// Figma `Toolbar.Top.Title` (State) on `.Base.Toolbar.Top.Title` (5475:8939): back on the left,
// actions on the right, and the title (label-medium) + subtitle (label-xsmall, text-tertiary)
// centred on the bar whatever the sides hold. The page's h1 by default.

export interface ToolbarTopTitleProps extends ToolbarTopBaseProps {
  /** Figma `Main Title Text`. */
  title?: string;
  /** Figma `Subtitle Text`. */
  subtitle?: string;
  headingLevel?: 1 | 2 | 3;
}

export function ToolbarTopTitle({
  title,
  subtitle,
  leftAction,
  textAction,
  actions,
  scrolled,
  headingLevel = 1,
  className,
}: ToolbarTopTitleProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ToolbarTopFrame scrolled={scrolled} className={className}>
      {leftAction && <ToolbarIconButton {...leftAction} />}
      <div className="pointer-events-none absolute inset-x-108 flex min-w-0 flex-col items-center text-center">
        {title && (
          <Heading className="w-full truncate text-label-md text-text-primary">{title}</Heading>
        )}
        {subtitle && <p className="w-full truncate text-label-xs text-text-tertiary">{subtitle}</p>}
      </div>
      <div className="min-w-0 flex-1" />
      <ToolbarTopActions textAction={textAction} actions={actions} />
    </ToolbarTopFrame>
  );
}

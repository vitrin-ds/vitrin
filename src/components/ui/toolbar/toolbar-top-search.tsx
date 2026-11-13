import { TextInput, type TextInputProps } from "../text-input/text-input";
import {
  ToolbarIconButton,
  ToolbarTopActions,
  ToolbarTopFrame,
  type ToolbarTopBaseProps,
} from "./toolbar-parts";

// Figma `Toolbar.Top.Search` (State) on `.Base.Toolbar.Top.Search` (30677:15499): the bar of
// Toolbar.Top.Title with a Small Text Input in place of the title, filling the space. The label is
// for screen readers only; the `search` Left Icon (input-icon-accent) comes with it.

export interface ToolbarTopSearchProps extends ToolbarTopBaseProps {
  /** Figma `Text Input`. `label` names it for screen readers. */
  search?: Omit<TextInputProps, "size" | "hideLabel" | "leftIcon" | "leftIconTone" | "className">;
}

export function ToolbarTopSearch({
  search,
  leftAction,
  textAction,
  actions,
  scrolled,
  className,
}: ToolbarTopSearchProps) {
  return (
    <ToolbarTopFrame scrolled={scrolled} className={className}>
      {leftAction && <ToolbarIconButton {...leftAction} />}
      {search ? (
        <TextInput
          type="search"
          {...search}
          size="sm"
          hideLabel
          leftIcon="search"
          leftIconTone="accent"
          className="min-w-0 flex-1"
        />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <ToolbarTopActions textAction={textAction} actions={actions} />
    </ToolbarTopFrame>
  );
}

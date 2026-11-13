import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `StepList.Item`: a 32px surface-accent circle with the number (title-small,
// text-on-accent) and, gap 16, the title (title-small, text-primary) over the optional
// description (body-medium, text-secondary), gap 4. Items stack 20 apart in an <ol> (StepList).
// The visible number is the list position; the browser marker is dropped.

export interface StepListStep {
  /** Figma `Title Text`: starts with a verb. */
  title: ReactNode;
  /** Figma `Body Text` (`Show Body`). */
  description?: ReactNode;
}

export interface StepListItemProps extends StepListStep {
  /** Figma `Number Text`. */
  number: number;
  /** Renders the title as a heading; a plain label without it. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Figma `StepList.Item`: one <li> of a StepList. */
export function StepListItem({
  number,
  title,
  description,
  headingLevel,
  className,
}: StepListItemProps) {
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  return (
    <li className={cn("flex items-start gap-16", className)}>
      <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-surface-accent text-title-sm text-text-on-accent tabular-nums">
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Title className="text-title-sm text-text-primary">{title}</Title>
        {description && <div className="text-body-md text-text-secondary">{description}</div>}
      </div>
    </li>
  );
}

export interface StepListProps {
  /** 3–6 sequential steps (Figma Do). */
  steps: readonly StepListStep[];
  /** Heading level of the step titles; plain labels without it. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function StepList({ steps, headingLevel, className }: StepListProps) {
  return (
    <ol className={cn("flex flex-col gap-20", className)}>
      {steps.map((step, i) => (
        <StepListItem key={i} number={i + 1} headingLevel={headingLevel} {...step} />
      ))}
    </ol>
  );
}

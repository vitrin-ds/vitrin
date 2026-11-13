"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../button/button";

// Figma `FeedbackPrompt` (State) on `.Base.FeedbackPrompt`: 1px border-default, radius 16,
// padding 20; the question (title-small, text-primary) and Yes / No (Button Outline, gap 8),
// wrapping to two lines (row gap 12) on narrow widths.
// State=Answered (right after a click, Figma Do) replaces the content with the thank-you message
// in title-small text-success. It sits in a polite live region and takes focus, so the answer
// is announced and focus isn't lost with the removed button. Sending is fire-and-forget: the
// page is never blocked if it fails (Figma Don't).

export type FeedbackAnswer = "yes" | "no";

export interface FeedbackPromptLabels {
  question: string;
  yes: string;
  no: string;
  thanks: string;
}

export const FEEDBACK_PROMPT_LABELS: FeedbackPromptLabels = {
  question: "Was this article helpful?",
  yes: "Yes",
  no: "No",
  thanks: "Thanks — your feedback helps us improve this page.",
};

export interface FeedbackPromptProps {
  /** Called once with the answer. */
  onAnswer?: (answer: FeedbackAnswer) => void;
  /** Figma `State=Answered` (controlled), e.g. when the page remembers a previous answer. */
  answered?: boolean;
  labels?: FeedbackPromptLabels;
  className?: string;
}

export function FeedbackPrompt({
  onAnswer,
  answered: answeredProp,
  labels = FEEDBACK_PROMPT_LABELS,
  className,
}: FeedbackPromptProps) {
  const id = useId();
  const [answeredState, setAnswered] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const answered = answeredProp ?? answeredState;

  useEffect(() => {
    if (justAnswered) statusRef.current?.focus({ preventScroll: true });
  }, [justAnswered]);

  const answer = (value: FeedbackAnswer) => {
    setAnswered(true);
    setJustAnswered(true);
    onAnswer?.(value);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-16 gap-y-12 rounded-surface border border-border-default p-20",
        className,
      )}
    >
      {!answered && (
        <div role="group" aria-labelledby={`${id}-question`} className="contents">
          <p id={`${id}-question`} className="text-title-sm text-text-primary">
            {labels.question}
          </p>
          <div className="flex gap-8">
            <Button variant="outline" onClick={() => answer("yes")}>
              {labels.yes}
            </Button>
            <Button variant="outline" onClick={() => answer("no")}>
              {labels.no}
            </Button>
          </div>
        </div>
      )}
      <div
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={cn("text-title-sm text-text-success outline-none", !answered && "sr-only")}
      >
        {answered ? labels.thanks : null}
      </div>
    </div>
  );
}

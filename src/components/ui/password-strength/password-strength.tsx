import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

// Figma `PasswordStrength` (03.06): the caption row (label-large, text-secondary) with the verdict
// on the right, over four bars (gap 8). The bars fill from the left in border-success, the rest
// surface-neutral; below Good they warn (Fair) or alarm (Weak), and the verdict follows. Decorative
// for assistive technology beyond the sentence it reads out: the requirements list carries detail.

export const passwordStrengthBarVariants = cva("h-4 flex-1 rounded-full", {
  variants: {
    tone: {
      empty: "bg-surface-neutral",
      error: "bg-border-error",
      warning: "bg-border-warning",
      success: "bg-border-success",
    },
  },
});

const STEPS = 4;

export interface PasswordStrengthProps {
  /** Figma caption, e.g. "STRENGTH". */
  label: string;
  /** How strong it is, 0–4. */
  score: number;
  /** Figma verdict for this score, e.g. "Strong". */
  verdict: string;
  className?: string;
}

export function PasswordStrength({ label, score, verdict, className }: PasswordStrengthProps) {
  const tone = score >= 3 ? "success" : score === 2 ? "warning" : "error";
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="flex items-center justify-between gap-24 text-label-lg">
        <span className="text-text-secondary">{label}</span>
        <span
          aria-live="polite"
          className={
            tone === "success"
              ? "text-text-success"
              : tone === "warning"
                ? "text-text-warning"
                : "text-text-error"
          }
        >
          {score > 0 ? verdict : ""}
        </span>
      </p>
      <div aria-hidden className="flex gap-8">
        {Array.from({ length: STEPS }, (_, step) => (
          <span
            key={step}
            className={passwordStrengthBarVariants({ tone: step < score ? tone : "empty" })}
          />
        ))}
      </div>
    </div>
  );
}

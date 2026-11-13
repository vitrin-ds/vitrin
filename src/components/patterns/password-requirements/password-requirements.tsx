import { cn } from "@/lib/cn";
import { passwordChecks, PASSWORD_RULES, type PasswordChecks } from "@/lib/api/password";
import { Icon } from "@/components/ui/icon/icon";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";

// Figma `Requirements Box` (01.01.02 Create new password, 02.01 Register): the password rules
// under a new-password field, each green once met and red until then; the box border is red
// while any rule is unmet and green when all are. Padding 20, gap 12, radius 8; title
// title-medium, rules body-small 8 apart. Colour is not the only cue (WCAG 1.4.1): each rule
// has a check / cancel glyph and a hidden "met" / "not met yet". A flat card: Figma's drop shadow
// on surface-primary is not used: shadows only go on raised surfaces.
// The rules come from the API (PASSWORD_RULES / passwordChecks), so the list and the check the
// server runs never disagree.

export interface PasswordRequirementsLabels {
  title: string;
  rules: Record<keyof PasswordChecks, string>;
  met: string;
  unmet: string;
}

export const PASSWORD_REQUIREMENTS_LABELS: PasswordRequirementsLabels = {
  title: "Password requirements",
  rules: {
    minLength: `At least ${PASSWORD_RULES.minLength} characters`,
    letter: "One letter",
    digit: "One number",
  },
  met: "met",
  unmet: "not met yet",
};

export interface PasswordRequirementsProps {
  /** The password typed so far. */
  password: string;
  /** Id for the title (e.g. to describe the field). */
  id?: string;
  labels?: PasswordRequirementsLabels;
  className?: string;
}

export function PasswordRequirements({
  password,
  id,
  labels = PASSWORD_REQUIREMENTS_LABELS,
  className,
}: PasswordRequirementsProps) {
  const checks = passwordChecks(password);
  const allMet = Object.values(checks).every(Boolean);
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col gap-12 rounded-card border bg-surface-primary p-20",
        allMet ? "border-border-success" : "border-border-error",
        className,
      )}
    >
      <p
        id={titleId}
        className={cn("text-title-md", allMet ? "text-text-success" : "text-text-primary")}
      >
        {labels.title}
      </p>
      <ul className="flex flex-col gap-8">
        {(Object.keys(labels.rules) as (keyof PasswordChecks)[]).map((rule) => (
          <li
            key={rule}
            className={cn(
              "flex items-center gap-4 text-body-sm",
              checks[rule] ? "text-text-success" : "text-text-error",
            )}
          >
            <Icon name={checks[rule] ? "check_circle" : "cancel"} tone="current" size="sm" />
            {labels.rules[rule]}
            <VisuallyHidden>, {checks[rule] ? labels.met : labels.unmet}</VisuallyHidden>
          </li>
        ))}
      </ul>
    </section>
  );
}

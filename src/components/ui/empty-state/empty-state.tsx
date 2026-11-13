import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "../button/button";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `EmptyState` (Type) on `.Base.EmptyState`: a centred stack of the visual, title, body and
// up to two actions (Primary = Filled, Secondary = Outline, Medium, wrapping, gap 8).
// Type Icon: a tinted card (surface-secondary, radius 16, padding 24 × 40, gap 16) with the icon
// (48px, icon-accent) and the title in headline-small. Type Error Code: no surface, gap 24, the code
// ("404") in display-large text-accent and the title in headline-medium (full-page 404 / 410 /
// 500 only). The title is the only heading; the code is decorative and hidden from assistive
// technology so it isn't read twice. Body is body-medium text-secondary. Figma `Show Icon` /
// `Show Code` / `Show Actions` / `Show Primary Action` / `Show Secondary Action` are optional
// props. An action is a link (`href`) or a button (`onClick`).

export const emptyStateVariants = cva("flex flex-col items-center text-center", {
  variants: {
    type: {
      icon: "gap-16 rounded-surface bg-surface-secondary px-24 py-40",
      "error-code": "gap-24",
    },
  },
});

export const EMPTY_STATE_DEFAULTS = {
  type: "icon",
  headingLevel: 2,
} as const satisfies Required<VariantProps<typeof emptyStateVariants>> & {
  headingLevel: number;
};

export type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

interface EmptyStateBaseProps {
  /** Figma `Title Text`: what happened, in plain language. The heading. */
  title: string;
  /** Figma `Body Text`: why, and what the user can do. */
  body?: string;
  /** Figma `Primary Action` (Filled): the one action that resolves the state. */
  primaryAction?: EmptyStateAction;
  /** Figma `Secondary Action` (Outline). */
  secondaryAction?: EmptyStateAction;
  /** 1 on a full error page, 2 or 3 inside a page. */
  headingLevel?: 1 | 2 | 3 | 4;
  className?: string;
}

export type EmptyStateProps = EmptyStateBaseProps &
  (
    | {
        /** Figma `Type=Icon`. */
        type?: "icon";
        /** Figma `Icon` (Material Symbols). Decorative. */
        icon?: IconName;
        code?: never;
      }
    | {
        /** Figma `Type=Error Code`. */
        type: "error-code";
        /** Figma `Code Text`, e.g. "404". Decorative: the title says what happened. */
        code?: string;
        icon?: never;
      }
  );

function Action({ action, variant }: { action: EmptyStateAction; variant: "filled" | "outline" }) {
  if (action.href !== undefined) {
    return (
      <ButtonLink href={action.href} variant={variant}>
        {action.label}
      </ButtonLink>
    );
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function EmptyState({
  type = EMPTY_STATE_DEFAULTS.type,
  icon,
  code,
  title,
  body,
  primaryAction,
  secondaryAction,
  headingLevel = EMPTY_STATE_DEFAULTS.headingLevel,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  const isErrorCode = type === "error-code";

  return (
    <div className={cn(emptyStateVariants({ type }), className)}>
      {!isErrorCode && icon && <Icon name={icon} size="2xl" />}
      {isErrorCode && code && (
        <p aria-hidden className="text-display-lg text-text-accent">
          {code}
        </p>
      )}
      <Heading
        className={cn("text-text-primary", isErrorCode ? "text-headline-md" : "text-headline-sm")}
      >
        {title}
      </Heading>
      {body && <p className="text-body-md text-text-secondary">{body}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap justify-center gap-8">
          {primaryAction && <Action action={primaryAction} variant="filled" />}
          {secondaryAction && <Action action={secondaryAction} variant="outline" />}
        </div>
      )}
    </div>
  );
}

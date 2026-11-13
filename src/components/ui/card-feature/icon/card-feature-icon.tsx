import { cva } from "class-variance-authority";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "../../button/button";
import { Icon } from "../../icon/icon";
import type { IconName } from "../../icon/icon-names";

// Figma `Card.Feature.Icon` (State Default · Hover) on `.Base.Card.Feature`: surface-primary + 1px
// border-default, radius 8, padding 24, gap 16, with the 32px icon (icon-accent, weight 200,
// outlined; decorative), the head (title in title-medium text-primary, optional
// trailing value in title-small text-accent), the description (body-small text-secondary), the
// footer (meta in label-small text-tertiary + 20px arrow_forward, weight 200, outlined) and the
// optional Outline button. State=Hover (surface-accent-subtle) is CSS, on link cards only. Figma
// `Show Arrow` (the whole card is a link) and `Show Button` (an action) exclude each other, so a
// card takes either `href` or `action`: with `href` the title is the link and its ::after covers
// the card. The action is a button (`onClick`) or a link drawn as one (`href`). `Show Icon` / `Show Trailing` / `Show Description` / `Show Footer` are optional props.

export const cardFeatureIconVariants = cva(
  "relative flex flex-col gap-16 rounded-card bg-surface-primary p-24 inset-ring inset-ring-border-default",
  {
    variants: {
      /** A link card (`href`): Figma State=Hover on pointer hover. */
      link: { true: "hover:bg-surface-accent-subtle", false: "" },
    },
  },
);

export const CARD_FEATURE_ICON_DEFAULTS = { headingLevel: 3 } as const;

export type CardFeatureIconAction =
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href: string; onClick?: never };

interface CardFeatureBaseProps {
  /** Figma `Icon` (Material Symbols, 32px). */
  icon?: IconName;
  /** Figma `Title Text`: the card's accessible name. */
  title: string;
  /** Figma `Trailing Text`: a right-aligned value, e.g. a price. */
  trailing?: string;
  /** Figma `Description Text`: one or two sentences. */
  description?: string;
  /** Figma `Meta Text`, e.g. "Updated 12 March 2026" or "14 articles". */
  meta?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export type CardFeatureIconProps = CardFeatureBaseProps &
  (
    | {
        /** Link card (Figma `Show Arrow`): the whole card opens this page. */
        href: string;
        action?: never;
      }
    | {
        href?: never;
        /**
         * Action card (Figma `Show Button`): an Outline button, e.g. "Start chat". With `href` it
         * is a link styled as the button ("Call now" → `tel:`, "Send a message" → a page).
         */
        action?: CardFeatureIconAction;
      }
  );

export function CardFeatureIcon({
  icon,
  title,
  trailing,
  description,
  meta,
  href,
  action,
  headingLevel = CARD_FEATURE_ICON_DEFAULTS.headingLevel,
  className,
}: CardFeatureIconProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      data-card="feature"
      className={cn(cardFeatureIconVariants({ link: href !== undefined }), className)}
    >
      {icon && <Icon name={icon} size="32" weight={200} fill={false} />}
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-8">
          <Heading className="min-w-0 flex-1 text-title-md text-text-primary">
            {href ? (
              <NextLink href={href} className="rounded-4 after:absolute after:inset-0">
                {title}
              </NextLink>
            ) : (
              title
            )}
          </Heading>
          {trailing && (
            <p className="shrink-0 text-title-sm whitespace-nowrap text-text-accent">{trailing}</p>
          )}
        </div>
        {description && <p className="text-body-sm text-text-secondary">{description}</p>}
      </div>
      {(meta || href) && (
        <div className="flex items-center gap-8">
          <p className="min-w-0 flex-1 text-label-sm text-text-tertiary">{meta}</p>
          {href && <Icon name="arrow_forward" weight={200} fill={false} />}
        </div>
      )}
      {action && (
        <div className="flex">
          {action.href !== undefined ? (
            <ButtonLink variant="outline" href={action.href}>
              {action.label}
            </ButtonLink>
          ) : (
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

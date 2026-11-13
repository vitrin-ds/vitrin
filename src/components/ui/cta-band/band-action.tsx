import { Button, ButtonLink, type ButtonSize } from "../button/button";

// An action of a content block (CTABand, CardFeatureAuthor) or a promotion (Hero Banner, the In Page
// Banners): a Figma `Button` instance that navigates (href → ButtonLink) or acts (onClick →
// Button). Promotions use Button Large in Figma (with a 216px width, which callers pass as a
// minimum so longer labels still fit), Banner [Text] Medium.

export type BandActionProps = { label: string; className?: string } & (
  { href: string; onClick?: never } | { onClick: () => void; href?: never }
);

export function BandAction({
  label,
  href,
  onClick,
  variant,
  size,
  className,
}: BandActionProps & {
  variant: "filled" | "outline" | "ghost";
  size?: ButtonSize;
}) {
  if (href !== undefined) {
    return (
      <ButtonLink href={href} variant={variant} size={size} className={className}>
        {label}
      </ButtonLink>
    );
  }
  return (
    <Button variant={variant} size={size} onClick={onClick} className={className}>
      {label}
    </Button>
  );
}

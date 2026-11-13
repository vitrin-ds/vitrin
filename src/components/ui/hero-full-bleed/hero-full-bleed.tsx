import NextImage from "next/image";
import NextLink from "next/link";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";

// Figma `Hero [Full Bleed]` (31695:1224, Breakpoint Desktop · Tablet · Mobile): the single-brand
// home hero. A surface-accent-strong fill (the hero image goes on top of it), the transparent
// Header [Minimal] (Inverse) at the top, the copy in the top-right 3 columns (headline-small,
// body-medium, a label-large link), the oversized wordmark bottom-left and "Scroll down" under the
// copy column. Text is text-on-accent throughout.
// The wordmark is the brand's SVG (Figma `Logo`), not a text style: it scales per breakpoint
// (582 · 436 · 272 wide, the 240 · 180 · 112px wordmark in Figma).

export interface HeroFullBleedProps {
  /** Figma `Headline`. */
  headline: ReactNode;
  /** Figma `Body`. */
  body: string;
  /** Figma `Link`. */
  link: { label: string; href: string };
  /** Figma `Logo`: the brand wordmark as an SVG, drawn in text-on-accent (white). */
  logo: ImageAsset;
  /** The hero image; without it the accent fill shows. */
  image?: ImageAsset;
  /** Header [Minimal] with `tone="inverse"`. */
  header?: ReactNode;
  /** "Scroll down" hint; hidden when not given. */
  scrollHint?: string;
  className?: string;
}

export function HeroFullBleed({
  headline,
  body,
  link,
  logo,
  image,
  header,
  scrollHint,
  className,
}: HeroFullBleedProps) {
  return (
    <section
      className={cn(
        "relative flex h-640 flex-col overflow-hidden bg-surface-accent-strong pt-24 pb-24 text-text-on-accent tablet:h-720 desktop:h-820 desktop:pb-40",
        className,
      )}
    >
      {image && (
        <NextImage
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      {header && <header className="relative px-(--th-grid-margin)">{header}</header>}
      <div className="relative page-grid mt-48 w-full desktop:mt-24">
        <div className="col-span-full flex flex-col items-start gap-16 tablet:col-span-3 tablet:col-start-4 desktop:col-span-3 desktop:col-start-10">
          <h1 className="max-w-334 text-headline-sm whitespace-pre-line">{headline}</h1>
          <p className="max-w-260 text-body-md">{body}</p>
          <NextLink
            href={link.href}
            className="rounded-4 text-label-lg hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {link.label}
          </NextLink>
        </div>
      </div>
      <div className="relative page-grid mt-auto w-full items-end gap-y-16">
        <NextImage
          src={logo.src}
          alt={logo.alt}
          width={582}
          height={171}
          className="col-span-full h-auto w-272 tablet:w-436 desktop:col-span-9 desktop:w-582"
        />
        {scrollHint && (
          <p
            aria-hidden
            className="hidden text-label-md desktop:col-span-3 desktop:col-start-10 desktop:block"
          >
            {scrollHint}
          </p>
        )}
      </div>
    </section>
  );
}

"use client";

import NextImage from "next/image";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { Button } from "../button/button";

// Figma `Masthead` (Breakpoint): a dismissible brand-moment band above the header (anniversary,
// store-wide news), media on one side, title and body on the other.
// - Desktop (1440): padding 40 · 120, gap 40, media 491 × 277 (radius 8) left of the copy.
// - Tablet (744): the same padding, media above the copy.
// - Mobile (375): padding 40 · 20, media full width × 181.
// Copy gap 16 (Figma 15, off the scale); title headline-medium, body body-large.
// Close: Button Outline Medium with the cancel glyph, top right (Figma: right 93 / 80 on desktop /
// tablet, centred on mobile; code keeps it top right at 16 on every breakpoint).
// Figma issues, replaced with the nearest tokens: the background is a 40%-opacity texture image
// (→ surface-tertiary, "a calm background"); the title and body use colours from another library,
// text/text-primary/text-primary-base #5e315c (→ text-accent) and text-primary-light #d699d9,
// which fails AA on this background (→ text-secondary); the media placeholder is raw #f2e4f1
// (→ surface-skeleton).
// Figma Do: let users dismiss it and remember the choice (`onClose` persists it); keep the body
// to about three lines.

export interface MastheadLabels {
  close: string;
}

export const MASTHEAD_LABELS: MastheadLabels = { close: "Close" };

export const MASTHEAD_DEFAULTS = { headingLevel: 2 } as const;

export interface MastheadProps {
  /** Figma `Title Text`. */
  title: ReactNode;
  /** Figma `Body Text`: about three lines. */
  children?: ReactNode;
  /** The media frame: an image… */
  image?: ImageAsset;
  /** …or any media (e.g. a muted loop video); wins over `image`. */
  media?: ReactNode;
  /** Figma `Show Close Button`: shown when given; called after the masthead hides. */
  onClose?: () => void;
  headingLevel?: 2 | 3;
  labels?: MastheadLabels;
  className?: string;
}

export function Masthead({
  title,
  children,
  image,
  media,
  onClose,
  headingLevel = MASTHEAD_DEFAULTS.headingLevel,
  labels = MASTHEAD_LABELS,
  className,
}: MastheadProps) {
  const id = useId();
  const [closed, setClosed] = useState(false);
  const Heading = `h${headingLevel}` as const;
  if (closed) return null;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        "relative flex flex-col gap-40 bg-surface-tertiary px-20 py-40",
        "tablet:px-120 desktop:flex-row desktop:items-center",
        className,
      )}
    >
      <div className="relative h-181 w-full shrink-0 overflow-hidden rounded-card bg-surface-skeleton tablet:h-277 tablet:w-491">
        {media ??
          (image && (
            <NextImage
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 744px) 491px, 100vw"
              className="object-cover"
            />
          ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-16">
        <Heading id={`${id}-title`} className="text-headline-md text-text-accent">
          {title}
        </Heading>
        {children && <div className="text-body-lg text-text-secondary">{children}</div>}
      </div>
      {onClose && (
        <Button
          variant="outline"
          leftIcon="cancel"
          onClick={() => {
            setClosed(true);
            onClose();
          }}
          className="absolute top-16 right-16"
        >
          {labels.close}
        </Button>
      )}
    </section>
  );
}

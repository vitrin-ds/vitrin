"use client";

import NextLink from "next/link";
import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import { useAutoRotation } from "../hero-banner/use-auto-rotation";

// Figma `Header Top Bar` (30543:358859): a full-width 36px strip above the main header,
// surface-accent-strong, the announcement in label-small text-on-accent, upper case, centred
// (padding 8 · 16 on mobile, 8 · 52 from desktop, capped at the wide breakpoint). From 1024px the
// utility links sit left (gap 20) and right (gap 24) of it; below, the announcement stays alone.
// Breakpoint is responsive CSS.
//
// The announcement is either `children` or `messages` (the promo messages). Figma Do: one message
// under 60 characters, linked to the relevant page; rotate at most 3, slowly. Don't: errors or
// alerts; fast carousels; dismissal that isn't stored (`onDismiss` receives the dismissal so the
// page can persist it). Rotation (more than one message) follows the APG carousel: a Pause / Play
// icon button, held on hover and focus, never started for reduced motion; aria-live="off" while
// rotating.

export interface HeaderTopBarMessage {
  id: string;
  /** Figma `Announcement Text`: one short sentence, under 60 characters. */
  text: string;
  /** Makes the message a link to the relevant page. */
  href?: string;
}

export interface HeaderTopBarLabels {
  region: string;
  pause: string;
  play: string;
  dismiss: string;
}

export const HEADER_TOP_BAR_LABELS: HeaderTopBarLabels = {
  region: "Promotions",
  pause: "Pause",
  play: "Play",
  dismiss: "Dismiss promotions",
};

export const HEADER_TOP_BAR_DEFAULTS = {
  /** "Rotate slowly": 6 seconds per message. */
  autoplayInterval: 6000,
} as const;

export interface HeaderTopBarProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  /** Figma `Announcement Text`; left out when `Show Announcement Label` is off. */
  children?: ReactNode;
  /** The announcement as promo messages: one shows as text or a link, several rotate. */
  messages?: readonly HeaderTopBarMessage[];
  /** ms per message when there are several; `0` turns rotation off. */
  autoplayInterval?: number;
  /** Figma `Left`: HeaderTopBarItem links L1–L3, from 1024px. */
  start?: ReactNode;
  /** Figma `Right`: a HeaderTopBarItem (Language & Region), from 1024px. */
  end?: ReactNode;
  /** Shows a dismiss button; called after the bar hides. Persist the choice here. */
  onDismiss?: () => void;
  labels?: HeaderTopBarLabels;
}

const CONTROL =
  "relative flex shrink-0 cursor-pointer rounded-4 text-label-sm text-text-on-accent before:absolute before:-inset-12";

export function HeaderTopBar({
  children,
  messages,
  autoplayInterval = HEADER_TOP_BAR_DEFAULTS.autoplayInterval,
  start,
  end,
  onDismiss,
  labels = HEADER_TOP_BAR_LABELS,
  className,
  ...props
}: HeaderTopBarProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  const rotation = useAutoRotation(messages?.length ?? 0, autoplayInterval || undefined);

  if (dismissed || messages?.length === 0) return null;

  const controls =
    rotation.canRotate || onDismiss ? (
      <>
        {rotation.canRotate && (
          <button
            type="button"
            aria-label={rotation.playing ? labels.pause : labels.play}
            aria-controls={`${id}-messages`}
            onClick={rotation.togglePlaying}
            className={CONTROL}
          >
            <Icon name={rotation.playing ? "pause" : "play_arrow"} tone="on-accent" />
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            aria-label={labels.dismiss}
            onClick={() => {
              setDismissed(true);
              onDismiss();
            }}
            className={CONTROL}
          >
            <Icon name="close_small" tone="on-accent" />
          </button>
        )}
      </>
    ) : undefined;

  return (
    <section
      {...(messages ? { "aria-label": labels.region, ...rotation.holdHandlers } : {})}
      {...props}
      className={cn("bg-surface-accent-strong text-text-on-accent", className)}
    >
      <div className="mx-auto flex min-h-36 max-w-(--breakpoint-wide) items-center gap-20 px-16 py-8 desktop:px-52">
        {start && (
          <div className="hidden min-w-0 flex-1 items-center gap-20 desktop:flex">{start}</div>
        )}
        <div className="min-w-0 flex-1 text-center text-label-sm uppercase">
          {messages ? (
            <div
              id={`${id}-messages`}
              aria-live={rotation.rotating ? "off" : "polite"}
              className="grid"
            >
              {messages.map((message, i) => (
                <p
                  key={message.id}
                  hidden={i !== rotation.index}
                  data-state={rotation.changed ? "open" : undefined}
                  className="col-start-1 row-start-1 motion-overlay"
                >
                  {message.href ? (
                    <NextLink
                      href={message.href}
                      className="rounded-4 underline-offset-2 hover:underline"
                    >
                      {message.text}
                    </NextLink>
                  ) : (
                    message.text
                  )}
                </p>
              ))}
            </div>
          ) : (
            children
          )}
        </div>
        {(end || controls) && (
          <div
            className={cn(
              "flex items-center justify-end gap-24",
              (start || end) && "desktop:min-w-0 desktop:flex-1",
            )}
          >
            {end && <div className="hidden items-center gap-24 desktop:flex">{end}</div>}
            {controls}
          </div>
        )}
      </div>
    </section>
  );
}

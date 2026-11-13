"use client";

import { cva } from "class-variance-authority";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../button/button";
import { TextInput } from "../text-input/text-input";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

// Figma `NewsletterBand` (Layout): an email signup band (surface-secondary, radius 16) of
// title + body (gap 8) and a one-field form: Text Input Medium ("Your email address") and a
// Button Filled, gap 8.
// - Horizontal (`.Base.NewsletterBand`, desktop): padding 48; text on 5 columns (562), the form
//   fills the rest; title headline-small.
// - Stacked (`.Base.NewsletterBand.Stacked`, tablet/mobile): padding 24, gap 16; title
//   title-large; input and a full-width button stacked.
// - Responsive (code only): Stacked below 1024px, Horizontal from `desktop:`.
// The field has no visible title in Figma, so its label is visually hidden. The address is
// checked on submit: an invalid one shows the TextInput error and takes focus; success shows the
// helper message, announced by a polite live region. A failed `onSubmit` shows an error.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const newsletterBandVariants = cva("flex rounded-surface bg-surface-secondary", {
  variants: {
    layout: {
      horizontal: "items-center gap-120 p-48",
      stacked: "flex-col gap-16 p-24",
      responsive:
        "flex-col gap-16 p-24 desktop:flex-row desktop:items-center desktop:gap-120 desktop:p-48",
    },
  },
});

const TEXT_CLASS = {
  horizontal: "w-562 shrink-0",
  stacked: "",
  responsive: "desktop:w-562 desktop:shrink-0",
} as const;
const TITLE_CLASS = {
  horizontal: "text-headline-sm",
  stacked: "text-title-lg",
  responsive: "text-title-lg desktop:text-headline-sm",
} as const;
const FORM_CLASS = {
  horizontal: "flex-row items-start",
  stacked: "flex-col",
  responsive: "flex-col desktop:flex-row desktop:items-start",
} as const;

const BUTTON_CLASS = {
  horizontal: undefined,
  stacked: "w-full",
  responsive: "w-full desktop:w-auto",
} as const;

export type NewsletterBandLayout = keyof typeof TITLE_CLASS;

export interface NewsletterBandLabels {
  title: string;
  /** Say what and how often, and that they can unsubscribe (Figma Do). */
  body: string;
  emailLabel: string;
  placeholder: string;
  submit: string;
  invalidEmail: string;
  success: string;
  failure: string;
}

export const NEWSLETTER_BAND_LABELS: NewsletterBandLabels = {
  title: "Get the Journal in your inbox",
  body: "One email a week with new guides, expert tips and early access to offers. Unsubscribe any time.",
  emailLabel: "Email address",
  placeholder: "Your email address",
  submit: "Subscribe",
  invalidEmail: "Enter a valid email address, e.g. name@example.com.",
  success: "Thanks! Check your inbox to confirm your subscription.",
  failure: "We couldn't sign you up. Please try again.",
};

export const NEWSLETTER_BAND_DEFAULTS = { layout: "responsive", headingLevel: 2 } as const;

export interface NewsletterBandProps {
  /** Receives the trimmed, valid address. Reject (throw) to show the failure message. */
  onSubmit: (email: string) => void | Promise<void>;
  /** Figma `Layout`, plus Responsive (Stacked below `desktop:`). */
  layout?: NewsletterBandLayout;
  headingLevel?: 2 | 3 | 4;
  labels?: NewsletterBandLabels;
  className?: string;
}

type Status = { kind: "idle" | "pending" | "success" } | { kind: "error"; message: ReactNode };

export function NewsletterBand({
  onSubmit,
  layout = NEWSLETTER_BAND_DEFAULTS.layout,
  headingLevel = NEWSLETTER_BAND_DEFAULTS.headingLevel,
  labels = NEWSLETTER_BAND_LABELS,
  className,
}: NewsletterBandProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const Heading = `h${headingLevel}` as const;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ kind: "error", message: labels.invalidEmail });
      inputRef.current?.focus();
      return;
    }
    setStatus({ kind: "pending" });
    try {
      await onSubmit(value);
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error", message: labels.failure });
      inputRef.current?.focus();
    }
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(newsletterBandVariants({ layout }), className)}
    >
      <div className={cn("flex min-w-0 flex-col gap-8", TEXT_CLASS[layout])}>
        <Heading id={`${id}-title`} className={cn("text-text-primary", TITLE_CLASS[layout])}>
          {labels.title}
        </Heading>
        <p className="text-body-md text-text-secondary">{labels.body}</p>
      </div>
      <form
        noValidate
        aria-labelledby={`${id}-title`}
        onSubmit={submit}
        className={cn("flex min-w-0 flex-1 gap-8", FORM_CLASS[layout])}
      >
        <TextInput
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          label={<VisuallyHidden>{labels.emailLabel}</VisuallyHidden>}
          placeholder={labels.placeholder}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          errorText={status.kind === "error" ? status.message : undefined}
          helperText={status.kind === "success" ? labels.success : undefined}
          className="w-full min-w-0 flex-1"
        />
        <Button type="submit" disabled={status.kind === "pending"} className={BUTTON_CLASS[layout]}>
          {labels.submit}
        </Button>
        <VisuallyHidden role="status">
          {status.kind === "success" ? labels.success : ""}
        </VisuallyHidden>
      </form>
    </section>
  );
}

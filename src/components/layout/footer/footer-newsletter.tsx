"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button/button";
import { TextInput } from "@/components/ui/text-input/text-input";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import { FOOTER_LABELS, type FooterLabels } from "./footer-content";
import { FooterLink } from "./footer-link";

// Figma Footer `Form` column: the footer's own newsletter signup on the accent-strong surface
// (not NewsletterBand, which is a surface-secondary card). Title (title-large), body
// (body-medium), a Text Input Medium + Button Filled Large ("Sign Up", 140 wide) in a row from
// `tablet:` and stacked full width on mobile, gap 12, and the consent line with the Terms of Use
// and Privacy Policy links; gap 20, all text-on-accent. The field has no visible title in
// Figma, so its label is visually hidden. Validation and messages follow NewsletterBand: an
// invalid address shows the TextInput error and takes focus; success is announced politely.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "pending" | "success" | "invalid" | "failure";

/** `{ error }` shows that message under the field (e.g. "already signed up"). */
export type FooterNewsletterResult = void | { error: string };

export interface FooterNewsletterProps {
  /**
   * Receives the trimmed, valid address. Return `{ error }` to show a specific message, or
   * reject (throw) to show the generic failure message.
   */
  onSubmit: (email: string) => FooterNewsletterResult | Promise<FooterNewsletterResult>;
  termsHref: string;
  privacyHref: string;
  labels?: FooterLabels["newsletter"];
}

export function FooterNewsletter({
  onSubmit,
  termsHref,
  privacyHref,
  labels = FOOTER_LABELS.newsletter,
}: FooterNewsletterProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [refusal, setRefusal] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }
    setStatus("pending");
    try {
      const result = await onSubmit(value);
      setRefusal(result ? result.error : null);
      setStatus(result ? "failure" : "success");
      if (result) inputRef.current?.focus();
    } catch {
      setRefusal(null);
      setStatus("failure");
      inputRef.current?.focus();
    }
  };

  const errorText =
    status === "invalid"
      ? labels.invalidEmail
      : status === "failure"
        ? (refusal ?? labels.failure)
        : undefined;

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-20 text-text-on-accent">
      <h2 id={`${id}-title`} className="text-title-lg">
        {labels.title}
      </h2>
      <p className="text-body-md">{labels.body}</p>
      <form
        noValidate
        aria-labelledby={`${id}-title`}
        onSubmit={submit}
        className="flex flex-col gap-12 tablet:flex-row tablet:items-start"
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
            if (status === "invalid" || status === "failure") setStatus("idle");
          }}
          tone="on-accent"
          errorText={errorText}
          helperText={status === "success" ? labels.success : undefined}
          className="w-full min-w-0 flex-1"
        />
        <Button
          type="submit"
          size="lg"
          disabled={status === "pending"}
          className="w-full tablet:w-140"
        >
          {labels.submit}
        </Button>
        <VisuallyHidden role="status">{status === "success" ? labels.success : ""}</VisuallyHidden>
      </form>
      <p className="text-body-md">
        {labels.consentBefore}{" "}
        <FooterLink href={termsHref} size="inline">
          {labels.terms}
        </FooterLink>{" "}
        {labels.consentBetween}{" "}
        <FooterLink href={privacyHref} size="inline">
          {labels.privacy}
        </FooterLink>
        .
      </p>
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Divider } from "@/components/ui/divider/divider";
import { Link } from "@/components/ui/link/link";
import {
  PaymentNetwork,
  paymentNetworkName,
} from "@/components/ui/payment-network/payment-network";
import { Heading, Text } from "@/components/ui/text/text";
import { TextInput } from "@/components/ui/text-input/text-input";
import { CHECKOUT_LABELS as L } from "./checkout-labels";

// Guest checkout (Figma WD.09.03.02, 31385:9085): Express Checkout (the wallets, then "or
// continue below") and Contact (e-mail with its helper, the newsletter opt-in and "Have an
// account? Sign in", which goes to /login and comes back here signed in: `?next=/checkout`).

const WALLETS = ["apple-pay", "google-pay", "paypal"] as const;

/** The wallets aren't connected yet: pressing one tells the shopper through the checkout's notice. */
export function ExpressCheckout({
  onNotice,
}: {
  onNotice: (notice: { tone: "neutral"; text: string }) => void;
}) {
  return (
    <section aria-labelledby="checkout-express" className="flex flex-col gap-12">
      <Text as="h2" id="checkout-express" variant="label-md" tone="secondary">
        {L.express.title}
      </Text>
      <ul className="grid grid-cols-1 gap-12 tablet:grid-cols-3">
        {WALLETS.map((wallet) => (
          <li key={wallet} className="flex">
            <Button
              variant="outline"
              className="w-full"
              aria-label={paymentNetworkName(wallet)}
              onClick={() =>
                onNotice({
                  tone: "neutral",
                  text: L.express.unavailable(paymentNetworkName(wallet)),
                })
              }
            >
              <PaymentNetwork network={wallet} aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-12" aria-hidden>
        <Divider decorative className="flex-1" />
        <Text as="span" variant="body-sm" tone="secondary">
          {L.express.divider}
        </Text>
        <Divider decorative className="flex-1" />
      </div>
    </section>
  );
}

export interface ContactSectionProps {
  emailId: string;
  email: string;
  emailError?: string;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  newsletter: boolean;
  onNewsletterChange: (value: boolean) => void;
  /** /login?next=/checkout */
  signInHref: string;
}

export function ContactSection({
  emailId,
  email,
  emailError,
  onEmailChange,
  onEmailBlur,
  newsletter,
  onNewsletterChange,
  signInHref,
}: ContactSectionProps) {
  return (
    // Named "Contact details": the footer already has a "Contact" region (landmarks are unique).
    <section aria-label={L.contact.region} className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center justify-between gap-12">
        <Heading id="checkout-contact" level={2} variant="headline-lg">
          {L.contact.title}
        </Heading>
        <Link href={signInHref}>{L.contact.haveAccount}</Link>
      </div>
      <TextInput
        id={emailId}
        name="email"
        type="email"
        label={L.contact.email}
        placeholder={L.contact.emailPlaceholder}
        helperText={L.contact.emailHelper}
        errorText={emailError}
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        onBlur={onEmailBlur}
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        required
      />
      <Checkbox
        name="newsletter"
        label={L.contact.newsletter}
        checked={newsletter}
        onChange={(event) => onNewsletterChange(event.target.checked)}
        className="justify-self-start"
      />
    </section>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  AddressForm,
  type AddressFormHandle,
} from "@/components/patterns/forms/address-form/address-form";
import { CardForm, type CardFormHandle } from "@/components/patterns/forms/card-form/card-form";
import type { CouponFieldApplyResult } from "../coupon-field/coupon-field";
import { ShippingMethod } from "./shipping-method/shipping-method";
import { Alert } from "@/components/ui/alert/alert";
import { BottomActionBar } from "@/components/ui/bottom-action-bar/bottom-action-bar";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import { LinkButton } from "@/components/ui/link/link";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { Heading, Text } from "@/components/ui/text/text";
import type { CheckoutAdapter } from "@/lib/commerce/checkout-adapter";
import { CommerceError } from "@/lib/commerce/commerce-error";
import type { Cart } from "@/lib/api/types/cart";
import type { Money } from "@/lib/api/types/catalog";
import type {
  Customer,
  PaymentInput,
  PlaceOrderInput,
  ShippingMethod as ShippingMethodData,
} from "@/lib/api/types/checkout";
import type { SessionErrorCode } from "@/lib/api/types/errors";
import { formatMoney } from "@/lib/format/money";
import { SHOP_LABELS } from "@/lib/shop/shop-messages";
import { CHECKOUT_LABELS as L } from "./checkout-labels";
import { cartTotals, VAT_RATE } from "../cart/cart-totals";
import {
  defaultAddress,
  defaultPaymentMethod,
  emailError,
  paymentTitle,
  toAddressInput,
} from "./checkout-helpers";
import { CheckoutSummary } from "./checkout-summary";
import { ContactSection, ExpressCheckout } from "./guest-details";
import {
  ErrorSummary,
  type FieldError as CheckoutFieldError,
} from "@/components/patterns/error-summary/error-summary";
import {
  AddressSheet,
  NEW_CARD,
  PaymentSheet,
  SavedAddressCard,
  SavedPaymentCard,
} from "./saved-details";
import { ThreeDSecureDialog } from "./three-d-secure-dialog";
import { isoToDate, useToday } from "@/lib/use-today";

// 09.03 Checkout (Figma WD 31321:6972 signed in · 31385:9085 guest · 31394:12517 payment
// declined · 31395:13539 3D Secure · 31396:14427 / 31396:14952 change sheets; WT / WM
// alike). One page, one form, one Pay button (in the Order Summary aside, and in the Bottom
// Action Bar below 1024px; both submit the form by id). Signed in: the saved address and
// payment method as cards, changed in sheets. Guest: express wallets, contact e-mail, the
// Address Form, the Card Form and "billing same as delivery". Pay validates every section and
// shows one error summary that takes focus; a declined card shows the Alert in Payment (focus
// moves to it) and asks for the security code again; 3D Secure opens the bank dialog. The cart,
// customer and delivery options arrive from the server (`initial`), so the form is in the
// request's HTML; the prerendered shell shows CheckoutLoading instead.

const FORM_ID = "checkout-form";

/** A refused adapter call's code; anything else is "unavailable". */
function errorCode(error: unknown): SessionErrorCode {
  return error instanceof CommerceError ? error.code : "unavailable";
}
const SUMMARY_ID = "checkout-errors";
const DECLINED_ID = "checkout-declined";

type Sheet = "address" | "payment" | null;
interface Challenge {
  paymentId: string;
  amount: Money;
}

/** What the server read for this request (CheckoutPage). */
export interface CheckoutSession {
  cart: Cart;
  customer: Customer | null;
  methods: ShippingMethodData[];
}

export interface CheckoutNotice {
  tone: "error" | "neutral";
  text: string;
}

export interface CheckoutProps {
  /** What the server read for this request: the cart, the customer and the delivery options. */
  initial: CheckoutSession;
  /** The cart as it is now (it follows coupon changes); null while it loads. */
  cart: CheckoutSession["cart"] | null;
  adapter: CheckoutAdapter;
  /** The order went through: e.g. go to the confirmation page. */
  onPlaced: (orderId: string) => void;
  /** A message that belongs in a Toast (a failed call, a feature the store doesn't offer). */
  onNotice: (notice: CheckoutNotice) => void;
  onApplyCoupon: (code: string) => CouponFieldApplyResult | Promise<CouponFieldApplyResult>;
  onRemoveCoupon: (code: string) => void;
  /** The empty cart's Start shopping. */
  shopHref?: string;
  /** The summary's Edit cart. */
  cartHref?: string;
  /** The guest's Sign in link; come back to the checkout afterwards. */
  signInHref?: string;
}

export const CHECKOUT_DEFAULTS = {
  shopHref: "/",
  cartHref: "/cart",
  signInHref: "/login?next=%2Fcheckout",
} as const;

export function Checkout({
  initial,
  cart,
  adapter,
  onPlaced,
  onNotice,
  onApplyCoupon,
  onRemoveCoupon,
  shopHref = CHECKOUT_DEFAULTS.shopHref,
  cartHref = CHECKOUT_DEFAULTS.cartHref,
  signInHref = CHECKOUT_DEFAULTS.signInHref,
}: CheckoutProps) {
  const emailId = useId();

  const [customer, setCustomer] = useState<Customer | null | undefined>(initial.customer);
  const [methods, setMethods] = useState<ShippingMethodData[]>(initial.methods);
  /** The subtotal the delivery options were priced for. */
  const pricedFor = useRef<number | undefined>(initial.cart.subtotal.amount);
  const [shippingMethodId, setShippingMethodId] = useState("standard");
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string>();
  const [newsletter, setNewsletter] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  // The shopper's choice; until they choose, the saved defaults.
  const [chosenAddressId, setAddressId] = useState<string>();
  const [chosenPaymentId, setPaymentId] = useState<string>();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const [errors, setErrors] = useState<CheckoutFieldError[]>([]);
  const [declined, setDeclined] = useState<string>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const focusTarget = useRef<string | null>(null);

  const shippingRef = useRef<AddressFormHandle>(null);
  const billingRef = useRef<AddressFormHandle>(null);
  const cardRef = useRef<CardFormHandle>(null);

  // A new server read (the page shown again after signing in, a refresh after another tab's
  // change): the page may have stayed mounted in between, so its state follows the new read.
  const [readFor, setReadFor] = useState(initial);
  if (readFor !== initial) {
    setReadFor(initial);
    if (initial.customer?.id !== readFor.customer?.id) {
      setAddressId(undefined);
      setPaymentId(undefined);
      setDeclined(undefined);
    }
    setCustomer(initial.customer);
    setMethods(initial.methods);
    setPlaced(false);
  }
  useEffect(() => {
    pricedFor.current = initial.cart.subtotal.amount;
  }, [initial]);

  // The customer and the delivery options (priced for this cart) come from the session: from the
  // server's read first, then again whenever the subtotal changes.
  const subtotal = cart?.subtotal.amount;
  useEffect(() => {
    if (subtotal !== undefined && subtotal === pricedFor.current) return;
    let active = true;
    void Promise.all([adapter.getCustomer(), adapter.getShippingMethods()]).then(
      ([who, options]) => {
        if (!active) return;
        pricedFor.current = subtotal;
        setCustomer(who);
        setMethods(options);
      },
    );
    return () => {
      active = false;
    };
  }, [adapter, subtotal]);

  // Moves focus after the render that shows the error summary or the declined Alert.
  useEffect(() => {
    if (!focusTarget.current) return;
    const target = document.getElementById(focusTarget.current);
    focusTarget.current = null;
    target?.focus();
    target?.scrollIntoView({ block: "center" });
  });

  // Card expiry is checked against the browser's date (useToday), never read while rendering.
  const today = useToday();
  const expiryDate = today ? isoToDate(today) : null;
  const method = methods.find((option) => option.id === shippingMethodId);
  const totals = cart ? cartTotals(cart, method?.price ?? null, VAT_RATE) : null;
  const totalText = totals ? formatMoney(totals.total) : "";
  const addressId = chosenAddressId ?? (customer ? defaultAddress(customer)?.id : undefined);
  const paymentId =
    chosenPaymentId ??
    (customer ? (defaultPaymentMethod(customer, expiryDate)?.id ?? NEW_CARD) : undefined);
  const address = customer?.addresses.find((item) => item.id === addressId);
  const savedPayment = customer?.paymentMethods.find((item) => item.id === paymentId);
  const paysByCard = !customer || paymentId === NEW_CARD || !savedPayment;
  const payLabel = declined ? L.tryAgain(totalText) : L.pay(totalText);

  function openSheet(next: Sheet) {
    setSheetKey((key) => key + 1);
    setSheet(next);
  }

  async function signOut() {
    await adapter.signOut();
    setCustomer(null);
    setAddressId(undefined);
    setPaymentId(undefined);
    setDeclined(undefined);
    setAnnouncement(L.announce.signedOut);
  }

  function changeShipping(id: string) {
    setShippingMethodId(id);
    const next = methods.find((option) => option.id === id);
    if (cart && next) {
      setAnnouncement(L.announce.total(formatMoney(cartTotals(cart, next.price).total)));
    }
  }

  /** Every section's input, or the errors for the summary. */
  function collect(): { input: PlaceOrderInput } | { errors: CheckoutFieldError[] } {
    const found: CheckoutFieldError[] = [];
    let input: Partial<PlaceOrderInput> = { shippingMethodId };

    if (customer) {
      input.email = customer.email;
      if (address) input.shippingAddress = toAddressInput(address);
    } else {
      const message = emailError(email);
      setEmailMessage(message);
      if (message) found.push({ id: emailId, label: L.contact.email, message });
      input.email = email.trim();
      const shipping = shippingRef.current?.validate();
      if (shipping?.ok) input.shippingAddress = toAddressInput(shipping.values);
      else if (shipping) found.push(...shipping.errors);
    }

    let payment: PaymentInput | undefined;
    if (paysByCard) {
      const card = cardRef.current?.validate();
      if (card?.ok) {
        const { number, holderName, expiryMonth, expiryYear, cvc } = card.card;
        payment = { type: "card", number, holderName, expiryMonth, expiryYear, cvc };
      } else if (card) found.push(...card.errors);
    } else if (savedPayment) {
      payment = { type: "saved", paymentMethodId: savedPayment.id };
    }

    if (!customer && !billingSame) {
      const billing = billingRef.current?.validate();
      if (billing?.ok) input = { ...input, billingAddress: toAddressInput(billing.values) };
      else if (billing) found.push(...billing.errors);
    }

    if (found.length > 0 || !payment || !input.shippingAddress || !input.email) {
      return { errors: found };
    }
    return { input: { ...(input as PlaceOrderInput), payment } };
  }

  function showPaymentError(code: SessionErrorCode) {
    setDeclined(SHOP_LABELS.error(code));
    cardRef.current?.clearSecurityCode();
    focusTarget.current = DECLINED_ID;
  }

  function finish(orderId: string) {
    setPlaced(true);
    onPlaced(orderId);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const collected = collect();
    if ("errors" in collected) {
      setErrors(collected.errors);
      if (collected.errors.length > 0) focusTarget.current = SUMMARY_ID;
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      const outcome = await adapter.placeOrder(collected.input);
      setBusy(false);
      if (outcome.status === "placed") return finish(outcome.order.id);
      setChallenge({ paymentId: outcome.paymentId, amount: outcome.amount });
    } catch (error) {
      setBusy(false);
      const code = errorCode(error);
      if (code === "payment-declined" || code === "invalid-payment") showPaymentError(code);
      else onNotice({ tone: "error", text: SHOP_LABELS.error(code) });
    }
  }

  async function answerChallenge(approve: boolean, cancelled = false) {
    if (!challenge) return;
    setBusy(true);
    try {
      const order = await adapter.confirmThreeDSecure(challenge.paymentId, approve);
      setBusy(false);
      setChallenge(null);
      finish(order.id);
    } catch (error) {
      setBusy(false);
      setChallenge(null);
      if (!cancelled) showPaymentError(errorCode(error));
    }
  }

  // The empty cart fills the viewport like the loading frame (CheckoutLoading), so nothing shifts.
  if (cart === null || customer === undefined || placed) {
    return <CheckoutLoading placed={placed} />;
  }

  if (cart.lines.length === 0 || !totals) {
    return (
      <div className="page-grid min-h-svh content-start py-40">
        <h1 className="sr-only">{L.title}</h1>
        <EmptyState
          className="col-span-full"
          icon="local_mall"
          title={L.emptyTitle}
          body={L.emptyBody}
          primaryAction={{ label: L.startShopping, href: shopHref }}
        />
      </div>
    );
  }

  const payButton = (size: "lg" | "md") => (
    <Button type="submit" form={FORM_ID} size={size} className="w-full" disabled={busy}>
      {busy ? L.placing : payLabel}
    </Button>
  );

  return (
    <div className="page-grid gap-y-40 pt-24 pb-60 desktop:pt-32">
      <h1 className="sr-only">{L.title}</h1>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <form
        id={FORM_ID}
        noValidate
        onSubmit={submit}
        className="col-span-full flex flex-col gap-40 desktop:col-span-8"
      >
        {errors.length > 0 && (
          <ErrorSummary id={SUMMARY_ID} title={L.errorSummaryTitle} errors={errors} />
        )}

        {customer ? (
          <Text variant="body-md">
            {L.signedInAs(`${customer.firstName} ${customer.lastName}`, customer.email)} ·{" "}
            <LinkButton size="inline" onClick={() => void signOut()}>
              {L.notYou}
            </LinkButton>
          </Text>
        ) : (
          <>
            <ExpressCheckout onNotice={onNotice} />
            <ContactSection
              emailId={emailId}
              email={email}
              emailError={emailMessage}
              onEmailChange={(value) => {
                setEmail(value);
                if (emailMessage) setEmailMessage(emailError(value));
              }}
              onEmailBlur={() => email.trim() && setEmailMessage(emailError(email))}
              newsletter={newsletter}
              onNewsletterChange={setNewsletter}
              signInHref={signInHref}
            />
          </>
        )}

        <section aria-labelledby="checkout-address" className="flex flex-col gap-12">
          <SectionTitle
            id="checkout-address"
            title={L.address.title}
            action={
              customer
                ? {
                    label: L.address.change,
                    name: L.address.changeFor,
                    onClick: () => openSheet("address"),
                  }
                : undefined
            }
          />
          {customer ? (
            address && <SavedAddressCard address={address} />
          ) : (
            <AddressForm as="fields" ref={shippingRef} id="shipping" offerBilling={false} />
          )}
        </section>

        <section aria-labelledby="checkout-delivery" className="flex flex-col gap-12">
          <SectionTitle id="checkout-delivery" title={L.delivery.title} />
          <ShippingMethod
            options={methods.map((option) => ({
              id: option.id,
              name: option.name,
              price: option.price,
              description: option.description,
            }))}
            value={shippingMethodId}
            onValueChange={changeShipping}
          />
        </section>

        <section aria-labelledby="checkout-payment" className="flex flex-col gap-12">
          <SectionTitle
            id="checkout-payment"
            title={L.payment.title}
            action={
              customer
                ? {
                    label: L.payment.change,
                    name: L.payment.changeFor,
                    onClick: () => openSheet("payment"),
                  }
                : undefined
            }
          />
          {declined && (
            <Alert
              id={DECLINED_ID}
              tabIndex={-1}
              usage="negative"
              width="card"
              title={L.payment.declinedTitle}
            >
              {declined}
            </Alert>
          )}
          {paysByCard ? (
            <CardForm ref={cardRef} id="card" />
          ) : (
            savedPayment && <SavedPaymentCard method={savedPayment} />
          )}
          {customer ? (
            address && <Text variant="body-md">{L.billingLine(address.label)}</Text>
          ) : (
            <>
              <Checkbox
                name="billingSame"
                label={L.payment.billingSame}
                checked={billingSame}
                onChange={(event) => setBillingSame(event.target.checked)}
                className="justify-self-start"
              />
              {!billingSame && (
                <AddressForm
                  as="fields"
                  ref={billingRef}
                  id="billing"
                  section="billing"
                  title={L.payment.billingTitle}
                  headingLevel={3}
                />
              )}
            </>
          )}
          <Button
            variant="outline"
            leftIcon="redeem"
            className="w-full"
            onClick={() => onNotice({ tone: "neutral", text: L.payment.giftCardUnavailable })}
          >
            {L.payment.giftCard}
          </Button>
          {!customer && (
            <Text variant="body-sm" tone="secondary">
              {L.payment.guestNote}
            </Text>
          )}
        </section>
      </form>

      <aside
        aria-label={L.summaryTotal}
        className="col-span-full desktop:col-span-4 desktop:col-start-9 desktop:row-start-1"
      >
        <CheckoutSummary
          className="desktop:sticky desktop:top-24"
          cart={cart}
          totals={totals}
          action={payButton("lg")}
          cartHref={cartHref}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      </aside>

      <BottomActionBar
        className="desktop:hidden"
        label={L.summaryTotal}
        price={totals.total}
        primaryAction={payButton("md")}
      />

      {customer && sheet === "address" && addressId && (
        <AddressSheet
          key={`address-${sheetKey}`}
          open
          addresses={customer.addresses}
          value={addressId}
          onClose={() => setSheet(null)}
          onConfirm={(id) => {
            setAddressId(id);
            setSheet(null);
            const label = customer.addresses.find((item) => item.id === id)?.label ?? "";
            setAnnouncement(L.announce.addressChanged(label));
          }}
        />
      )}
      {customer && sheet === "payment" && (
        <PaymentSheet
          key={`payment-${sheetKey}`}
          open
          methods={customer.paymentMethods}
          value={paymentId ?? NEW_CARD}
          onClose={() => setSheet(null)}
          onConfirm={(id) => {
            setPaymentId(id);
            setDeclined(undefined);
            setSheet(null);
            const chosen = customer.paymentMethods.find((item) => item.id === id);
            setAnnouncement(
              L.announce.paymentChanged(chosen ? paymentTitle(chosen) : L.payment.newCardTitle),
            );
          }}
        />
      )}

      <ThreeDSecureDialog
        open={challenge !== null}
        amount={challenge?.amount ?? null}
        busy={busy}
        onApprove={() => void answerChallenge(true)}
        onFail={() => void answerChallenge(false)}
        onCancel={() => void answerChallenge(false, true)}
      />
    </div>
  );
}

/**
 * The loading frame: the prerendered shell's, and the page's after Pay while it moves on to the
 * confirmation. It fills the viewport, so the footer stays below the fold whichever state the
 * session resolves to (a filled cart is taller than the viewport anyway, so nothing shifts),
 * and follows the form's columns: the page's h1, the details column and, from desktop, the
 * summary column, with the sections as blocks. Nothing in it is interactive, so nothing is lost
 * when the form arrives.
 */
export function CheckoutLoading({ placed = false }: { placed?: boolean }) {
  return (
    <div
      className="page-grid min-h-svh content-start gap-y-40 pt-24 pb-60 desktop:pt-32"
      aria-busy="true"
    >
      {/* Not once placed: the page stays mounted (hidden) after moving on to the confirmation,
          whose h1 is then the page's only one. */}
      {!placed && <h1 className="sr-only">{L.title}</h1>}
      <p className="sr-only">{placed ? L.placing : L.loading}</p>
      <div className="col-span-full flex flex-col gap-40 desktop:col-span-8">
        <div className="h-180">
          <Skeleton shape="block" />
        </div>
        <div className="h-180">
          <Skeleton shape="block" />
        </div>
        <div className="h-240">
          <Skeleton shape="block" />
        </div>
      </div>
      <div className="hidden h-320 desktop:col-span-4 desktop:col-start-9 desktop:block">
        <Skeleton shape="block" />
      </div>
    </div>
  );
}

function SectionTitle({
  id,
  title,
  action,
}: {
  id: string;
  title: string;
  action?: { label: string; name: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between gap-12">
      <Heading id={id} level={2} variant="headline-lg">
        {title}
      </Heading>
      {action && (
        <LinkButton aria-label={action.name} onClick={action.onClick}>
          {action.label}
        </LinkButton>
      )}
    </div>
  );
}

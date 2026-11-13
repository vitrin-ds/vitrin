import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardPaymentMethodExtended } from "./card-payment-method-extended";
import { CardPaymentMethodMinimal } from "./card-payment-method-minimal";

describe("CardPaymentMethodExtended", () => {
  it("is a titled section with the network, masked number and actions", async () => {
    const onPrimary = vi.fn();
    const onMore = vi.fn();
    const { container } = render(
      <CardPaymentMethodExtended
        network="visa"
        title="Visa ending in 5012"
        label="Default"
        last4="5012"
        holderDetail="Jane Doe"
        additionalDetails="Expires 01/30"
        primaryAction={{ label: "Set as default", onClick: onPrimary }}
        secondaryAction={{ label: "Remove", onClick: () => undefined }}
        onMore={onMore}
      />,
    );
    expect(screen.getByRole("region", { name: "Visa ending in 5012" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Visa" })).toBeInTheDocument();
    expect(container).toHaveTextContent("**** **** **** 5012");
    expect(screen.getByText("Card ending in 5012")).toHaveClass("sr-only");
    expect(screen.getByText("Default")).toHaveClass("bg-(--th-indicator-info-soft-bg)");
    await userEvent.click(screen.getByRole("button", { name: "Set as default" }));
    await userEvent.click(
      screen.getByRole("button", { name: "More actions for Visa ending in 5012" }),
    );
    expect(onPrimary).toHaveBeenCalled();
    expect(onMore).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("marks Warning and Expired with the border and details colour; Expired uses an Error label", () => {
    const { container, rerender } = render(
      <CardPaymentMethodExtended
        network="visa"
        title="Visa"
        label="Default"
        additionalDetails="Expires soon"
        state="warning"
      />,
    );
    expect(container.firstElementChild).toHaveClass("after:border-border-warning");
    expect(screen.getByText("Expires soon")).toHaveClass("text-text-assistive");
    rerender(
      <CardPaymentMethodExtended
        network="visa"
        title="Visa"
        label="Default"
        last4="1881"
        holderDetail="Jane Doe"
        additionalDetails="Expired"
        state="expired"
        type="card"
      />,
    );
    expect(container.firstElementChild).toHaveClass("rounded-card", "after:border-border-error");
    // The label carries the state; number and holder stay readable (text-secondary).
    expect(screen.getByText("Jane Doe")).toHaveClass("text-text-secondary");
    expect(screen.getByText("Expired")).toHaveClass("text-text-error");
    expect(screen.getByText("Default")).toHaveClass("bg-(--th-indicator-error-soft-bg)");
  });

  it("disables its controls when disabled", () => {
    render(
      <CardPaymentMethodExtended
        network="mastercard"
        title="Mastercard"
        disabled
        onMore={() => undefined}
        primaryAction={{ label: "Use", onClick: () => undefined }}
      />,
    );
    expect(screen.getByRole("button", { name: "Use" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /More actions/ })).toBeDisabled();
  });
});

describe("CardPaymentMethodMinimal", () => {
  it("shows the masked number and expiry, with named Edit and Delete", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <CardPaymentMethodMinimal
        network="visa"
        last4="5012"
        expiry="01/30"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    expect(container).toHaveTextContent("Expires:01/30");
    await userEvent.click(screen.getByRole("button", { name: "Edit Visa ending in 5012" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Visa ending in 5012" }));
    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Make default/ })).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(container.firstChild).toHaveClass("rounded-card", "hover:bg-interactive-subtle-hover");
    await expectNoAxeViolations(container);
  });

  it("is greyed out and has no hover when disabled", () => {
    const { container } = render(
      <CardPaymentMethodMinimal network="visa" last4="5012" expiry="01/30" disabled />,
    );
    expect(container.firstChild).toHaveClass("bg-surface-disabled");
    expect(container.firstChild).not.toHaveClass("hover:bg-interactive-subtle-hover");
    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });
});

describe("CardPaymentMethodExtended focus", () => {
  it("draws Figma's Focus stroke outside the card when its radio has keyboard focus", () => {
    const { container } = render(
      <CardPaymentMethodExtended
        type="card"
        network="visa"
        title="Visa ending in 5012"
        last4="5012"
      />,
    );
    expect(container.firstChild).toHaveClass(
      "has-[[role=radio]:focus-visible]:outline",
      "has-[[role=radio]:focus-visible]:outline-interactive-focus-ring",
    );
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CouponField, normalizeCouponCode, type CouponFieldApplyResult } from "./coupon-field";
import { validateMockCoupon } from "./coupon-field.fixtures";

function Harness({
  initial = [] as string[],
  onApply = validateMockCoupon as (
    code: string,
  ) => CouponFieldApplyResult | Promise<CouponFieldApplyResult>,
  allowMultiple = false,
}) {
  const [applied, setApplied] = useState(initial);
  return (
    <CouponField
      applied={applied}
      allowMultiple={allowMultiple}
      onApply={async (code) => {
        const result = await onApply(code);
        if (result.ok) setApplied((current) => [...current, code]);
        return result;
      }}
      onRemove={(code) => setApplied((current) => current.filter((c) => c !== code))}
    />
  );
}

describe("normalizeCouponCode", () => {
  it("trims and upper-cases", () => {
    expect(normalizeCouponCode("  welcome10 ")).toBe("WELCOME10");
  });
});

describe("CouponField", () => {
  it("starts collapsed and opens the entry as a disclosure, focusing the field", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const trigger = screen.getByRole("button", { name: /Discount or promo code/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("textbox")).toBeNull();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const field = screen.getByRole("textbox", { name: "Discount or promo code" });
    await waitFor(() => expect(field).toHaveFocus());
    // Apply is the field's trailing action: inside the input box, next in the tab order.
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(field.parentElement).toContainElement(apply);
    await user.tab();
    expect(apply).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("explains errors on the field and keeps the typed code", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Discount or promo code/ }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    const field = screen.getByRole("textbox", { name: "Discount or promo code" });
    expect(field).toHaveAccessibleDescription("Enter a code to apply it.");
    await user.type(field, "oldcode{Enter}");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("This code is invalid or has expired.");
    expect(field).toHaveValue("oldcode");
    expect(field).toHaveFocus();
  });

  it("applies a code: removable chip, announcement, focus on the applied list", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Discount or promo code/ }));
    await user.type(screen.getByRole("textbox"), " welcome10 {Enter}");
    const list = await screen.findByRole("list", { name: "Applied codes" });
    expect(list).toHaveTextContent("WELCOME10");
    await waitFor(() => expect(list).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent("WELCOME10 applied.");
    // One code at a time: the entry goes away.
    expect(screen.queryByRole("button", { name: /Discount or promo code/ })).toBeNull();
    await expectNoAxeViolations(container);

    await user.click(screen.getByRole("button", { name: "Remove WELCOME10" }));
    expect(screen.queryByRole("list", { name: "Applied codes" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("WELCOME10 removed.");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Discount or promo code/ })).toHaveFocus(),
    );
  });

  it("shows the pending state and ignores repeat submits while applying", async () => {
    let resolve: (result: CouponFieldApplyResult) => void = () => undefined;
    const onApply = vi.fn(
      () =>
        new Promise<CouponFieldApplyResult>((done) => {
          resolve = done;
        }),
    );
    const user = userEvent.setup();
    render(<Harness onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: /Discount or promo code/ }));
    await user.type(screen.getByRole("textbox"), "SPRING{Enter}");
    const button = screen.getByRole("button", { name: "Applying…" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);
    expect(onApply).toHaveBeenCalledTimes(1);
    resolve({ ok: true });
    expect(await screen.findByRole("list", { name: "Applied codes" })).toHaveTextContent("SPRING");
  });

  it("allows stacking only when asked and refuses duplicates", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["WELCOME10"]} allowMultiple />);
    await user.click(screen.getByRole("button", { name: /Discount or promo code/ }));
    await user.type(screen.getByRole("textbox"), "welcome10{Enter}");
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "WELCOME10 is already applied.",
    );
  });
});

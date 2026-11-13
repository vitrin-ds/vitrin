import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardAddress } from "@/components/ui/card-address/card-address";
import { CardPaymentMethodExtended } from "@/components/ui/card-payment-method/card-payment-method-extended";
import { RadioCardGroup } from "./radio-card";

const LINES = ["Lindenstraße 12", "10969 Berlin, Germany"];

function Addresses({ initial, onEdit }: { initial?: string; onEdit?: () => void }) {
  const [value, setValue] = useState(initial);
  return (
    <RadioCardGroup label="Shipping address" value={value} onValueChange={setValue}>
      <CardAddress value="home" title="Home" name="Jane Doe" lines={LINES} onEdit={onEdit} />
      <CardAddress value="old" title="Old" name="Jane Doe" lines={LINES} disabled />
      <CardAddress value="office" title="Office" name="Jane Doe" lines={LINES} />
    </RadioCardGroup>
  );
}

describe("RadioCardGroup", () => {
  it("is a named radio group of cards named by their titles", async () => {
    const { container } = render(<Addresses initial="office" />);
    expect(screen.getByRole("radiogroup", { name: "Shipping address" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Office" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Old" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("region", { name: "Office" })).toHaveClass(
      "after:border-2",
      "after:border-border-accent",
    );
    await expectNoAxeViolations(container);
  });

  it("makes the checked card the only tab stop, or the first enabled one", () => {
    const { unmount } = render(<Addresses initial="office" />);
    expect(screen.getByRole("radio", { name: "Office" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute("tabindex", "-1");
    unmount();
    render(<Addresses />);
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Office" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects on click and moves with the arrow keys, skipping disabled cards", async () => {
    render(<Addresses />);
    await userEvent.click(screen.getByRole("radio", { name: "Home" }));
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowDown}");
    const office = screen.getByRole("radio", { name: "Office" });
    expect(office).toHaveFocus();
    expect(office).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Home" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(office).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "Old" }));
    expect(office).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the card's own actions clickable without selecting", async () => {
    const onEdit = vi.fn();
    render(<Addresses onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Home" }));
    expect(onEdit).toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute("aria-checked", "false");
  });

  it("names a payment card radio by its card", () => {
    render(
      <RadioCardGroup label="Payment" value="v" onValueChange={() => undefined}>
        <CardPaymentMethodExtended
          value="v"
          network="visa"
          title="Visa ending in 5012"
          last4="5012"
        />
      </RadioCardGroup>,
    );
    expect(screen.getByRole("radio", { name: "Visa ending in 5012" })).toBeChecked();
  });

  it("renders no radio outside a group", () => {
    render(<CardAddress value="home" title="Home" name="Jane Doe" lines={LINES} />);
    expect(screen.queryByRole("radio")).toBeNull();
  });
});

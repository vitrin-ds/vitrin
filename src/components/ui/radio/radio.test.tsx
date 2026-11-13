import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Radio, RadioGroup } from "./radio";

function Delivery(props: { errorText?: string }) {
  return (
    <RadioGroup legend="Delivery speed" {...props}>
      <Radio name="speed" value="standard" label="Standard" defaultChecked />
      <Radio name="speed" value="express" label="Express" />
      <Radio name="speed" value="pickup" label="Store pickup" disabled />
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("groups native radios under a legend", async () => {
    const { container } = render(<Delivery />);
    expect(screen.getByRole("group", { name: "Delivery speed" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
    await expectNoAxeViolations(container);
  });

  it("selects one option at a time", async () => {
    render(<Delivery />);
    await userEvent.click(screen.getByText("Express"));
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
  });

  it("skips disabled options", async () => {
    render(<Delivery />);
    await userEvent.click(screen.getByText("Store pickup"));
    expect(screen.getByRole("radio", { name: "Store pickup" })).not.toBeChecked();
  });

  it("describes the group with its error and marks options invalid", async () => {
    const { container } = render(
      <RadioGroup legend="Size" errorText="Choose a size">
        <Radio name="size" value="s" label="S" error />
        <Radio name="size" value="m" label="M" error />
      </RadioGroup>,
    );
    expect(screen.getByRole("group", { name: "Size" })).toHaveAccessibleDescription(
      "Choose a size",
    );
    expect(screen.getByRole("radio", { name: "S" })).toHaveAttribute("aria-invalid", "true");
    await expectNoAxeViolations(container);
  });

  it("uses interactive-hover on hover and no label underline", () => {
    const { container } = render(<Radio name="h" label="Hover me" />);
    expect(container.querySelector("label > span")).toHaveClass(
      "peer-enabled:group-hover:text-interactive-hover",
    );
    expect(screen.getByText("Hover me").className).not.toMatch(/underline/);
  });

  it("draws the Figma radio glyphs", () => {
    const { container } = render(<Radio name="x" label="One" />);
    const names = [...container.querySelectorAll("[data-icon]")].map((el) =>
      el.getAttribute("data-icon"),
    );
    expect(names).toEqual(["radio_button_unchecked", "radio_button_checked"]);
  });
});

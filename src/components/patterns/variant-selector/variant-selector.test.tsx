import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { VariantSelector, type VariantSelectorOption } from "./variant-selector";

const SIZES: VariantSelectorOption[] = [
  { value: "30", label: "30 ml", description: "€63 / 100 ml" },
  { value: "50", label: "50 ml", description: "€54 / 100 ml" },
  { value: "100", label: "100 ml", unavailable: true },
];

describe("VariantSelector", () => {
  it("is a named radio group showing the selection, with the unit price", async () => {
    const { container } = render(
      <VariantSelector label="Size" options={SIZES} value="50" onValueChange={() => undefined} />,
    );
    const group = screen.getByRole("radiogroup", { name: "Size" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^50 ml/ })).toBeChecked();
    expect(screen.getByText("€54 / 100 ml")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps an unavailable option visible but disabled, with a visible reason", () => {
    render(
      <VariantSelector label="Size" options={SIZES} value="30" onValueChange={() => undefined} />,
    );
    const radio = screen.getByRole("radio", { name: /^100 ml,\s?Out of stock$/ });
    expect(radio).toBeDisabled();
    expect(radio.closest("label")).toHaveTextContent("Out of stock");
  });

  it("selects with a click and with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(
      <VariantSelector label="Size" options={SIZES} value="30" onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByText("50 ml"));
    expect(onValueChange).toHaveBeenLastCalledWith("50");
    screen.getByRole("radio", { name: /^30 ml/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith("50");
  });

  it("draws swatches when every option has one and lists the unavailable ones", async () => {
    const swatch = { src: "/s.webp", alt: "", width: 40, height: 56 };
    const { container } = render(
      <VariantSelector
        label="Shade"
        options={[
          { value: "a", label: "Rosewood", swatch },
          { value: "b", label: "Cocoa", swatch, unavailable: true },
        ]}
        value="a"
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Out of stock: Cocoa");
    // Selected: taller, with the 2px accent ring every selected card has, drawn on a
    // layer above the swatch image so the image doesn't hide it.
    const tile = (name: string | RegExp) => {
      const label = screen.getByRole("radio", { name }).closest("label")!;
      const image = label.querySelector("img")!;
      const ring = label.querySelector<HTMLElement>(".inset-ring-2")!;
      expect(image.compareDocumentPosition(ring) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      return { label, ring };
    };
    const selected = tile("Rosewood");
    expect(selected.label).toHaveClass("h-80");
    // 40px tile, 44px hit area (::before 2px wider each side); the clip is on an inner layer so
    // it doesn't cut the hit area.
    expect(selected.label).toHaveClass("w-40", "before:-inset-x-2");
    expect(selected.label).not.toHaveClass("overflow-hidden");
    expect(selected.ring).toHaveClass("inset-ring-2", "inset-ring-border-accent");
    const other = tile(/^Cocoa/);
    expect(other.label).toHaveClass("h-56");
    expect(other.ring).toHaveClass("inset-ring-2", "inset-ring-border-neutral");
    await expectNoAxeViolations(container);
  });
});

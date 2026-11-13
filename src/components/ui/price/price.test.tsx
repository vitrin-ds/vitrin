import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Price } from "./price";
import { tokenContrast } from "@/test/token-contrast";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });

describe("Price", () => {
  it("shows the formatted price, title-small by default", async () => {
    const { container } = render(<Price price={eur(7000)} />);
    expect(screen.getByText("€70")).toHaveClass("text-title-sm", "text-text-primary");
    expect(container.querySelector("s")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("strikes the original price through and names both for screen readers", async () => {
    const { container } = render(<Price price={eur(5600)} compareAt={eur(7000)} locale="de" />);
    const original = container.querySelector("s")!;
    expect(original).toHaveTextContent("Original price: 70 €");
    expect(original).toHaveClass("text-body-sm", "text-price-strike");
    expect(container).toHaveTextContent("Current price: 56 €");
    await expectNoAxeViolations(container);
  });

  it("hides an original price that is not higher (Figma Don't)", () => {
    const { container } = render(<Price price={eur(7000)} compareAt={eur(7000)} />);
    expect(container.querySelector("s")).toBeNull();
  });

  it("has the lg size, a column layout and a disabled state", () => {
    const { container } = render(
      <Price price={eur(1)} compareAt={eur(2)} size="lg" layout="column" disabled />,
    );
    expect(container.firstElementChild).toHaveClass("flex-col", "items-end");
    expect(screen.getByText("€0.01")).toHaveClass("text-title-lg", "text-text-disabled");
    expect(container.querySelector("s")).toHaveClass("text-text-disabled");
  });

  it("has the xl size of the product page: headline-large over body-large, gap 8", () => {
    const { container } = render(<Price price={eur(26700)} compareAt={eur(45000)} size="xl" />);
    expect(container.firstElementChild).toHaveClass("gap-8");
    expect(screen.getByText("€267")).toHaveClass("text-headline-lg");
    expect(container.querySelector("s")).toHaveClass("text-body-lg", "text-price-strike");
  });
});

describe("Price contrast", () => {
  // The struck-through price is text: it needs 4.5:1 on every surface a price sits on
  // (cards: surface-primary / Brand surface-secondary; sheets and popovers: surface-raised).
  it.each(["light", "dark"] as const)("price-strike passes AA in %s", (theme) => {
    for (const surface of ["surface-primary", "surface-secondary", "surface-raised"]) {
      expect(tokenContrast("price-strike", surface, theme), surface).toBeGreaterThanOrEqual(4.5);
    }
  });
});

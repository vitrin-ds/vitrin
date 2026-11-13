import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { HeaderMinimal } from "./header-minimal";

const LINKS = [
  { id: "story", label: "Our story", href: "/about" },
  { id: "shop", label: "Shop", href: "/shop" },
];

describe("HeaderMinimal", () => {
  it("renders the links and the action in a named navigation", async () => {
    const { container } = render(
      <HeaderMinimal links={LINKS} action={{ id: "cart", label: "Cart (0)", href: "/cart" }} />,
    );
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Our story" })).toHaveClass("text-text-primary");
    expect(screen.getByRole("link", { name: "Cart (0)" })).toHaveAttribute("href", "/cart");
    await expectNoAxeViolations(container);
  });

  it("uses text-on-accent for the Inverse tone", () => {
    render(<HeaderMinimal tone="inverse" links={LINKS} />);
    expect(screen.getByRole("link", { name: "Shop" })).toHaveClass("text-text-on-accent");
  });
});

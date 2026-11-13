import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("renders an h2 title, the body and the action described by the title", async () => {
    const { container } = render(
      <section aria-labelledby="t">
        <SectionHeader
          id="t"
          title="New Arrivals"
          description="The newest drops."
          action={{ label: "View All", href: "/collections/new" }}
        />
      </section>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "New Arrivals" })).toHaveAttribute(
      "id",
      "t",
    );
    expect(screen.getByText("The newest drops.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "View All" });
    expect(link).toHaveAttribute("href", "/collections/new");
    expect(link).toHaveAccessibleDescription("New Arrivals");
    expect(screen.getByRole("region", { name: "New Arrivals" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders a title-medium heading and a Small link at size Small", async () => {
    const { container } = render(
      <SectionHeader
        id="orders"
        size="sm"
        title="My Orders (4)"
        action={{ label: "View All", href: "/account/orders" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "My Orders (4)" })).toHaveClass(
      "text-title-md",
    );
    const link = screen.getByRole("link", { name: "View All" });
    expect(link).toHaveClass("text-label-md");
    expect(link).toHaveAccessibleDescription("My Orders (4)");
    await expectNoAxeViolations(container);
  });

  it("renders a headline-small heading with its body at size Medium", () => {
    render(
      <SectionHeader
        size="md"
        title="Everything you agree to, in one place"
        description="These documents explain how we handle your data."
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-headline-sm");
    expect(
      screen.getByText("These documents explain how we handle your data."),
    ).toBeInTheDocument();
  });

  it("renders a headline-small heading and the accent link action at size Medium", () => {
    render(
      <SectionHeader
        size="md"
        id="md"
        title="Best Sellers In Make Up"
        action={{ label: "View all", href: "#all" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-headline-sm");
    const link = screen.getByRole("link", { name: "View all" });
    expect(link).toHaveAttribute("aria-describedby", "md");
    expect(link).toHaveClass("text-text-accent", "text-label-lg", "link-underline");
  });

  it("draws the action's icon after the label", () => {
    render(
      <SectionHeader
        title="You may also like"
        action={{ label: "View all", href: "#all", rightIcon: "arrow_forward" }}
      />,
    );
    const link = screen.getByRole("link", { name: "View all" });
    expect(link.lastElementChild).toHaveAttribute("data-icon", "arrow_forward");
  });

  it("can be an h3 without body or action", () => {
    render(<SectionHeader title="Brands" headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Brands" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

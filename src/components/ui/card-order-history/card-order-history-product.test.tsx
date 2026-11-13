import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardOrderHistoryProduct } from "./card-order-history-product";

const BASE = {
  delivery: "Estimated delivery 31.10.2026",
  name: "Velvet Lip Colour",
  href: "/p/velvet-lip-colour",
  variant: "Rosewood",
  price: { amount: 2400, currency: "EUR" as const },
  image: {
    src: "/dev/sample-square.webp",
    alt: "",
    width: 2048,
    height: 2048,
  },
};

describe("CardOrderHistoryProduct", () => {
  it("shows the delivery line, the chip, the product and its actions", async () => {
    const { container } = render(
      <CardOrderHistoryProduct
        {...BASE}
        status="in-delivery"
        actions={[{ label: "Shipment Tracking", href: "/account/orders/o-1/tracking" }]}
      />,
    );
    expect(screen.getByText("Estimated delivery 31.10.2026")).toHaveClass("text-title-sm");
    expect(screen.getByText("In delivery")).toHaveClass("bg-(--th-indicator-warning-soft-bg)");
    expect(screen.getByRole("heading", { level: 3, name: "Velvet Lip Colour" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Velvet Lip Colour" })).toHaveAttribute(
      "href",
      "/p/velvet-lip-colour",
    );
    expect(screen.getByText("Rosewood")).toHaveClass("text-text-accent");
    expect(screen.getByText("€24")).toBeVisible();
    expect(screen.getByRole("link", { name: "Shipment Tracking" })).toHaveClass("text-label-md");
    await expectNoAxeViolations(container);
  });

  it("shows the unit price for several units", () => {
    render(
      <CardOrderHistoryProduct {...BASE} price={{ amount: 3920, currency: "EUR" }} quantity={2} />,
    );
    expect(screen.getByText("2 × €19.60")).toBeVisible();
  });

  it("greys a cancelled item out and drops its links and chip", () => {
    const { container } = render(
      <CardOrderHistoryProduct
        {...BASE}
        status="cancelled"
        disabled
        actions={[{ label: "Cancel Order", href: "#" }]}
      />,
    );
    expect(container.querySelector("article")).toHaveClass("bg-surface-disabled");
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Cancelled")).toBeNull();
  });
});

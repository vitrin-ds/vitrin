import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardAddress } from "./card-address";

const LINES = ["Lindenstraße 12", "2nd floor", "10969 Berlin, Germany"];

describe("CardAddress", () => {
  it("is a titled section with role labels, the address and named actions", async () => {
    const onEdit = vi.fn();
    const { container } = render(
      <CardAddress
        title="Home"
        roles={{ defaultShipping: true, defaultBilling: true, business: true }}
        name="Jane Doe"
        lines={LINES}
        phone="+49 30 1234567"
        onEdit={onEdit}
        onDelete={() => undefined}
        onMore={() => undefined}
      />,
    );
    expect(screen.getByRole("region", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("DEFAULT SHIP")).toHaveClass("bg-(--th-indicator-info-soft-bg)");
    expect(screen.getByText("BUSINESS")).toHaveClass("bg-(--th-indicator-accent-surface-bg)");
    expect(container.querySelector("address")).toHaveTextContent("Lindenstraße 12");
    await userEvent.click(screen.getByRole("button", { name: "Edit Home" }));
    expect(onEdit).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "More actions for Home" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows the invoice block only with invoice details, and hides actions in checkout", () => {
    const { rerender } = render(<CardAddress title="Office" name="Jane Doe" lines={LINES} />);
    expect(screen.queryByText("INVOICE DETAILS")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <CardAddress
        title="Office"
        name="Jane Doe"
        lines={LINES}
        invoice={{ name: "Serein GmbH", vatNumber: "DE123456789" }}
        type="card"
      />,
    );
    expect(screen.getByText("INVOICE DETAILS")).toBeInTheDocument();
    expect(screen.getByText("DE123456789")).toBeInTheDocument();
    expect(screen.getByRole("region")).toHaveClass("rounded-card", "after:border");
  });

  it("greys out and disables its actions when disabled", () => {
    render(<CardAddress title="Old" name="Jane" lines={LINES} onEdit={() => undefined} disabled />);
    expect(screen.getByRole("button", { name: "Edit Old" })).toBeDisabled();
    expect(screen.getByRole("region")).toHaveClass("bg-surface-disabled");
  });

  it("opens from the whole card and takes a menu in the top bar", async () => {
    const onOpen = vi.fn();
    render(
      <CardAddress
        title="Home"
        name="Ada Smith"
        lines={["42 Camden Lock Place"]}
        onOpen={onOpen}
        menu={<button type="button">Menu</button>}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit Home" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("draws Figma's Focus stroke outside the card when its radio has keyboard focus", () => {
    const { container } = render(
      <CardAddress type="card" title="Home" name="Jane Doe" lines={["Lindenstraße 12"]} />,
    );
    expect(container.firstChild).toHaveClass(
      "has-[:is([role=radio],[data-card-open]):focus-visible]:outline",
      "has-[:is([role=radio],[data-card-open]):focus-visible]:outline-interactive-focus-ring",
    );
  });
});

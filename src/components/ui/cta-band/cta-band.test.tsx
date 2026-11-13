import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CtaBand } from "./cta-band";

describe("CtaBand", () => {
  it("renders a heading, body and button-styled links", async () => {
    const { container } = render(
      <CtaBand
        title="Come and say hello"
        primaryAction={{ label: "Find a store", href: "/stores" }}
        secondaryAction={{ label: "Careers", href: "/careers" }}
        layout="horizontal"
      >
        Visit a store.
      </CtaBand>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Come and say hello" })).toHaveClass(
      "text-headline-sm",
    );
    const primary = screen.getByRole("link", { name: "Find a store" });
    expect(primary).toHaveAttribute("href", "/stores");
    expect(primary).toHaveClass("bg-(--th-button-accent-solid-bg)");
    expect(screen.getByRole("link", { name: "Careers" })).toHaveClass(
      "inset-ring-(--th-button-accent-outline-border)",
    );
    await expectNoAxeViolations(container);
  });

  it("uses a button for onClick actions and drops the secondary when not given", async () => {
    const onClick = vi.fn();
    render(
      <CtaBand
        title="Need help?"
        primaryAction={{ label: "Contact us", onClick }}
        layout="stacked"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Contact us" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("heading")).toHaveClass("text-title-lg");
  });

  it("is responsive by default", () => {
    const { container } = render(
      <CtaBand title="Hello" primaryAction={{ label: "Go", href: "/" }} />,
    );
    expect(container.firstChild).toHaveClass("flex-col", "desktop:flex-row", "desktop:p-48");
  });
});

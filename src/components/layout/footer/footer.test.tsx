import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Footer } from "./footer";
import { localToday } from "@/lib/use-today";

describe("Footer", () => {
  it("is the contentinfo landmark with named navigation", async () => {
    const { container } = render(<Footer onNewsletterSubmit={vi.fn()} year={2026} />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-surface-accent-strong", "text-text-on-accent");
    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByText("Copyright © 2026")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("lists contacts with tel: and mailto: links", () => {
    render(<Footer />);
    const contact = screen.getByRole("region", { name: "Contact" });
    expect(within(contact).getByRole("link", { name: "+44 20 0000 0000" })).toHaveAttribute(
      "href",
      "tel:+442000000000",
    );
    expect(within(contact).getByRole("link", { name: "hello@things.example" })).toHaveAttribute(
      "href",
      "mailto:hello@things.example",
    );
  });

  it("shows link groups as columns from tablet and as accordions on mobile", async () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    // Columns: headed lists (hidden below tablet with display:none, which jsdom does not apply).
    expect(within(nav).getByRole("list", { name: "Shop" })).toBeInTheDocument();
    const toggle = within(nav).getByRole("button", { name: "Company" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("region", { name: "Company" })).toContainElement(
      within(within(nav).getByRole("region", { name: "Company" })).getByRole("link", {
        name: "Find a Store",
      }),
    );
  });

  it("takes the copyright year from the viewer's date when none is given", () => {
    render(<Footer />);
    const year = localToday().slice(0, 4);
    expect(screen.getByText(`Copyright © ${year}`)).toBeInTheDocument();
  });

  it("shows payment methods and social links by name", () => {
    render(<Footer />);
    const payments = screen.getByRole("list", { name: "Accepted payment methods" });
    expect(within(payments).getByRole("img", { name: "Visa" })).toBeInTheDocument();
    expect(within(payments).getAllByRole("listitem")).toHaveLength(5);
    const social = screen.getByRole("list", { name: "Follow us" });
    const instagram = within(social).getByRole("link", { name: "Follow us on Instagram" });
    expect(within(instagram).getByRole("img", { name: "Instagram" }).getAttribute("src")).toMatch(
      /\/brand\/social\/instagram\.svg$/,
    );
  });

  it("hides the newsletter until a handler is given, then validates and submits", async () => {
    const { rerender } = render(<Footer />);
    expect(screen.queryByRole("form")).toBeNull();
    const onSubmit = vi.fn();
    rerender(<Footer onNewsletterSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "nope{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, " name@example.com {Enter}");
    expect(onSubmit).toHaveBeenCalledWith("name@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent("Check your inbox");
  });

  it("shows the failure message when the signup fails", async () => {
    render(<Footer onNewsletterSubmit={vi.fn().mockRejectedValue(new Error("down"))} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "name@example.com{Enter}",
    );
    // One visible message: TextInput's own (on-accent tokens), not a separate line.
    expect(await screen.findAllByText(/couldn.t sign you up/)).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAccessibleDescription(
      /couldn.t sign you up/,
    );
  });

  it("shows the handler's own message when it refuses the address", async () => {
    render(<Footer onNewsletterSubmit={async () => ({ error: "Already signed up." })} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "name@example.com{Enter}");
    expect(await screen.findByText("Already signed up.")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
  });

  it("has no Cookie settings action without a handler", () => {
    render(<Footer />);
    expect(screen.queryByRole("button", { name: "Cookie settings" })).toBeNull();
  });

  it("calls onCookieSettings", async () => {
    const onCookieSettings = vi.fn();
    render(<Footer onCookieSettings={onCookieSettings} />);
    await userEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(onCookieSettings).toHaveBeenCalledOnce();
  });
});

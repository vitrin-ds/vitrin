import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { NewsletterBand } from "./newsletter-band";

describe("NewsletterBand", () => {
  it("is a titled region with a labelled email form", async () => {
    const { container } = render(<NewsletterBand onSubmit={vi.fn()} layout="horizontal" />);
    expect(
      screen.getByRole("region", { name: "Get the Journal in your inbox" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Get the Journal in your inbox" })).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-headline-sm");
    await expectNoAxeViolations(container);
  });

  it("shows the TextInput error for an invalid address and focuses the field", async () => {
    const onSubmit = vi.fn();
    const { container } = render(<NewsletterBand onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "jamie@");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/Enter a valid email address/);
    expect(input).toHaveFocus();
    await expectNoAxeViolations(container);
    await userEvent.type(input, "x");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("submits a trimmed valid address and announces success", async () => {
    const onSubmit = vi.fn();
    render(<NewsletterBand onSubmit={onSubmit} layout="stacked" />);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Email address" }),
      " name@example.com {Enter}",
    );
    expect(onSubmit).toHaveBeenCalledWith("name@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent("Check your inbox");
    expect(screen.getByRole("button", { name: "Subscribe" })).toHaveClass("w-full");
  });

  it("shows the failure message when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("down"));
    render(<NewsletterBand onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "name@example.com{Enter}");
    expect(await screen.findByText(/couldn't sign you up/)).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

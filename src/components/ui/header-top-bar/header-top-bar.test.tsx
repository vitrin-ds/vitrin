import { act, render, screen } from "@testing-library/react";
import NextLink from "next/link";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { HeaderTopBar } from "./header-top-bar";
import { HeaderTopBarItem } from "./header-top-bar-item";

const MESSAGES = [
  { id: "ship", text: "Free shipping on all EU orders over €100", href: "/help/shipping" },
  { id: "gift", text: "A free gift with every order this week" },
];

function stubMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("HeaderTopBar", () => {
  it("shows the announcement with its utility links", () => {
    render(
      <HeaderTopBar
        aria-label="Top bar"
        start={<HeaderTopBarItem href="/help" label="Help Centre" />}
        end={<HeaderTopBarItem href="/region" label="Europe" chevron />}
      >
        Free shipping
      </HeaderTopBar>,
    );
    expect(screen.getByRole("region", { name: "Top bar" })).toHaveTextContent("Free shipping");
    expect(screen.getByRole("link", { name: "Help Centre" })).toHaveAttribute("href", "/help");
    expect(screen.getByRole("link", { name: "Europe" })).toBeInTheDocument();
  });

  it("keeps the item's name when its label is hidden", () => {
    render(
      <HeaderTopBarItem href="/stores" label="Find a Store" leftIcon="location_on" hideLabel />,
    );
    const link = screen.getByRole("link", { name: "Find a Store" });
    expect(link).not.toHaveTextContent("Find a Store");
  });
});

describe("HeaderTopBar messages", () => {
  it("shows one linked message on surface-accent-strong", async () => {
    const { container } = render(<HeaderTopBar messages={MESSAGES.slice(0, 1)} />);
    const region = screen.getByRole("region", { name: "Promotions" });
    expect(region).toHaveClass("bg-surface-accent-strong", "text-text-on-accent");
    expect(screen.getByRole("link", { name: MESSAGES[0].text })).toHaveAttribute(
      "href",
      "/help/shipping",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    // Figma Header Top Bar: the announcement is set in capitals (the copy stays sentence case).
    expect(container.querySelector("[aria-live]")?.parentElement).toHaveClass("uppercase");
    await expectNoAxeViolations(container);
  });

  it("puts the desktop utility links left and the region right (Figma WD.07.00)", async () => {
    const { container } = render(
      <HeaderTopBar
        messages={MESSAGES.slice(0, 1)}
        start={
          <>
            <HeaderTopBarItem href="/help" label="Help Centre" />
            <HeaderTopBarItem href="/stores" label="Find a Store" />
            <HeaderTopBarItem href="/help/contact" label="Contact" />
          </>
        }
        end={
          <HeaderTopBarItem
            href="/account/preferences"
            label="Europe (EUR €)"
            flag="/brand/flags/eu.svg"
            chevron
          />
        }
      />,
    );
    const links = screen.getAllByRole("link").map((link) => link.textContent);
    expect(links).toEqual([
      "Help Centre",
      "Find a Store",
      "Contact",
      MESSAGES[0].text,
      "Europe (EUR €)",
    ]);
    const region = screen.getByRole("link", { name: "Europe (EUR €)" });
    expect(region).toHaveAttribute("href", "/account/preferences");
    // The flag is decorative: the label names the region.
    expect(region.querySelector("img")).toHaveAttribute("alt", "");
    expect(region.querySelector('[data-icon="keyboard_arrow_down"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help Centre" })).toHaveClass("text-label-md");
    await expectNoAxeViolations(container);
  });

  it("rotates several messages slowly with a Pause control", async () => {
    stubMotion(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<HeaderTopBar messages={MESSAGES} />);
    expect(screen.getByText(MESSAGES[1].text)).not.toBeVisible();
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByText(MESSAGES[1].text)).toBeVisible();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText(MESSAGES[1].text)).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("holds the rotation on hover and focus", async () => {
    stubMotion(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<HeaderTopBar messages={MESSAGES} />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.hover(screen.getByRole("region", { name: "Promotions" }));
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText(MESSAGES[0].text)).toBeVisible();
    await user.unhover(screen.getByRole("region", { name: "Promotions" }));
    await user.tab();
    expect(screen.getByRole("link", { name: MESSAGES[0].text })).toHaveFocus();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText(MESSAGES[0].text)).toBeVisible();
  });

  it("starts paused for reduced motion", () => {
    stubMotion(true);
    vi.useFakeTimers();
    render(<HeaderTopBar messages={MESSAGES} />);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText(MESSAGES[0].text)).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("dismisses and reports it so the page can store the choice", async () => {
    const onDismiss = vi.fn();
    render(
      <HeaderTopBar
        messages={MESSAGES.slice(0, 1)}
        onDismiss={onDismiss}
        start={<NextLink href="/help">Help</NextLink>}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss promotions" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { TableOfContents } from "./table-of-contents";

const ITEMS = [
  { id: "intro", label: "Intro" },
  { id: "steps", label: "Steps" },
  { id: "faq", label: "FAQ" },
];

describe("TableOfContents", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is a named nav of anchor links with the active one marked as the current location", async () => {
    const { container } = render(
      <TableOfContents items={ITEMS} activeId="steps" progress={38} minutesLeft={4} />,
    );
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav).toBeInTheDocument();
    const steps = screen.getByRole("link", { name: "Steps" });
    expect(steps).toHaveAttribute("href", "#steps");
    expect(steps).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Intro" })).toHaveClass("text-text-secondary");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveClass("text-text-tertiary");
    expect(screen.getByRole("progressbar", { name: "Reading progress" })).toHaveAttribute(
      "aria-valuetext",
      "38% read · about 4 min left",
    );
    await expectNoAxeViolations(container);
  });

  it("marks nothing current and hides progress when untracked", () => {
    render(<TableOfContents items={ITEMS} activeId={null} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("follows the scroll position without activeId", () => {
    let fire: () => void = () => undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: () => void) {
          fire = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(
      <>
        <TableOfContents items={ITEMS} />
        {ITEMS.map((item) => (
          <h2 key={item.id} id={item.id}>
            {item.label}
          </h2>
        ))}
      </>,
    );
    const steps = document.getElementById("steps")!;
    steps.getBoundingClientRect = () => ({ top: 10 }) as DOMRect;
    document.getElementById("intro")!.getBoundingClientRect = () => ({ top: -200 }) as DOMRect;
    document.getElementById("faq")!.getBoundingClientRect = () => ({ top: 900 }) as DOMRect;
    act(() => fire());
    expect(screen.getByRole("link", { name: "Steps" })).toHaveAttribute("aria-current", "location");
  });

  it("Sticky Bar opens the list as a disclosure and closes on Esc and on navigation", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableOfContents items={ITEMS} activeId="steps" progress={38} layout="sticky-bar" />,
    );
    const toggle = screen.getByRole("button", { name: /On this page · 38% read\s*Steps/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link")).toBeNull();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveClass("min-h-44");
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    await user.click(toggle);
    await user.click(screen.getByRole("link", { name: "FAQ" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expectNoAxeViolations(container);
  });
});

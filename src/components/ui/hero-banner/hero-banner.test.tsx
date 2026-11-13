import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { HeroBanner, type HeroBannerSlide } from "./hero-banner";

const image = (alt: string) => ({ src: "/dev/sample-wide.webp", alt, width: 1600, height: 900 });

const SLIDES: HeroBannerSlide[] = [
  {
    id: "a",
    overline: "Feel The Balance",
    title: "Caring For Your Everyday Well-Being",
    copy: "Calm and confidence for your daily routine.",
    image: image("Serum bottles on a pink plinth"),
    action: { label: "Shop Skincare", href: "/c/skincare" },
  },
  { id: "b", title: "New Season Fragrances", image: image("Perfume bottles") },
  { id: "c", title: "Gifts Under €30", image: image("Wrapped gifts") },
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

describe("HeroBanner", () => {
  it("is an APG carousel with labelled slides and only the current one shown", async () => {
    const { container } = render(<HeroBanner slides={SLIDES} />);
    const region = screen.getByRole("region", { name: "Featured campaigns" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slide = screen.getByRole("group", { name: "1 of 3" });
    expect(slide).toHaveAttribute("aria-roledescription", "slide");
    expect(within(slide).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Caring For Your Everyday Well-Being",
    );
    expect(within(slide).getByRole("link", { name: "Shop Skincare" })).toHaveAttribute(
      "href",
      "/c/skincare",
    );
    expect(screen.queryByRole("group", { name: "2 of 3" })).not.toBeInTheDocument();
    // Not rotating: changes are announced politely.
    expect(slide.parentElement).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("moves with the arrows (wrapping) and the dots", async () => {
    render(<HeroBanner slides={SLIDES} />);
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Slide 2 of 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "Slide 1 of 3" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("group", { name: "3 of 3" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Wrapped gifts" })).toBeVisible();
  });

  it("rotates with a pause control, holds on hover, and stops on Pause", async () => {
    stubMotion(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<HeroBanner slides={SLIDES} autoplayInterval={5000} />);
    expect(screen.getByRole("group", { name: "1 of 3" }).parentElement).toHaveAttribute(
      "aria-live",
      "off",
    );
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument();

    const region = screen.getByRole("region");
    act(() => region.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument();
    act(() => region.dispatchEvent(new MouseEvent("mouseout", { bubbles: true })));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument();
  });

  it("does not start rotating for reduced motion", () => {
    stubMotion(true);
    vi.useFakeTimers();
    render(<HeroBanner slides={SLIDES} autoplayInterval={5000} />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole("group", { name: "1 of 3" })).toBeInTheDocument();
  });

  it("Centered puts text-on-image copy over a scrim with round arrows", async () => {
    const { container } = render(<HeroBanner slides={SLIDES} layout="centered" priority />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("text-text-on-image");
    expect(container.querySelector(".scrim-bottom")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Shop Skincare" })).toHaveClass(
      "bg-(--th-button-accent-solid-bg)",
    );
    expect(screen.queryByRole("button", { name: "Slide 1 of 3" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("a single slide is a plain hero without carousel semantics", () => {
    render(<HeroBanner slides={SLIDES.slice(0, 1)} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import {
  BannerHorizontal,
  BannerImageCentered,
  BannerImageBackgroundCompact,
} from "./banner-image";
import { BannerText } from "./banner-text";
import { BannerWide } from "./banner-wide";

const IMAGE = {
  src: "/dev/sample-wide.webp",
  alt: "Marbled pink texture",
  width: 1600,
  height: 900,
};

describe("BannerWide", () => {
  it("renders copy, a Large outline CTA and the product and pagination slots", async () => {
    const { container } = render(
      <BannerWide
        overline="Feel The Balance"
        title="Caring For Your Everyday Well-Being"
        copy="Calm and confidence for your daily routine."
        image={IMAGE}
        action={{ label: "Shop Skincare", href: "/c/skincare" }}
        product={<p>Product card</p>}
        pagination={<p>1 / 2</p>}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-headline-lg");
    const cta = screen.getByRole("link", { name: "Shop Skincare" });
    expect(cta).toHaveClass("inset-ring-(--th-button-accent-outline-border)", "min-w-216", "py-16");
    expect(screen.getByText("Product card").parentElement).toHaveClass(
      "hidden",
      "desktop:block",
      "-left-40",
    );
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("puts the copy right of the image with Content Direction Right", () => {
    render(<BannerWide title="T" image={IMAGE} contentDirection="right" product={<p>Card</p>} />);
    expect(screen.getByRole("img").parentElement).not.toHaveClass("tablet:order-last");
    expect(screen.getByText("Card").parentElement).toHaveClass("-right-40");
  });
});

describe("BannerText", () => {
  it("is a tinted band with a Medium filled action", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <BannerText
        overline="Members only"
        title="20% off serums"
        description="Ends Sunday."
        action={{ label: "Shop Now", onClick }}
      />,
    );
    const button = screen.getByRole("button", { name: "Shop Now" });
    expect(button).toHaveClass("bg-(--th-button-accent-solid-bg)", "py-12");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });
});

describe("image banners", () => {
  it("Compact: text-on-image on a scrim, the sale tag as a Label", async () => {
    const { container } = render(
      <BannerImageBackgroundCompact
        overline="Overline"
        title="Title Text"
        image={IMAGE}
        action={{ label: "Shop Skincare", href: "/c/skincare" }}
        sticker={{ text: "20% Off", icon: "loyalty" }}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.parentElement).toHaveClass("scrim-top", "text-text-on-image");
    // Read as one phrase by screen readers.
    expect(screen.getByText("20% Off")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("Centered: centred copy with extra content", async () => {
    const { container } = render(
      <BannerImageCentered title="Holiday Season Sale" overline="Don't Miss" image={IMAGE}>
        <p>27 : 04 : 39</p>
      </BannerImageCentered>,
    );
    expect(screen.getByRole("heading").parentElement).toHaveClass("items-center", "text-center");
    expect(screen.getByText("27 : 04 : 39")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("Horizontal: the banner is one link named by its title", async () => {
    const { container } = render(
      <BannerHorizontal
        title="Summer Edit"
        overline="New in"
        image={IMAGE}
        href="/collections/summer"
        cta="Shop Skincare"
        sticker={{ text: "20% Off", icon: "loyalty" }}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Summer Edit");
    expect(within(screen.getByRole("heading")).getByRole("link")).toHaveAttribute(
      "href",
      "/collections/summer",
    );
    expect(screen.getByText("Shop Skincare")).toHaveAttribute("aria-hidden");
    await expectNoAxeViolations(container);
  });
});

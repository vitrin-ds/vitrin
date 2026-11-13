import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardCategoryChipType } from "./card-category-chip-type";
import { CardCategoryCircle } from "./card-category-circle";
import { CardCategoryHorizontal } from "./card-category-horizontal";
import { CardCategoryHorizontalSmall } from "./card-category-horizontal-small";
import { CardCategorySquareSmall } from "./card-category-square-small";
import { CardCategoryVertical } from "./card-category-vertical";
import { CardCategoryVerticalFeatured } from "./card-category-vertical-featured";

const IMAGE = {
  src: "/dev/sample-square.webp",
  alt: "Serums on a tray",
  width: 1024,
  height: 1024,
};
const BASE = { title: "Serums", href: "/c/serums", image: IMAGE };

describe("CardCategoryVertical", () => {
  it("is an article whose heading links to the category over the whole card", async () => {
    const { container } = render(<CardCategoryVertical {...BASE} />);
    expect(screen.getByRole("article")).toHaveClass("bg-surface-secondary");
    const link = screen.getByRole("link", { name: "Serums" });
    expect(link).toHaveAttribute("href", "/c/serums");
    expect(link).toHaveClass("after:absolute", "after:inset-0", "truncate");
    expect(screen.getByRole("heading", { level: 3, name: "Serums" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Serums on a tray" })).toBeInTheDocument();
    expect(container.querySelector('[data-icon="keyboard_arrow_right"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("supports White, no icon, another heading level and a missing image", () => {
    const { container } = render(
      <CardCategoryVertical
        {...BASE}
        image={undefined}
        color="white"
        rightIcon={null}
        headingLevel={2}
      />,
    );
    expect(screen.getByRole("article")).toHaveClass("bg-surface-primary");
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(container.querySelector('[data-icon="keyboard_arrow_right"]')).toBeNull();
    expect(container.querySelector("[data-placeholder]")).not.toBeNull();
  });
});

describe("CardCategoryVerticalFeatured", () => {
  it("shows overline, title link and C2A over the image", async () => {
    const { container } = render(
      <CardCategoryVerticalFeatured {...BASE} overline="New season" cta="Shop the edit" />,
    );
    expect(screen.getByRole("link", { name: "Serums" })).toHaveClass("after:inset-0");
    // No scrim (2 Nov decision): dark copy straight on the image, the overline in text-accent.
    expect(screen.getByText("New season")).toHaveClass("text-text-accent");
    expect(container.querySelector(".scrim-top, .scrim-bottom")).toBeNull();
    expect(container.querySelector("article")).toHaveClass("hover:bg-surface-accent-subtle");
    expect(screen.getByText("Shop the edit")).toBeInTheDocument();
    expect(container.querySelector('[data-icon="arrow_forward"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("hides the title on screen but keeps it as the link's name when showTitle is off", async () => {
    const { container } = render(<CardCategoryVerticalFeatured {...BASE} showTitle={false} />);
    const link = screen.getByRole("link", { name: "Serums" });
    expect(link).toHaveClass("after:inset-0");
    expect(screen.getByText("Serums")).toHaveClass("sr-only");
    await expectNoAxeViolations(container);
  });
});

describe("CardCategoryHorizontal", () => {
  it("shows the product count from the labels", async () => {
    const { container, rerender } = render(<CardCategoryHorizontal {...BASE} productCount={128} />);
    expect(screen.getByText("128 Products")).toHaveClass("text-text-tertiary");
    expect(screen.getByRole("link", { name: "Serums" })).toHaveAttribute("href", "/c/serums");
    await expectNoAxeViolations(container);
    rerender(
      <CardCategoryHorizontal
        {...BASE}
        productCount={1}
        labels={{ productCount: (n) => `${n} Produkt` }}
      />,
    );
    expect(screen.getByText("1 Produkt")).toBeInTheDocument();
  });
});

describe("single-link category cards", () => {
  it.each([
    ["Horizontal.Small", CardCategoryHorizontalSmall],
    ["Square.Small", CardCategorySquareSmall],
    ["Circle", CardCategoryCircle],
  ])("%s: the whole card is one link named by the title", async (_, Card) => {
    const { container } = render(<Card {...BASE} />);
    const link = screen.getByRole("link", { name: "Serums" });
    expect(link).toHaveAttribute("href", "/c/serums");
    // The image only repeats the title, so it is decorative.
    expect(link.querySelector("img")).toHaveAttribute("alt", "");
    await expectNoAxeViolations(container);
  });
});

describe("CardCategoryCircle media", () => {
  it("contains a cut-out on surface-secondary", () => {
    const { container } = render(<CardCategoryCircle {...BASE} media="packshot" />);
    expect(container.querySelector("img")).toHaveClass("object-contain");
    // The image sits 8 clear of the circle, so the frame is the wrapper's parent.
    const inset = container.querySelector("img")?.parentElement;
    expect(inset).toHaveClass("absolute", "inset-8");
    expect(inset?.parentElement).toHaveClass("bg-surface-secondary");
  });
});

describe("CardCategorySquareSmall media", () => {
  it("contains a cut-out on the card's fill, without the photo's skeleton", () => {
    const { container } = render(<CardCategorySquareSmall {...BASE} media="packshot" />);
    expect(container.querySelector("img")).toHaveClass("object-contain");
    expect(container.querySelector("img")?.parentElement).not.toHaveClass("bg-surface-skeleton");
  });

  it("covers the thumbnail with a photo by default", () => {
    const { container } = render(<CardCategorySquareSmall {...BASE} />);
    expect(container.querySelector("img")).toHaveClass("object-cover");
    expect(container.querySelector("img")?.parentElement).toHaveClass("bg-surface-skeleton");
  });
});

describe("CardCategoryChipType", () => {
  it("toggles as a pressed button without href", async () => {
    const onClick = vi.fn();
    const { container, rerender } = render(
      <CardCategoryChipType title="Serums" image={IMAGE} onClick={onClick} />,
    );
    const chip = screen.getByRole("button", { name: "Serums" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveClass("bg-surface-primary");
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
    rerender(<CardCategoryChipType title="Serums" image={IMAGE} onClick={onClick} selected />);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveClass("bg-surface-secondary");
    await expectNoAxeViolations(container);
  });

  it("is a link with aria-current when it has an href", () => {
    render(<CardCategoryChipType title="Serums" href="/c/serums" selected />);
    expect(screen.getByRole("link", { name: "Serums" })).toHaveAttribute("aria-current", "page");
  });
});

describe("CardCategoryHorizontal showBottom", () => {
  it("hides the bottom row but keeps a named link over the card", () => {
    render(
      <CardCategoryHorizontal
        title="Serums"
        href="/c/serums"
        productCount={12}
        showBottom={false}
      />,
    );
    expect(screen.getByRole("link", { name: "Serums" })).toHaveClass("absolute", "inset-0");
    expect(screen.queryByText("12 Products")).toBeNull();
  });
});

describe("CardCategoryCircle showTitle", () => {
  it("keeps the link name when the title is hidden", () => {
    render(<CardCategoryCircle title="Velora" href="/b/velora" showTitle={false} />);
    expect(screen.getByRole("link", { name: "Velora" })).toBeInTheDocument();
    expect(screen.getByText("Velora")).toHaveClass("sr-only");
  });
});

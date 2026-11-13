import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { GALLERY_FEW_IMAGES, GALLERY_IMAGES } from "./product-gallery.fixtures";
import { ProductGallery } from "./product-gallery";

const visiblePanel = () => screen.getAllByRole("tabpanel").find((panel) => !panel.hidden)!;

describe("ProductGallery", () => {
  it("renders a thumbnail tablist with one selected tab and its panel", async () => {
    const { container } = render(<ProductGallery images={GALLERY_FEW_IMAGES} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(within(visiblePanel()).getByRole("img")).toHaveAccessibleName(
      GALLERY_FEW_IMAGES[0]!.alt,
    );
    expect(visiblePanel()).toHaveAccessibleName("Image 1 of 3");
    await expectNoAxeViolations(container);
  });

  it("moves with arrow keys, Home and End (automatic activation, wrapping)", async () => {
    render(<ProductGallery images={GALLERY_FEW_IMAGES} />);
    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}");
    expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Home}");
    expect(visiblePanel()).toHaveAccessibleName("Image 1 of 3");
  });

  it("shows four thumbnails on mobile and reveals the rest from the +N tile", async () => {
    render(<ProductGallery images={GALLERY_IMAGES} />);
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    const more = screen.getByRole("button", { name: "+5 more images" });
    await userEvent.click(more);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(9);
    expect(tabs[4]).toHaveFocus();
    expect(screen.queryByRole("button", { name: /more images/ })).toBeNull();
  });

  it("reveals hidden thumbnails when the keyboard reaches them", async () => {
    render(<ProductGallery images={GALLERY_IMAGES} />);
    screen.getAllByRole("tab")[0]!.focus();
    await userEvent.keyboard("{End}");
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(9);
    expect(tabs[8]).toHaveFocus();
  });

  it("swipes between images with touch and announces the position", () => {
    render(<ProductGallery images={GALLERY_FEW_IMAGES} zoom={false} />);
    const area = visiblePanel().parentElement!;
    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 200 });
    fireEvent.pointerUp(area, { pointerType: "touch", clientX: 100 });
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Image 2 of 3")).toHaveAttribute("aria-live", "polite");
    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 100 });
    fireEvent.pointerUp(area, { pointerType: "touch", clientX: 120 });
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
  });

  it("toggles the wishlist with a named button", async () => {
    const onToggle = vi.fn();
    render(<ProductGallery images={GALLERY_FEW_IMAGES} wishlist={{ saved: false, onToggle }} />);
    await userEvent.click(screen.getByRole("button", { name: "Save to wishlist" }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("opens the zoom viewer, steps with arrow keys and returns focus on close", async () => {
    render(<ProductGallery images={GALLERY_FEW_IMAGES} />);
    const zoom = screen.getByRole("button", { name: "Zoom image" });
    await userEvent.click(zoom);
    const viewer = screen.getByRole("dialog", { name: "Product images, full screen" });
    expect(within(viewer).getByText("Image 1 of 3")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    expect(within(viewer).getByText("Image 2 of 3")).toBeInTheDocument();
    await expectNoAxeViolations(viewer);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(zoom).toHaveFocus();
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
  });

  it("compact mode uses a Slider Pagination Bar instead of tabs and has no zoom", async () => {
    const { container } = render(
      <ProductGallery images={GALLERY_FEW_IMAGES} thumbnails={false} zoom={false} />,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("button", { name: "Zoom image" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByRole("group", { name: "Image 2 of 3" })).toBeVisible();
    await expectNoAxeViolations(container);
  });

  it("loads only the first image with priority", () => {
    const { container } = render(<ProductGallery images={GALLERY_FEW_IMAGES} priority />);
    const images = [...container.querySelectorAll('[role="tabpanel"] img')];
    expect(images[0]).not.toHaveAttribute("loading", "lazy");
    expect(images[1]).toHaveAttribute("loading", "lazy");
  });
});

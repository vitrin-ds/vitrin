import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Rating, ratingStars } from "./rating";

describe("Rating", () => {
  it("always shows the value; the stars are decorative", async () => {
    const { container } = render(<Rating value={4.2} />);
    expect(container).toHaveTextContent("Rated 4.2 out of 5");
    expect(screen.getByText("4.2", { exact: false })).toBeVisible();
    const stars = container.querySelectorAll("[data-icon]");
    expect(stars).toHaveLength(5);
    stars.forEach((star) => expect(star).toHaveAttribute("aria-hidden", "true"));
    await expectNoAxeViolations(container);
  });

  it("formats the value with the locale", () => {
    const { container } = render(<Rating value={4.9} locale="de" />);
    expect(container).toHaveTextContent("Rated 4,9 out of 5");
  });

  it("rounds the stars down to the nearest half", () => {
    const four = ["selected", "selected", "selected", "selected", "idle"];
    const fourHalf = ["selected", "selected", "selected", "selected", "half"];
    expect(ratingStars(4.4)).toEqual(four);
    expect(ratingStars(4.49)).toEqual(four);
    expect(ratingStars(4)).toEqual(four);
    expect(ratingStars(4.5)).toEqual(fourHalf);
    expect(ratingStars(4.6)).toEqual(fourHalf);
    expect(ratingStars(4.99)).toEqual(fourHalf);
    expect(ratingStars(5)).toEqual(Array(5).fill("selected"));
    expect(ratingStars(2.5)).toEqual(["selected", "selected", "half", "idle", "idle"]);
    expect(ratingStars(0.4)).toEqual(Array(5).fill("idle"));
  });

  it("states the real value while the stars round down", () => {
    const { container } = render(<Rating value={4.6} />);
    expect(container).toHaveTextContent("Rated 4.6 out of 5");
    expect(container.querySelectorAll('[data-state="selected"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-state="half"]')).toHaveLength(1);
  });

  it("draws the half star with star_half in the fill colour", () => {
    const { container } = render(<Rating value={3.5} />);
    const half = container.querySelector('[data-state="half"]');
    expect(half).toHaveAttribute("data-icon", "star_half");
    expect(half).toHaveClass("text-rating-fill");
  });

  it("clamps to 0–5", () => {
    expect(ratingStars(-1)).toEqual(Array(5).fill("idle"));
    expect(ratingStars(9)).toEqual(Array(5).fill("selected"));
  });

  it("has a small size for product cards (16px stars, label-small)", () => {
    const { container } = render(<Rating value={4} size="sm" />);
    expect(container.querySelector("[data-icon]")).toHaveClass("icon-16");
    expect(screen.getByText("4.0", { exact: false })).toHaveClass("text-label-sm");
  });

  it("shows the value in brackets next to touching stars with display=compact", () => {
    const { container } = render(<Rating value={4} size="sm" display="compact" />);
    expect(container.textContent).toContain("(4.0)");
    expect(
      container.querySelector("span > span.flex")?.querySelectorAll("[data-icon]"),
    ).toHaveLength(5);
  });
});

describe("Rating interactive", () => {
  function Picker({ onChange }: { onChange?: (value: number) => void }) {
    const [value, setValue] = useState(0);
    return (
      <Rating
        interactive
        label="Overall rating"
        name="rating"
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
    );
  }

  it("is a named radio group with a 44px labelled radio per star", async () => {
    const { container } = render(<Picker />);
    expect(screen.getByRole("group", { name: "Overall rating" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "4 stars, Very good" }).closest("label")).toHaveClass(
      "p-6",
    );
    await expectNoAxeViolations(container);
  });

  it("selects on click and shows selected stars up to the value", async () => {
    const onChange = vi.fn();
    const { container } = render(<Picker onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "4 stars, Very good" }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(container.querySelectorAll('[data-state="selected"]')).toHaveLength(4);
  });

  it("moves and selects with the arrow keys", async () => {
    render(<Picker />);
    await userEvent.click(screen.getByRole("radio", { name: "2 stars, Fair" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "3 stars, Good" })).toBeChecked();
  });

  it("links the error to the group", () => {
    render(
      <Rating interactive label="Rate" name="r" value={0} onChange={() => {}} errorText="Choose" />,
    );
    expect(screen.getByRole("group", { name: "Rate" })).toHaveAccessibleDescription("Choose");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Image } from "./image";

describe("Image", () => {
  it("reserves a square frame with the placeholder surface by default", () => {
    const { container } = render(
      <Image src="/dev/sample-square.webp" alt="Glow serum, 30 ml" sizes="50vw" />,
    );
    expect(container.firstElementChild).toHaveClass(
      "aspect-square",
      "bg-surface-skeleton",
      "overflow-hidden",
    );
    const img = screen.getByRole("img", { name: "Glow serum, 30 ml" });
    expect(img).toHaveClass("object-cover");
    expect(img).toHaveAttribute("sizes", "50vw");
  });

  it("maps ratio and fit", () => {
    const { container } = render(
      <Image src="/dev/sample-wide.webp" alt="" ratio="16/9" fit="contain" sizes="100vw" />,
    );
    expect(container.firstElementChild).toHaveClass("aspect-video");
    expect(container.querySelector("img")).toHaveClass("object-contain");
  });

  it("treats an empty alt as decorative", () => {
    render(<Image src="/dev/sample-wide.webp" alt="" sizes="100vw" />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});

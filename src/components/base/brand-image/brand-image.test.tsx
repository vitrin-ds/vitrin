import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandImage } from "./brand-image";

describe("BrandImage", () => {
  it("shows the mark while it loads", () => {
    render(<BrandImage src="/brand/x.svg" alt="X" width={24} height={24} fallback="X name" />);
    expect(screen.getByRole("img", { name: "X" })).toBeInTheDocument();
    expect(screen.queryByText("X name")).not.toBeInTheDocument();
  });

  it("draws the fallback when the file is missing", () => {
    render(<BrandImage src="/brand/x.svg" alt="X" width={24} height={24} fallback="X name" />);
    fireEvent.error(screen.getByRole("img", { name: "X" }));
    expect(screen.queryByRole("img", { name: "X" })).not.toBeInTheDocument();
    expect(screen.getByText("X name")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Masthead } from "./masthead";

const IMAGE = {
  src: "/dev/sample-wide.webp",
  alt: "Founders in the first store",
  width: 1600,
  height: 900,
};

describe("Masthead", () => {
  it("is a region named by its title, with media and body", async () => {
    const { container } = render(
      <Masthead title="Happy 15th anniversary!" image={IMAGE} onClose={() => undefined}>
        Thank you for fifteen years with us.
      </Masthead>,
    );
    const region = screen.getByRole("region", { name: "Happy 15th anniversary!" });
    expect(region).toHaveClass("bg-surface-tertiary", "desktop:flex-row");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-headline-md");
    expect(screen.getByRole("img", { name: IMAGE.alt })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("closes and reports it; no close button without onClose", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Masthead title="News" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    rerender(<Masthead key="again" title="News" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

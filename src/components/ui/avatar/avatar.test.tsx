import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Avatar, AVATAR_DEFAULTS } from "./avatar";

describe("Avatar", () => {
  it("shows a photo named by alt, 48px by default, with the 2px neutral ring", async () => {
    const { container } = render(
      <Avatar variant="photo" src="/dev/sample-square.webp" alt="Jane Doe" />,
    );
    expect(AVATAR_DEFAULTS).toEqual({ size: "md", icon: "upload" });
    expect(screen.getByRole("img", { name: "Jane Doe" })).toBeInTheDocument();
    const root = container.firstElementChild!;
    expect(root).toHaveClass(
      "size-48",
      "rounded-full",
      "after:inset-ring-2",
      "after:inset-ring-border-neutral",
    );
    await expectNoAxeViolations(container);
  });

  it("names Letter by the person, not the initials", async () => {
    const { container } = render(
      <Avatar variant="letter" initials="JD" name="Jane Doe" size="xl" />,
    );
    expect(screen.getByRole("img", { name: "Jane Doe" })).toHaveTextContent("JD");
    expect(container.firstElementChild).toHaveClass(
      "size-88",
      "bg-surface-accent-strong",
      "text-label-lg",
    );
    await expectNoAxeViolations(container);
  });

  it("uses Figma's upload glyph for Icon, with a label", () => {
    const { container } = render(<Avatar variant="icon" label="Add profile photo" size="sm" />);
    expect(screen.getByRole("img", { name: "Add profile photo" })).toHaveAttribute(
      "data-icon",
      "upload",
    );
    expect(container.firstElementChild).toHaveClass("size-36");
  });

  it("sizes the status dot with the avatar and announces it", () => {
    const sizes = { sm: "size-6", md: "size-8", lg: "size-12", xl: "size-16" } as const;
    for (const [size, dot] of Object.entries(sizes)) {
      const { unmount } = render(
        <Avatar
          variant="letter"
          initials="JD"
          name="Jane Doe"
          size={size as keyof typeof sizes}
          status={{ status: "success", label: "Online" }}
        />,
      );
      expect(screen.getByRole("img", { name: "Online" })).toHaveClass(
        dot,
        "absolute",
        "right-0",
        "bottom-0",
      );
      unmount();
    }
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardFeatureByline, initialsOf } from "./card-feature-byline";

describe("CardFeatureByline", () => {
  it("shows the linked author, the reviewer and the dated meta", async () => {
    const { container } = render(
      <CardFeatureByline
        author={{ name: "Jamie Doe", role: "Editor", href: "/authors/jamie" }}
        reviewer={{ name: "Dr. Alex Moreno", role: "Dermatologist" }}
        published="2026-10-14"
        updated="2026-10-22"
        readingMinutes={7}
      />,
    );
    expect(screen.getByRole("link", { name: "Jamie Doe" })).toHaveAttribute(
      "href",
      "/authors/jamie",
    );
    expect(screen.getByText("Dr. Alex Moreno", { exact: false })).toHaveTextContent(
      "Medically reviewed by Dr. Alex Moreno",
    );
    const times = container.querySelectorAll("time");
    expect(times[0]).toHaveAttribute("dateTime", "2026-10-14");
    expect(times[0]).toHaveTextContent("14 Oct 2026");
    expect(times[1]).toHaveAttribute("dateTime", "2026-10-22");
    expect(screen.getByText(/7 min read/)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("hides the reviewer and meta when not given, and formats dates per locale", () => {
    const { container, rerender } = render(<CardFeatureByline author={{ name: "Jamie Doe" }} />);
    expect(screen.queryByText(/reviewed/)).toBeNull();
    expect(container.querySelector("time")).toBeNull();
    rerender(
      <CardFeatureByline author={{ name: "Jamie Doe" }} published="2026-10-14" locale="de" />,
    );
    expect(container.querySelector("time")).toHaveTextContent("14. Okt. 2026");
  });

  it("derives avatar initials", () => {
    expect(initialsOf("Jamie Doe")).toBe("JD");
    expect(initialsOf("Dr. Alex van Moreno")).toBe("DM");
    expect(initialsOf("Cher")).toBe("C");
    expect(initialsOf("Jamie Doe, Senior Editor")).toBe("JD");
  });
});

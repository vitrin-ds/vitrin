import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardFeatureAuthor } from "./card-feature-author";

describe("CardFeatureAuthor", () => {
  it("is a region named by the author with bio and a link to the author page", async () => {
    const { container } = render(
      <CardFeatureAuthor
        name="Jamie Doe, Editor"
        link={{ label: "More from Jamie", href: "/a/jamie" }}
      >
        Ten years of skincare writing.
      </CardFeatureAuthor>,
    );
    expect(screen.getByRole("region", { name: "Jamie Doe, Editor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-title-md");
    expect(screen.getByText("About the author")).toHaveClass("text-text-accent");
    const link = screen.getByRole("link", { name: "More from Jamie" });
    expect(link).toHaveAttribute("href", "/a/jamie");
    expect(link).toHaveClass("px-0", "py-12");
    expect(container.querySelector("[aria-hidden] [role=img]")).toHaveTextContent("JD");
    await expectNoAxeViolations(container);
  });

  it("drops the link when not given and takes a heading level", () => {
    render(
      <CardFeatureAuthor name="Jamie Doe" headingLevel={3}>
        Bio.
      </CardFeatureAuthor>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Jamie Doe" })).toBeInTheDocument();
  });
});

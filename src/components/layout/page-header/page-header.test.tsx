import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Avatar } from "@/components/ui/avatar/avatar";
import { Button } from "@/components/ui/button/button";
import { Link } from "@/components/ui/link/link";
import { PageHeaderCenter, PageHeaderLeft } from "./page-header";

const BREADCRUMB = {
  items: [{ label: "Skincare", href: "/c/skincare" }],
  current: "Serums",
};

describe("PageHeader", () => {
  it("draws only the breadcrumb row without a title", async () => {
    const { container } = render(
      <main>
        <PageHeaderLeft breadcrumb={BREADCRUMB} />
        <h1>Serums</h1>
      </main>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(container.querySelector("header h1")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("renders the breadcrumb and exactly one h1", async () => {
    const { container } = render(
      <main>
        <PageHeaderLeft breadcrumb={BREADCRUMB} title="Serums" subtitle="128 products" />
      </main>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Serums" })).toHaveClass(
      "text-display-sm",
      "text-text-primary",
    );
    expect(screen.getByText("128 products")).toHaveClass("text-label-lg", "text-text-secondary");
    await expectNoAxeViolations(container);
  });

  it("leaves out every slot that isn't given (Figma Show X=false)", () => {
    const { container } = render(<PageHeaderLeft title="About us" />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelector("header")?.children).toHaveLength(1);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("lays out the Left variant as a wrapping row with actions pushed right", async () => {
    const { container } = render(
      <main>
        <PageHeaderLeft
          breadcrumb={BREADCRUMB}
          title="Alfie A."
          subtitle="alfie@example.com"
          avatar={<Avatar variant="letter" initials="AA" name="Alfie A." size="xl" />}
          links={<Link href="/account/profile">View profile</Link>}
          actions={<Button variant="outline">Edit profile</Button>}
        />
      </main>,
    );
    const details = screen.getByRole("heading", { level: 1 }).parentElement?.parentElement;
    expect(details).toHaveClass("flex-wrap", "py-80");
    expect(screen.getByRole("button", { name: "Edit profile" }).parentElement).toHaveClass(
      "tablet:justify-end",
    );
    expect(screen.getByRole("link", { name: "View profile" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("stacks and centres the Center variant", () => {
    render(<PageHeaderCenter title="Alfie A." actions={<Button>Save</Button>} />);
    const details = screen.getByRole("heading", { level: 1 }).parentElement?.parentElement;
    expect(details).toHaveClass("flex-col", "items-center", "text-center", "py-40");
    expect(screen.getByRole("button", { name: "Save" }).parentElement).toHaveClass(
      "justify-center",
    );
  });

  it("uses the page container (max 1440, grid margin)", () => {
    const { container } = render(<PageHeaderLeft title="Help" />);
    expect(container.querySelector("header")).toHaveClass(
      "max-w-(--breakpoint-wide)",
      "px-(--th-grid-margin)",
      "py-12",
    );
  });
});

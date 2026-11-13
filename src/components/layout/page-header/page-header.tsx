import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumb, type BreadcrumbProps } from "@/components/ui/breadcrumb/breadcrumb";
import { Container } from "../container/container";

// Figma `PageHeader.Left` / `PageHeader.Center` (Two-Layer, 02. Components › Layout & Utility):
// the page title block. `.Base.PageHeader.*`: page margin (40 desktop · 16 tablet / mobile, the
// grid margin) · py 12; Breadcrumb on top, then "Page Details" with an optional Avatar, the
// titles (Main Title display-small → the page's one <h1>; Subtitle label-large text-secondary;
// Hyper Links label-large, gap 12, pt 8) and the action buttons.
// - Left: details in a wrapping row, gap 12, py 80; titles fill (min 250), actions pushed right
//   (pl 72 from tablet; on mobile they wrap under the titles, left-aligned).
// - Center: details stacked and centred, gap 12, py 40.
// Figma `Breakpoint` (Default · Tablet · Mobile) is responsive CSS here, not a prop.
// Without a `title` only the breadcrumb row is drawn (Figma 05 Intermediary: PageHeader.Left with
// the Page Details hidden, 44 tall); the page then sets its own h1 below.

export const pageHeaderDetailsVariants = cva("flex gap-12", {
  variants: {
    align: {
      left: "flex-wrap items-center py-80",
      center: "flex-col items-center py-40 text-center",
    },
  },
});

type PageHeaderAlign = NonNullable<VariantProps<typeof pageHeaderDetailsVariants>["align"]>;

/** The `.Base.PageHeader.*` properties, shared by `PageHeaderLeft` and `PageHeaderCenter`. */
export interface PageHeaderProps extends Omit<
  ComponentPropsWithoutRef<"header">,
  "children" | "title"
> {
  /** Figma `Show Breadcrumb` + nested Breadcrumb. Keep it on deep pages (Figma Don't). */
  breadcrumb?: BreadcrumbProps;
  /**
   * Figma `Main Title Text`. Rendered as the page's only <h1>. Leave it out (with a `breadcrumb`)
   * for the breadcrumb row alone, when the page's h1 sits in its content (05 Intermediary).
   */
  title?: ReactNode;
  /** Figma `Subtitle Text`: one line of supporting context (Figma Don't: long subtitles). */
  subtitle?: ReactNode;
  /** Figma `Show Avatar`: an `Avatar` (X-Large) for profile pages; leave it out on content pages. */
  avatar?: ReactNode;
  /** Figma `Hyper Links`: contextual `Link`s ("View profile"). */
  links?: ReactNode;
  /** Figma `Actions`: page-level `Button`s (Outline, Small in Figma). */
  actions?: ReactNode;
}

/** Figma `PageHeader.Left`: details in a row, actions pushed right. */
export function PageHeaderLeft(props: PageHeaderProps) {
  return <PageHeaderFrame {...props} align="left" />;
}

/** Figma `PageHeader.Center`: details stacked and centred. */
export function PageHeaderCenter(props: PageHeaderProps) {
  return <PageHeaderFrame {...props} align="center" />;
}

function PageHeaderFrame({
  align,
  breadcrumb,
  title,
  subtitle,
  avatar,
  links,
  actions,
  className,
  ...props
}: PageHeaderProps & { align: PageHeaderAlign }) {
  const left = align === "left";
  return (
    <Container as="header" {...props} className={cn("bg-surface-primary py-12", className)}>
      {breadcrumb && <Breadcrumb {...breadcrumb} />}
      {title !== undefined && (
        <div className={pageHeaderDetailsVariants({ align })}>
          {avatar && <div className="flex shrink-0">{avatar}</div>}
          <div className={cn("flex flex-col", left ? "min-w-250 flex-1" : "w-full")}>
            <h1 className="text-display-sm text-text-primary">{title}</h1>
            {subtitle && <p className="text-label-lg text-text-secondary">{subtitle}</p>}
            {links && (
              <div className={cn("flex flex-wrap gap-12 pt-8", !left && "justify-center")}>
                {links}
              </div>
            )}
          </div>
          {actions && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-8",
                left ? "min-w-120 flex-1 tablet:justify-end tablet:pl-72" : "justify-center",
              )}
            >
              {actions}
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

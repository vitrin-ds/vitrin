import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FooterCompact } from "./footer-compact";

const meta = {
  title: "Components/Layout & Utility/Footer/Footer Compact",
  component: FooterCompact,
  parameters: {
    layout: "fullscreen",
    // Figma `Footer [Compact]` has one property, Breakpoint (Desktop · Tablet · Mobile). In code
    // it is the viewport, not a prop: the Desktop, Tablet and Mobile stories are its values.
    controls: { disable: true },
    figma: {
      architecture:
        "This component uses a Single-Layer Architecture. It does not have a Base layer.",
      do: [
        "Use on every single-brand page",
        "Keep the product list to the actual catalogue",
        "Separate the footer from content with space, not a colour block",
        "Keep labels grey and right-aligned",
      ],
      dont: [
        "Don't mix it with the system Footer on the same site",
        "Don't add newsletter or customer-service blocks; use the system Footer",
        "Don't hide the logo",
        "Don't add social icon rows; Instagram is a text link",
      ],
    },
    docs: {
      description: {
        component:
          "Compact single-brand footer: wordmark logo (always on) and copyright on the left; product links, page links and contact details on the right, with right-aligned grey labels. Alternative to the system Footer.",
      },
    },
  },
} satisfies Meta<typeof FooterCompact>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Breakpoint=Desktop: wordmark and copyright left, the links column right. */
export const Desktop: Story = {};

/** Breakpoint=Tablet (744). */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: "tablet" } },
};

/** Breakpoint=Mobile (375): wordmark, links and copyright stacked. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

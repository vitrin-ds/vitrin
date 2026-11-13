import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Footer } from "./footer";

const meta = {
  title: "Components/Layout & Utility/Footer/Footer",
  component: Footer,
  args: { onNewsletterSubmit: fn(), onCookieSettings: fn(), year: 2026 },
  parameters: {
    layout: "fullscreen",
    // The Figma Footer has one property, Breakpoint (Desktop · Tablet · Mobile). In code it is
    // the viewport, not a prop: the Desktop, Tablet and Mobile stories are its values. The
    // Footer is a composition, so there is no control. Only the Asset Footer Link Item has
    // State, Label Text and Show Right Icon.
    controls: { disable: true },
    figma: {
      architecture:
        "This component uses a Single-Layer Architecture. It does not have a Base layer.",
      do: [
        "Keep navigation link groups organized by clear categories (Shop, Company, Help & Support)",
        "Include all accepted payment method icons to build trust at the point of decision",
        "Keep the newsletter section concise with a clear value proposition (e.g., discount incentive)",
        "Include legal links (Terms of Service, Privacy Policy) and copyright in the bottom bar",
      ],
      dont: [
        "Don't overload with too many link groups — 3–4 columns is optimal for scannability",
        "Don't hide contact information — it reinforces trust and accessibility",
        "Don't omit the Terms of Use & Privacy Policy consent text below the newsletter signup",
        "Don't use social media icons without linking to active, maintained profiles",
      ],
    },
    docs: {
      description: {
        component:
          "The site-wide footer providing contact information, newsletter signup, navigation link groups, payment methods, social media links, and legal information.",
      },
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fluid: four contact columns and link columns beside the newsletter from 1024px. */
export const Desktop: Story = {};

/** 744: three contact columns, link columns under the newsletter. */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: "tablet" }, controls: { disable: true } },
};

/** 375: stacked contacts, link groups as Accordions, centred payment and legal rows. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" }, controls: { disable: true } },
};

/** Without `onNewsletterSubmit` the form is left out. */
export const WithoutNewsletter: Story = { args: { onNewsletterSubmit: undefined } };

/** Invalid address, then a valid one; Cookie settings calls its handler. */
export const Interaction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "not-an-email{Enter}");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "name@example.com{Enter}");
    await expect(args.onNewsletterSubmit).toHaveBeenCalledWith("name@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Cookie settings" }));
    await expect(args.onCookieSettings).toHaveBeenCalledOnce();
  },
};

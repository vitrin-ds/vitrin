import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeaderMinimal } from "@/components/layout/header/header-minimal";
import { HeroFullBleed } from "./hero-full-bleed";

const meta = {
  title: "Patterns/Promotions/Hero Full Bleed",
  component: HeroFullBleed,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-bleed hero: image fill, transparent minimal header, copy top-right, oversized wordmark (an SVG) bottom-left. Swap the fill for the hero image.",
      },
    },
  },
  args: {
    headline: "Body care that turns\na shower into a ritual",
    body: "Inspired by Turkish hammam rituals and made with clay, rose and olive oil for soft, glowing skin.",
    link: { label: "+  Shop now", href: "#shop" },
    logo: { src: "/brand/lunara/logo.svg", alt: "lunara", width: 582, height: 171 },
    scrollHint: "Scroll down",
    header: (
      <HeaderMinimal
        tone="inverse"
        links={[
          { id: "story", label: "Our story", href: "#story" },
          { id: "shop", label: "Shop", href: "#shop" },
        ]}
        action={{ id: "cart", label: "Cart (0)", href: "#cart" }}
      />
    ),
  },
} satisfies Meta<typeof HeroFullBleed>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

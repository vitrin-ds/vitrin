import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { cn } from "@/lib/cn";
import { HeaderMinimal, type HeaderMinimalProps } from "./header-minimal";

const LINKS = [
  { id: "story", label: "Our story", href: "/about" },
  { id: "shop", label: "Shop", href: "/shop" },
];

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Header [Minimal]",
  args: { tone: "default" },
  render: ({ tone }: Pick<HeaderMinimalProps, "tone">) => (
    <div className={cn("p-16", tone === "inverse" ? "bg-surface-accent" : "bg-surface-primary")}>
      <HeaderMinimal
        tone={tone}
        links={LINKS}
        action={{ id: "cart", label: "Cart (0)", href: "/cart" }}
      />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
    controls: { include: ["tone"] },
    docs: {
      description: {
        component:
          "A stripped-down header containing brand identity and minimal user actions, without navigation or search. Used in focused conversion flows such as login, registration, and checkout to minimize cognitive load.",
      },
    },
  },
  argTypes: {
    tone: {
      description: "Figma `Tone`.",
      control: "inline-radio",
      options: ["default", "inverse"],
      table: { type: { summary: '"default" | "inverse"' }, defaultValue: { summary: "default" } },
    },
  },
} satisfies Meta<Pick<HeaderMinimalProps, "tone">>;

export default meta;
type Story = StoryObj<Pick<HeaderMinimalProps, "tone">>;

/** The Figma default. */
export const Default: Story = {};

/** Figma `Tone=Inverse`: on a dark image or accent surface. */
export const Inverse: Story = { args: { tone: "inverse" } };

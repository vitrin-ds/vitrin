import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "./icon";
import { ICON_NAMES, type IconName } from "./icon-names";

type Args = { name: IconName; weight: 400 | 200; fill: boolean };

const WEIGHTS = [400, 200] as const;

const meta = {
  title: "Foundations/Icons/Icon",
  // Each Figma icon is its own component set (`name`) with two variant properties, Weight and Fill.
  // Size and colour are not component properties: size is the instance size, colour a bound
  // icon/* variable.
  args: { name: "location_on", weight: 400, fill: false },
  render: ({ name, weight, fill }) => <Icon name={name} weight={weight} fill={fill} />,
  parameters: {
    // The Figma properties: the icon (component set name), Weight, Fill.
    controls: { include: ["name", "weight", "fill"] },
    figma: {
      do: [
        "Use 20px icons in UI and keep their 4px grid alignment",
        "Use Fill On only to signal an active or selected state",
        "Pair icon-only actions with an aria-label",
        "Use the Icon/* size tokens when resizing",
      ],
      dont: [
        "Don't scale icons to sizes outside the scale",
        "Don't mix Weight 200 and 400 in the same toolbar",
        "Don't recolour social or payment logos",
        "Don't create icons that aren't in Material Symbols without design review",
      ],
    },
    docs: {
      description: {
        component: "Icons use Material Symbols Rounded on a 20px grid.",
      },
    },
  },
  argTypes: {
    name: {
      description: "Figma icon name: the component set, snake_case, identical to Material Symbols.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" } },
    },
    weight: {
      description: "Figma `Weight`: 400 by default; 200 for large decorative icons (28–40).",
      control: "inline-radio",
      options: WEIGHTS,
      table: { type: { summary: "400 | 200" }, defaultValue: { summary: "400" } },
    },
    fill: {
      description:
        "Figma `Fill` (Off · On): Off by default; On for the active or selected state. The code default is On.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** One icon from the Figma set. */
export const Default: Story = {};

/** Mirrors a Figma icon cell: Weight=400/200 × Fill=On/Off. */
export const WeightAndFill: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex gap-12">
      <Icon {...args} weight={400} fill />
      <Icon {...args} weight={400} fill={false} />
      <Icon {...args} weight={200} fill />
      <Icon {...args} weight={200} fill={false} />
    </div>
  ),
};

/** The Icon/* size scale. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-end gap-24">
      {(["sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <span key={size} className="flex flex-col items-center gap-8">
          <Icon {...args} size={size} />
          <span className="text-label-sm text-text-secondary">{size}</span>
        </span>
      ))}
    </div>
  ),
};

/** The icon/* colour tokens. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-16">
      {(
        [
          "accent",
          "primary",
          "secondary",
          "assistive",
          "success",
          "warning",
          "error",
          "info",
          "disabled",
        ] as const
      ).map((tone) => (
        <span key={tone} className="flex flex-col items-center gap-8">
          <Icon {...args} tone={tone} />
          <span className="text-label-sm text-text-secondary">{tone}</span>
        </span>
      ))}
      <span className="flex flex-col items-center gap-8 rounded-4 bg-surface-accent p-4">
        <Icon {...args} tone="on-accent" />
        <span className="text-label-sm text-text-on-accent">on-accent</span>
      </span>
    </div>
  ),
};

/** Every icon in the Figma set (the font is subset to exactly these). */
export const AllIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="grid grid-cols-2 gap-8 tablet:grid-cols-4 desktop:grid-cols-6">
      {ICON_NAMES.map((name) => (
        <li
          key={name}
          className="flex items-center gap-8 rounded-8 border border-border-default p-8"
        >
          <Icon name={name} />
          <Icon name={name} fill={false} />
          <span className="truncate text-label-sm text-text-secondary">{name}</span>
        </li>
      ))}
    </ul>
  ),
};

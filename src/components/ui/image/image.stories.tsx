import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Image } from "./image";

const meta = {
  title: "Foundations/Image",
  component: Image,
  args: {
    src: "/dev/sample-square.webp",
    alt: "Placeholder product shot",
    sizes: "270px",
    ratio: "1/1",
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

const productWidth = (Story: () => React.ReactNode) => <div className="w-270">{Story()}</div>;

/** The default 1/1 frame, as a product shot on white. */
export const Square: Story = { decorators: [productWidth] };

/** Every ratio of the frame. */
export const Ratios: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-2 gap-16 desktop:grid-cols-3">
      {(["1/1", "4/5", "3/4", "4/3", "3/2", "16/9"] as const).map((ratio) => (
        <figure key={ratio} className="flex flex-col gap-8">
          <Image
            {...args}
            alt={args.alt}
            src={
              ratio === "1/1" || ratio === "4/5" || ratio === "3/4"
                ? args.src
                : "/dev/sample-wide.webp"
            }
            ratio={ratio}
            sizes="(min-width: 1024px) 33vw, 50vw"
          />
          <figcaption className="text-label-md text-text-secondary">{ratio}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** `card`: Card.Product.Vertical's image area, 200 tall at any width; the image covers it. */
export const CardFrame: Story = {
  args: { ratio: "card", fit: "cover" },
  decorators: [productWidth],
};

/**
 * `surface="none"`: no skeleton fill, so a transparent cut-out sits on the surface behind it
 * (product cards: surface-secondary here). The default `skeleton` fill is on the left.
 */
export const TransparentCutOut: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex gap-16">
      {(["skeleton", "none"] as const).map((surface) => (
        <figure key={surface} className="flex w-270 flex-col gap-8 rounded-8 bg-surface-secondary">
          <Image
            {...args}
            alt={args.alt}
            src="/dev/sample-square.webp"
            ratio="card"
            surface={surface}
            sizes="270px"
          />
          <figcaption className="px-12 pb-12 text-label-md text-text-secondary">
            {surface}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** `contain` keeps a product shot uncropped inside a wide frame. */
export const Contain: Story = {
  args: { ratio: "16/9", fit: "contain" },
  decorators: [productWidth],
};

/** Before the image arrives the frame holds its size and shows the placeholder surface. */
export const Placeholder: Story = {
  args: { src: "/dev/does-not-exist.webp", alt: "" },
  decorators: [productWidth],
};

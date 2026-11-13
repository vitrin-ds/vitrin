import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button/button";
import { DESKTOP_QUERY } from "@/lib/use-is-desktop";
import { QUICK_VIEW_PRODUCT, QUICK_VIEW_PRODUCT_ON_SALE } from "./quick-view.fixtures";
import { QuickView, type QuickViewProps } from "./quick-view";

const noop = () => undefined;
const addToBag: QuickViewProps["onAddToBag"] = () => undefined;

const nativeMatchMedia = globalThis.matchMedia;

/**
 * The docs column is narrower than the desktop breakpoint, so without this every example would
 * show the Bottom Sheet. Each story states which layout it documents; stories only.
 */
function forceMatchMedia(desktop: boolean) {
  window.matchMedia = (query) =>
    query === DESKTOP_QUERY
      ? ({
          matches: desktop,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList)
      : nativeMatchMedia.call(window, query);
}

function restoreMatchMedia() {
  window.matchMedia = nativeMatchMedia;
}

function ForceLayout({ desktop, children }: { desktop: boolean; children: ReactNode }) {
  forceMatchMedia(desktop);
  useEffect(() => restoreMatchMedia, []);
  return children;
}

const MOBILE_STORY = {
  decorators: [
    (Story: () => ReactNode) => (
      <ForceLayout desktop={false}>
        <Story />
      </ForceLayout>
    ),
  ],
  // Tall enough for the whole sheet in the docs column.
  parameters: { docs: { story: { inline: false, iframeHeight: 900 } } },
};

const meta = {
  title: "Patterns/Discovery/Quick View",
  component: QuickView,
  args: { open: true, onClose: noop, product: QUICK_VIEW_PRODUCT, onAddToBag: addToBag },
  render: (args) => <Opener {...args} />,
  decorators: [
    (Story) => (
      <ForceLayout desktop>
        <Story />
      </ForceLayout>
    ),
  ],
  parameters: {
    // A composition pattern: the Figma page has no property table, so no controls.
    controls: { disable: true },
    figma: {
      architecture:
        "Composition pattern: assembled from library components, no base layer of its own.",
      do: [
        "Open from a clearly labelled button on the card",
        "Keep variant selection and add-to-bag",
        "Link to the full product page",
        "Return focus to the card when closed",
      ],
      dont: [
        "Don't open on hover",
        "Don't replicate the full product page",
        "Don't navigate away on add-to-bag",
        "Don't nest another dialog inside",
      ],
    },
    docs: {
      story: { inline: false, iframeHeight: 640 },
      description: {
        component:
          "A dialog opened from a product card that shows the key product information and lets the user choose a variant and add to bag without leaving the list. Dialog (8 columns) on desktop, bottom sheet on mobile.",
      },
    },
  },
} satisfies Meta<typeof QuickView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens from a clearly labelled button (Figma Do) and returns focus to it on close. */
function Opener(props: QuickViewProps) {
  const [open, setOpen] = useState(props.open);
  return (
    <>
      <Button
        variant="outline"
        aria-label={`Quick view: ${props.product.name}`}
        onClick={() => setOpen(true)}
      >
        Quick view
      </Button>
      <QuickView {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Desktop (≥ 1024): a 904px modal. */
export const Default: Story = { args: { defaultVariant: "50" } };

/** No variant picked yet: Add to bag asks for one. */
export const NoVariantSelected: Story = {};

/** On sale, no variants, a long name. */
export const OnSale: Story = { args: { product: QUICK_VIEW_PRODUCT_ON_SALE } };

/** The owner rejects: the error shows under the button. */
export const AddFails: Story = {
  args: { defaultVariant: "30", onAddToBag: () => Promise.reject(new Error("Out of stock")) },
};

/** Below the desktop breakpoint the dialog becomes a Bottom Sheet with a full-width Add to bag. */
export const Mobile: Story = { ...MOBILE_STORY, args: { defaultVariant: "50" } };

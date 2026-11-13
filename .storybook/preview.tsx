import type { Preview } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { fontVariables } from "../src/lib/fonts";
import { DocsPage } from "./docs-page";
import "../src/styles/globals.css";

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Colour theme (<html data-theme>)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        root.classList.add(...fontVariables.split(" "));
      }, [theme]);
      return (
        <div className="bg-bg-primary text-text-primary">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    docs: { page: DocsPage },
    // The Figma file's order.
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Color", "Typography", "Spacing & Grid", "Shadows & Effects", "Icons", "Empty States"],
          "Components",
          [
            "Actions",
            "Inputs",
            [
              "Text Input",
              "Text Area",
              "Checkbox",
              "Radio",
              "Dropdown",
              "Stepper",
              "Sliders",
              ["Standard Slider", "Range Slider"],
              "Date Picker",
              "Rating",
              "File Upload",
            ],
            "Feedback",
            [
              "Toast",
              "Alert",
              "Action Banner",
              "Dialogs",
              "Tooltip",
              "Spinner",
              "Progress Bar",
              ["Progress", "Progress with Steps"],
              "Password Strength",
              "Skeleton",
              "Feedback Prompt",
            ],
            "Status & Indicators",
            "Navigation",
            [
              "Tabs",
              ["Horizontal Tab", "Vertical Tab"],
              "Breadcrumb",
              "Table of Contents",
              "Pagination",
              "Header & Navigation Bar",
              [
                "Header Top Bar",
                "Main Header [Search]",
                "Main Header [Compact]",
                "Navigation Bar",
                "Header [Minimal]",
                "Navigation Drawer",
              ],
              "Mega Menu",
              [
                "Link Item",
                "Title Item",
                "Links Only",
                "Subcategory Showcase",
                "Trending Product Showcase",
                "Trending Brand Showcase",
              ],
              "Bottom Navigation",
              "Toolbar (Top)",
              [
                "Toolbar Top Title",
                "Toolbar Top Search",
                "Toolbar Sheet Title",
                "Toolbar PopUp Title",
                "Toolbar SidePanel Title",
              ],
            ],
            "Data Display",
            ["Table", "List", "Accordion", "Callout", "Step List", "Avatar", "Carousel Slider"],
            "Layout & Utility",
            [
              "Divider",
              "Spacer",
              "Page Header",
              ["Page Header Left", "Page Header Center"],
              "Footer",
              ["Footer", "Footer Compact"],
              "Action Bar (Bottom)",
              "Sheet",
              ["Bottom Sheet", "Right Sheet"],
              "Pop Up",
            ],
          ],
          "Patterns",
          [
            "Discovery",
            [
              "Product Cards",
              [
                "Product Card Horizontal",
                "Product Card Vertical",
                "Product Card Vertical Small",
                "Product Card Vertical Featured",
                "Product Card Minimal",
              ],
              "Category Cards",
              [
                "Category Card Vertical Featured",
                "Category Card Vertical",
                "Category Card Horizontal",
                "Category Card Horizontal Small",
                "Category Card Square Small",
                "Category Card Chip Type",
                "Category Card Circle",
              ],
              "Content Cards",
              ["Content Card Compact", "Content Card Detailed"],
              "Tactical Feature Cards",
              [
                "Feature Card Icon",
                "Feature Card Byline",
                "Feature Card Author",
                "Feature Card Store",
                "Opening Hours",
              ],
              "Carousel Slider",
              "Product Grid & List View",
              "Quick View",
              "Compare Products",
            ],
            "Search Filtering",
            ["Search & Auto Complete"],
            "Account & Cart & Checkout",
            [
              "Cart Items",
              ["Cart Item Compact", "Cart Item Detailed"],
              "Address Card",
              "Payment Method Cards",
              ["Payment Method Extended", "Payment Method Minimal"],
              "Gift & Rewards",
              ["Gift Card", "Rewards Card", "Coupon Card"],
              "Order Summary",
            ],
            "Order Management",
            [
              "Order History",
              ["Order History Card", "Order History Empty"],
              "Order Detail",
              "Order Tracking",
              ["Order Tracking", "Order Timeline", "Shipment Tracking"],
            ],
            "Social Proof & Reviews",
            "Promotions & Marketing",
            "Notifications & Communication",
            "Other",
          ],
        ],
      },
    },
    layout: "padded",
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Every story runs axe and must have zero violations.
    a11y: { test: "error" },
  },
};

export default preview;

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { SearchAutocomplete } from "./search-autocomplete";
import { SEARCH_FIXTURE_FIRST_FOCUS, filterSearchFixture } from "./search.fixtures";

const FIRST_FOCUS = SEARCH_FIXTURE_FIRST_FOCUS;
const filter = filterSearchFixture;

const meta = {
  title: "Patterns/Search Filtering/Search & Auto Complete",
  component: SearchAutocomplete,
  args: {
    label: "Search products",
    placeholder: "Search products, brands and more",
    options: FIRST_FOCUS,
    onSelect: () => {},
    onSubmit: (_query, event) => event.preventDefault(),
  },
  parameters: {
    // The Figma page documents the Search Suggestion List: its rows are the `options` here, so
    // Show Main Title, Title Text, Show Right and Right Icon are not props of this component.
    controls: { disable: true },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use a consistent Right Icon per suggestion type — recent-search for history, a trending mark for popular queries, a diagonal arrow to insert the term into the search field",
        "Keep Title Text to a single line; truncate long queries with an ellipsis rather than wrapping",
        "Provide a Focus state so the list is fully keyboard-navigable from the search input",
        "Group suggestion types (recent, popular, categories) with headers when mixing them in one list",
      ],
      dont: [
        "Don't hide Show Main Title — the label is the entire purpose of the row",
        "Don't use the Right Icon as a separate action target; the whole row is the tap target",
        "Don't wrap or clamp to two lines — suggestions must stay scannable at a glance",
        "Don't leave the placeholder error string as Title Text; it reads as a failure state, not a suggestion",
      ],
    },
    docs: {
      description: {
        component:
          "A single suggestion row within the search autocomplete dropdown — a query or category the user can tap to complete their search, with an optional trailing icon.",
      },
    },
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  // Fluid: the field fills its column up to the Figma header width (680), with room for the panel.
  decorators: [
    (Story) => (
      <div className="min-h-640 w-full max-w-680">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchAutocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed, compact header field (Text Input Small). */
export const Default: Story = {};

/** Type to filter: a working demo with the caller filtering `options` (controlled query). */
export const Interactive: Story = {
  render: function Render(args) {
    const [query, setQuery] = useState("");
    return (
      <SearchAutocomplete
        {...args}
        value={query}
        onQueryChange={setQuery}
        options={filter(query)}
      />
    );
  },
};

/** Keyword entered, grouped suggestions with the term in bold. */
export const KeywordEntered: Story = {
  args: { defaultValue: "face", options: filter("face") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Search products" });
    await userEvent.click(input);
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("group", { name: "Suggested products" })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(input).toHaveAttribute(
      "aria-activedescendant",
      canvas.getByRole("option", { name: "face protective sunscreen" }).id,
    );
  },
};

/** The panel on first focus, before typing. */
export const FirstFocus: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    await userEvent.click(input);
    await expect(input).toHaveAttribute("aria-expanded", "true");
  },
};

/** Waiting for suggestions: spinner in the panel, "Loading suggestions" announced. */
export const Loading: Story = {
  args: { defaultValue: "serum", options: [], loading: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
  },
};

/** On a page (e.g. 15.03 Help search): Medium field with a visible label. */
export const PageField: Story = {
  args: {
    label: "Search the Help Centre",
    showLabel: true,
    size: "md",
    action: "/help/search",
    placeholder: "Search for answers",
    options: [],
  },
};

/** The three Text Input sizes. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-16">
      <SearchAutocomplete {...args} size="sm" label="Search, small" id="search-sm" />
      <SearchAutocomplete {...args} size="md" label="Search, medium" id="search-md" />
      <SearchAutocomplete {...args} size="lg" label="Search, large" id="search-lg" />
    </div>
  ),
};

/** In the accent Main Header [Search] bar, as the header's `search` slot. */
export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-640 w-full bg-surface-accent px-16 py-16">
        <div className="mx-auto w-full max-w-680">
          <Story />
        </div>
      </div>
    ),
  ],
  render: function Render(args) {
    const [query, setQuery] = useState("");
    return (
      <SearchAutocomplete
        {...args}
        value={query}
        onQueryChange={setQuery}
        options={filter(query)}
      />
    );
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Avatar } from "../avatar/avatar";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { DataTable, type DataTableAlignment } from "./data-table";

const meta = {
  title: "Components/Data Display/Table",
  component: DataTable,
  args: {
    caption: "Moisturiser texture by skin type",
    columns: ["Skin type", "Texture", "Look for"],
    rows: [
      ["Oily", "Gel or gel-cream", "Niacinamide, light humectants"],
      ["Combination", "Light lotion", "Hyaluronic acid, glycerin"],
      ["Dry", "Rich cream", "Ceramides, shea butter"],
      ["Sensitive", "Fragrance-free cream", "Panthenol, oat extract"],
    ],
  },
  parameters: {
    // The texts as data. The other Table Header and Table Cell properties: the Properties story.
    controls: { include: ["columns", "rows"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Text Left alignment for text-heavy columns",
        "Use Text Right alignment for numeric/currency columns",
        "Use the right icon to indicate sortable columns",
        "Use the left icon for bulk selection when the table supports it",
        "Match cell alignment with its corresponding Table Header alignment",
        "Use the Checkbox for bulk-selection rows alongside the Table Header's left icon",
        "Keep Title Text concise — offload details to the Description line",
        "Use Status Dot to convey row-level states (active, pending, error)",
      ],
      dont: [
        "Don't hide the header label — columns should always be identifiable",
        "Don't use center alignment as default — left or right alignment improves scannability",
        "Don't show sort icons on non-sortable columns",
        "Don't enable bulk selection icon unless the table rows support selection",
        "Don't enable all content slots at once — show only what the column requires",
        "Don't mix alignment styles within the same column",
        "Don't use Avatar and Status together unless they represent different data points",
        "Don't use Left Icon and Checkbox simultaneously — choose one selection pattern per table",
      ],
    },
    docs: {
      description: {
        component:
          "A column header cell for data tables, displaying a label with optional leading and trailing icons for features like selection and sorting. The data cell for table rows supports rich content combinations including selection controls, status indicators, avatars, text pairs, and trailing icons.",
      },
    },
  },
  argTypes: {
    columns: {
      description: "Figma `Header Label Text` of each Table Header: the column header text.",
      control: "object",
      table: { type: { summary: "string[]" } },
    },
    rows: {
      description:
        "Figma `Title Text` of each Table Cell: the cell content, one array per row in column order.",
      control: "object",
      table: { type: { summary: "string[][]" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-790">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

type PropertyArgs = {
  headerAlignment: DataTableAlignment;
  cellAlignment: DataTableAlignment;
  headerLabelText: string;
  titleText: string;
  descriptionText: string;
  headerLeftIcon: IconName;
  headerRightIcon: IconName;
  cellLeftIcon: IconName;
  cellRightIcon: IconName;
  showHeaderText: boolean;
  showHeaderLeftIcon: boolean;
  showHeaderRightIcon: boolean;
  showCheckbox: boolean;
  showCellLeftIcon: boolean;
  showStatus: boolean;
  showAvatar: boolean;
  showTexts: boolean;
  showTitleText: boolean;
  showDescription: boolean;
  showCellRightIcon: boolean;
};

/** The Figma properties of Table Header and Table Cell, at their defaults, on every column and row. */
export const Properties: StoryObj<PropertyArgs> = {
  args: {
    headerAlignment: "left",
    showHeaderText: true,
    headerLabelText: "Table Header",
    showHeaderLeftIcon: true,
    headerLeftIcon: "check_box",
    showHeaderRightIcon: true,
    headerRightIcon: "keyboard_arrow_down",
    cellAlignment: "left",
    showCheckbox: true,
    showCellLeftIcon: true,
    cellLeftIcon: "radio_button_unchecked",
    showStatus: true,
    showAvatar: true,
    showTexts: true,
    showTitleText: true,
    titleText: "Table Cell",
    showDescription: true,
    descriptionText: "Description",
    showCellRightIcon: true,
    cellRightIcon: "radio_button_unchecked",
  },
  parameters: {
    controls: {
      include: [
        "headerAlignment",
        "showHeaderText",
        "headerLabelText",
        "showHeaderLeftIcon",
        "headerLeftIcon",
        "showHeaderRightIcon",
        "headerRightIcon",
        "cellAlignment",
        "showCheckbox",
        "showCellLeftIcon",
        "cellLeftIcon",
        "showStatus",
        "showAvatar",
        "showTexts",
        "showTitleText",
        "titleText",
        "showDescription",
        "descriptionText",
        "showCellRightIcon",
        "cellRightIcon",
      ],
    },
  },
  argTypes: {
    headerAlignment: {
      description: "Figma Table Header `Alignment`.",
      control: "inline-radio",
      options: ["left", "center", "right"],
      table: { type: { summary: "DataTableAlignment" }, defaultValue: { summary: "left" } },
    },
    showHeaderText: {
      description: "Figma `Show Header Text`. In code: `hideLabel`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    headerLabelText: {
      description: "Figma `Header Label Text`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Table Header" } },
    },
    showHeaderLeftIcon: {
      description: "Figma Table Header `Show Left Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    headerLeftIcon: {
      description: "Figma Table Header `Left Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showHeaderLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "check_box" } },
    },
    showHeaderRightIcon: {
      description: "Figma Table Header `Show Right Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    headerRightIcon: {
      description: "Figma Table Header `Right Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showHeaderRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_down" } },
    },
    cellAlignment: {
      description: "Figma Table Cell `Alignment`.",
      control: "inline-radio",
      options: ["left", "center", "right"],
      table: { type: { summary: "DataTableAlignment" }, defaultValue: { summary: "left" } },
    },
    showCheckbox: {
      description: "Figma `Show Checkbox`. In code: `checkbox`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showCellLeftIcon: {
      description: "Figma Table Cell `Show Left Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    cellLeftIcon: {
      description: "Figma Table Cell `Left Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showCellLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
    showStatus: {
      description: "Figma `Show Status`. In code: `status`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showAvatar: {
      description: "Figma `Show Avatar`. In code: `avatar`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTexts: {
      description: "Figma `Show Texts`: the title and the description.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTitleText: {
      description: "Figma `Show Title Text`.",
      control: "boolean",
      if: { arg: "showTexts" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`.",
      control: "text",
      if: { arg: "showTexts" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Table Cell" } },
    },
    showDescription: {
      description: "Figma `Show Description`.",
      control: "boolean",
      if: { arg: "showTexts" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    descriptionText: {
      description: "Figma `Description Text`.",
      control: "text",
      if: { arg: "showTexts" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Description" } },
    },
    showCellRightIcon: {
      description: "Figma Table Cell `Show Right Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    cellRightIcon: {
      description: "Figma Table Cell `Right Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showCellRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
  },
  render: (args) => {
    const column = (n: number) => ({
      label: `${args.headerLabelText} ${n}`,
      hideLabel: !args.showHeaderText,
      align: args.headerAlignment,
      leftIcon: args.showHeaderLeftIcon ? args.headerLeftIcon : undefined,
      rightIcon: args.showHeaderRightIcon ? args.headerRightIcon : undefined,
    });
    const cell = (row: number, n: number) => ({
      align: args.cellAlignment,
      title: args.showTexts && args.showTitleText ? args.titleText : undefined,
      description: args.showTexts && args.showDescription ? args.descriptionText : undefined,
      leftIcon: args.showCellLeftIcon ? args.cellLeftIcon : undefined,
      rightIcon: args.showCellRightIcon ? args.cellRightIcon : undefined,
      status: args.showStatus ? { status: "success" as const, label: "Active" } : undefined,
      avatar: args.showAvatar ? (
        <Avatar variant="photo" size="sm" src="/dev/sample-square.webp" alt="Jane Doe" />
      ) : undefined,
      checkbox: args.showCheckbox
        ? { label: `Select row ${row}, column ${n}`, defaultChecked: true }
        : undefined,
    });
    return (
      <DataTable
        caption="Table properties"
        columns={[column(1), column(2)]}
        rows={[1, 2].map((row) => [cell(row, 1), cell(row, 2)])}
      />
    );
  },
};

/** Figma `DataTable` (Journal 13.02 Step 3: Hydrate): header row on surface-tertiary. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(3);
  },
};

/** Visible caption and row headers (first column heads its row). */
export const CaptionAndRowHeaders: Story = { args: { showCaption: true, rowHeaders: true } };

/** Narrow container: the table keeps its minimum width and scrolls sideways. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  OPENING_HOURS_LABELS,
  OpeningHours,
  OpeningHoursRow,
  type OpeningHoursDay,
  type Weekday,
} from "./opening-hours";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  titleText: string;
  showNote: boolean;
  noteText: string;
  /** Not Figma properties: the rows (`.OpeningHours.Row` Day Text, Hours Text, Type=Today). */
  days: readonly OpeningHoursDay[];
  today?: Weekday;
};

const WEEK: readonly OpeningHoursDay[] = [
  { day: "monday", opens: "09:00", closes: "20:00" },
  { day: "tuesday", opens: "09:00", closes: "20:00" },
  { day: "wednesday", opens: "09:00", closes: "20:00" },
  { day: "thursday", opens: "09:00", closes: "21:00" },
  { day: "friday", opens: "09:00", closes: "21:00" },
  { day: "saturday", opens: "10:00", closes: "20:00" },
  { day: "sunday", opens: "11:00", closes: "17:00" },
];

const meta = {
  title: "Patterns/Discovery/Tactical Feature Cards/Opening Hours",
  // The defaults of Figma's `OpeningHours`.
  args: {
    titleText: "Opening hours",
    showNote: true,
    noteText: "Holiday hours may vary. Boxing Day: 10:00 – 18:00.",
    days: WEEK,
    today: "tuesday",
  },
  render: ({ titleText, showNote, noteText, days, today }) => (
    <OpeningHours
      days={days}
      today={today}
      note={showNote ? noteText : undefined}
      labels={{ ...OPENING_HOURS_LABELS, title: titleText }}
    />
  ),
  parameters: {
    // Single-Layer: the Figma properties are on the component: Title Text, Show Note, Note Text.
    controls: { include: ["titleText", "showNote", "noteText"] },
    figma: {
      architecture:
        "Single-Layer component: no base layer, properties are on the component itself.",
      do: [
        "Highlight exactly one row as Today",
        "Use 24-hour times with an en dash",
        "Write 'Closed' instead of leaving hours empty",
        "Mirror the data in LocalBusiness openingHours schema",
      ],
      dont: [
        "Don't abbreviate weekdays on desktop",
        "Don't hide holiday exceptions",
        "Don't mix 12h and 24h formats",
        "Don't use colour alone for Today",
      ],
    },
    docs: {
      description: {
        component:
          "Weekly opening hours for a store, with today's row highlighted and an optional holiday note.",
      },
    },
  },
  argTypes: {
    titleText: {
      description: "Figma `Title Text`. In code: `labels.title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Opening hours" } },
    },
    showNote: {
      description: "Figma `Show Note`. In code: pass `note`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    noteText: {
      description: "Figma `Note Text`. In code: `note`.",
      control: "text",
      if: { arg: "showNote" },
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Holiday hours may vary. Boxing Day: 10:00 – 18:00." },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The week of a store with Tuesday as Today and the holiday note. */
export const Default: Story = {};

/** A closed day reads "Closed"; no note (Figma `Show Note` off). */
export const ClosedDay: Story = {
  args: {
    days: [...WEEK.slice(0, 6), { day: "sunday" }],
    today: "sunday",
    showNote: false,
  },
};

/** Figma `.OpeningHours.Row`: Type Default and Today. */
export const Rows: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <dl className="flex flex-col gap-12">
      <OpeningHoursRow day="Monday" hours="09:00 – 20:00" />
      <OpeningHoursRow day="Monday" hours="09:00 – 20:00" type="today" />
    </dl>
  ),
};

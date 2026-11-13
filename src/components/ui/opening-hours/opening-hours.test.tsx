import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { OpeningHours, type OpeningHoursDay } from "./opening-hours";

const WEEK: readonly OpeningHoursDay[] = [
  { day: "monday", opens: "09:00", closes: "20:00" },
  { day: "tuesday", opens: "9:00", closes: "20:30" },
  { day: "wednesday", opens: "09:00", closes: "20:00" },
  { day: "thursday", opens: "09:00", closes: "21:00" },
  { day: "friday", opens: "09:00", closes: "21:00" },
  { day: "saturday", opens: "10:00", closes: "20:00" },
  { day: "sunday" },
];

describe("OpeningHours", () => {
  it("is a titled section with one dt/dd pair per weekday", async () => {
    const { container } = render(<OpeningHours days={WEEK} today="tuesday" note="Holiday note" />);
    expect(screen.getByRole("region", { name: "Opening hours" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Opening hours" })).toBeInTheDocument();
    const terms = container.querySelectorAll("dt");
    expect(terms).toHaveLength(7);
    expect(terms[0]).toHaveTextContent("Monday");
    expect(container.querySelectorAll("dd")[1]).toHaveTextContent("09:00 – 20:30");
    expect(container.querySelectorAll("dd")[6]).toHaveTextContent("Closed");
    expect(screen.getByText("Holiday note")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("marks exactly today's row with text and the tinted surface", () => {
    const { container } = render(<OpeningHours days={WEEK} today="tuesday" />);
    const todayChips = screen.getAllByText("Today");
    expect(todayChips).toHaveLength(1);
    const row = container.querySelectorAll("dl > div")[1] as HTMLElement;
    expect(row).toHaveClass("bg-surface-secondary", "text-title-sm");
    expect(within(row).getByText("Tuesday")).toBeInTheDocument();
    expect(container.querySelectorAll("dl > div")[0]).toHaveClass("text-body-md");
  });

  it("follows the locale for weekday names and has no note by default", () => {
    render(<OpeningHours days={WEEK} locale="de-DE" headingLevel={3} />);
    expect(screen.getByText("Montag")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("Today")).toBeNull();
  });
});

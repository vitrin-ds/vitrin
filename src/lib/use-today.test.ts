import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { isoToDate, localToday, useToday } from "./use-today";

describe("useToday", () => {
  it("is the viewer's date in the browser", () => {
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe(localToday());
  });

  it("reads no clock on the server", () => {
    function Probe() {
      return createElement("span", null, useToday() ?? "none");
    }
    expect(renderToString(createElement(Probe))).toBe("<span>none</span>");
  });

  it("formats local dates and reads them back as UTC midnight", () => {
    expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(isoToDate("2026-01-05").toISOString()).toBe("2026-01-05T00:00:00.000Z");
  });
});

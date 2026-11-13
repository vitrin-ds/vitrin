import { describe, expect, it } from "vitest";
import { joinPhone, splitPhone } from "./phone";

describe("phone", () => {
  it("splits on the longest matching code and joins back", () => {
    expect(splitPhone("+44 7700 900245")).toEqual({ country: "GB", number: "7700 900245" });
    expect(splitPhone("+353 1 234 5678")).toEqual({ country: "IE", number: "1 234 5678" });
    expect(joinPhone("DE", " 30 1234567 ")).toBe("+49 30 1234567");
  });

  it("keeps an unknown number whole, and an empty one empty", () => {
    expect(splitPhone("0800 123")).toEqual({ country: "GB", number: "0800 123" });
    expect(joinPhone("GB", "  ")).toBe("");
  });
});

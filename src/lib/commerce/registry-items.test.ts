import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { closure, uiComponents } from "../../../scripts/build-registry.mjs";

const UI = path.join(process.cwd(), "src/components/ui");

describe("uiComponents", () => {
  const items = uiComponents() as [string, string[]][];

  it("opens every component folder as one item, named after the folder", () => {
    const folders = fs
      .readdirSync(UI, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(items.map(([name]) => name)).toEqual(folders);
  });

  it("ships source files only, including those in nested folders", () => {
    const entries = items.flatMap(([, files]) => files);
    expect(entries.some((file) => /\.(test|stories|figma|code-connect)\./.test(file))).toBe(false);
    expect(Object.fromEntries(items)["card-feature"]).toContain(
      "src/components/ui/card-feature/byline/card-feature-byline.tsx",
    );
  });
});

describe("closure", () => {
  it("follows import statements, not words in comments", () => {
    // card-feature-byline has a comment that reads `"JD" from "Jane Doe"`.
    const { packages } = closure("src/components/ui/card-feature/byline/card-feature-byline.tsx");
    expect(packages).not.toContain("Jane Doe");
  });
});

import { expect } from "vitest";
import { axe } from "vitest-axe";

/** Runs axe on a rendered container and fails with the rule ids that were violated. */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const results = await axe(container);
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

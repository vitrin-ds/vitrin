import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom has no layout: listbox widgets call scrollIntoView on the highlighted option.
Element.prototype.scrollIntoView ??= function scrollIntoView() {};

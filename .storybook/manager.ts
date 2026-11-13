import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  // Controls sit to the right of the story.
  panelPosition: "right",
  theme: create({
    base: "light",
    brandTitle: "Vitrin",
    brandUrl: "/vitrin",
    brandTarget: "_self",
    colorPrimary: "#8a418a",
    colorSecondary: "#8a418a",
    fontBase: "Inter, system-ui, sans-serif",
    appBg: "#ffffff",
    appContentBg: "#ffffff",
    appBorderColor: "#e6e3da",
    appBorderRadius: 8,
    textColor: "#0d0e12",
    barSelectedColor: "#8a418a",
  }),
});

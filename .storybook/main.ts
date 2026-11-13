import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  // Standalone (`pnpm storybook`, `pnpm build-storybook`) it serves public/ itself. Built into the
  // site (`pnpm build:site`: STORYBOOK_EMBED=1, output public/storybook, served at /storybook/)
  // the site already serves public/ at its root, where the stories' absolute paths point, and
  // copying it would nest public/ inside itself.
  staticDirs: process.env.STORYBOOK_EMBED === "1" ? [] : ["../public"],
  // Next compiles Tailwind through @tailwindcss/turbopack; Storybook runs on Vite and needs
  // the Vite plugin, or stories render without any utilities.
  async viteFinal(viteConfig) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return { ...viteConfig, plugins: [...(viteConfig.plugins ?? []), tailwindcss()] };
  },
};

export default config;

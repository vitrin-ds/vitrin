import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // `const { password, ...rest } = input` drops a field on purpose (immutable omit).
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
    },
  },
  {
    // Figma Code Connect templates: the CLI reads `export default { example, id, … }` as is.
    files: ["**/*.figma.ts", "**/*.figma.batch.ts"],
    rules: { "import/no-anonymous-default-export": "off" },
  },
  {
    // CommonJS config for tools that load it with require() (Lighthouse CI: lighthouserc.cjs).
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores([
    ".next/**",
    // Agent git worktrees: separate checkouts, linted there.
    ".claude/worktrees/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "storybook-static/**",
    // Storybook built into the site (pnpm build:site).
    "public/storybook/**",
    "playwright-report/**",
    "test-results/**",
    // Local Python tools (gitignored).
    ".venv-tools/**",
  ]),
]);

export default eslintConfig;

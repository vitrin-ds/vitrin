import fs from "node:fs";
import path from "node:path";
import { CliError } from "./errors.mjs";

const CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
];
const TAILWIND_IMPORT = /@import\s+["']tailwindcss/;
const MINIMUM_TAILWIND = 4;

/** tsconfig allows comments and trailing commas; JSON.parse does not. Strings are left alone. */
export function parseJsonc(source) {
  let out = "";
  let inString = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      out += char;
      if (char === "\\") out += source[++i] ?? "";
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
      out += char;
    } else if (char === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i++;
      out += "\n";
    } else if (char === "/" && source[i + 1] === "*") {
      i = source.indexOf("*/", i + 2) + 1 || source.length;
    } else {
      out += char;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

function readPackageJson(cwd) {
  const file = path.join(cwd, "package.json");
  if (!fs.existsSync(file)) {
    throw new CliError("No package.json here. Run this in your project's folder, or pass --cwd.");
  }
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  return { ...manifest.dependencies, ...manifest.devDependencies };
}

function checkStack(dependencies) {
  if (!dependencies.next) {
    throw new CliError("Vitrin needs Next.js for now: next is not in package.json.");
  }
  const tailwind = dependencies.tailwindcss;
  const major = tailwind && /\d+/.exec(tailwind)?.[0];
  if (!tailwind || (major && Number(major) < MINIMUM_TAILWIND)) {
    throw new CliError(
      `Vitrin needs Tailwind CSS ${MINIMUM_TAILWIND}: found ${tailwind ?? "none"} in package.json.`,
    );
  }
}

/** Where the "@/" of our files points in this project: its base folder and its own alias. */
function readAlias(cwd) {
  const file = ["tsconfig.json", "jsconfig.json"]
    .map((name) => path.join(cwd, name))
    .find((candidate) => fs.existsSync(candidate));
  const paths = file ? parseJsonc(fs.readFileSync(file, "utf8")).compilerOptions?.paths : undefined;
  const aliases = Object.entries(paths ?? {}).flatMap(([key, targets]) => {
    const alias = /^(.+)\/\*$/.exec(key)?.[1];
    const target = /^(?:\.\/)?(src\/)?\*$/.exec(targets[0] ?? "");
    return alias && target ? [{ alias, baseDir: target[1] ? "src" : "" }] : [];
  });
  const match = aliases.find(({ alias }) => alias === "@") ?? aliases[0];
  if (!match) {
    throw new CliError(
      'No path alias found. Add one to tsconfig.json, e.g. "paths": { "@/*": ["./src/*"] }.',
    );
  }
  return match;
}

function findCss(cwd, explicit) {
  const cssFile = explicit ?? CSS_CANDIDATES.find((file) => fs.existsSync(path.join(cwd, file)));
  if (!cssFile || !fs.existsSync(path.join(cwd, cssFile))) {
    throw new CliError(
      `No stylesheet found (looked for ${explicit ?? CSS_CANDIDATES.join(", ")}). Name yours with --css <file>.`,
    );
  }
  if (!TAILWIND_IMPORT.test(fs.readFileSync(path.join(cwd, cssFile), "utf8"))) {
    throw new CliError(`${cssFile} has no @import "tailwindcss"; Vitrin's styles build on it.`);
  }
  return cssFile;
}

function packageManager(cwd) {
  const locks = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
  ];
  return locks.find(([file]) => fs.existsSync(path.join(cwd, file)))?.[1] ?? "npm";
}

export function readConfig(cwd) {
  const file = path.join(cwd, "vitrin.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

export function writeConfig(cwd, config) {
  fs.writeFileSync(path.join(cwd, "vitrin.json"), `${JSON.stringify(config, null, 2)}\n`);
}

/** Everything the install needs to know about the project. Throws before anything is written. */
export function readProject(cwd, { css } = {}) {
  const dependencies = readPackageJson(cwd);
  checkStack(dependencies);
  const saved = readConfig(cwd);
  const { alias, baseDir } = saved ?? readAlias(cwd);
  return {
    cwd,
    alias,
    baseDir,
    cssFile: findCss(cwd, css ?? saved?.cssFile),
    dependencies,
    packageManager: packageManager(cwd),
    items: saved?.items ?? [],
  };
}

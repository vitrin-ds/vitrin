import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CliError } from "./errors.mjs";

// A registry is a remote source: what it may write and install is checked here, before the first
// file is touched. Items reach only our own folders and the public folder.
const BASE_FOLDERS = ["components/", "lib/", "styles/", "hooks/"];
const ROOT_FOLDER = "public/";
const DEPENDENCY = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[\^~]?[\w.-]+)?$/;
const SOURCE_FILE = /\.[cm]?[jt]sx?$/;
const TAILWIND_IMPORT_LINE = /^@import\s+["']tailwindcss.*$/m;

const INSTALL_ARGS = { npm: "install", pnpm: "add", yarn: "add", bun: "add" };

function assertTarget(target, root, itemName) {
  const normalised = path.posix.normalize(target);
  const allowed = root
    ? normalised.startsWith(ROOT_FOLDER)
    : BASE_FOLDERS.some((folder) => normalised.startsWith(folder));
  if (
    target.includes("\\") ||
    path.posix.isAbsolute(target) ||
    normalised.startsWith("..") ||
    !allowed
  ) {
    throw new CliError(
      `"${itemName}" tries to write outside its folders: ${target}. Nothing was changed.`,
    );
  }
}

function assertDependency(dependency, itemName) {
  if (!DEPENDENCY.test(dependency)) {
    throw new CliError(
      `"${itemName}" asks for a package that is not allowed: ${dependency}. Nothing was changed.`,
    );
  }
}

const packageName = (dependency) => dependency.replace(/(.)@.*$/, "$1");

function toContent(file, alias) {
  if (file.encoding === "base64") return Buffer.from(file.content, "base64");
  const isSource = SOURCE_FILE.test(file.target);
  const text =
    alias !== "@" && isSource ? file.content.replace(/(["'])@\//g, `$1${alias}/`) : file.content;
  return Buffer.from(text, "utf8");
}

/** What the items would do to the project, with every check done and nothing written yet. */
export function planInstall(items, project) {
  const files = new Map();
  const imports = [];
  const needed = new Set();
  for (const item of items) {
    for (const dependency of item.dependencies ?? []) {
      assertDependency(dependency, item.name);
      if (!project.dependencies[packageName(dependency)]) needed.add(dependency);
    }
    for (const file of item.files) {
      assertTarget(file.target, file.root === true, item.name);
      const target = file.root ? file.target : path.posix.join(project.baseDir, file.target);
      files.set(target, toContent(file, project.alias));
    }
    for (const stylesheet of item.css?.imports ?? []) {
      assertTarget(stylesheet, false, item.name);
      imports.push(path.posix.join(project.baseDir, stylesheet));
    }
  }
  return { files, imports, dependencies: [...needed] };
}

/** Writes the files. A file the developer changed stays, unless they asked to overwrite it. */
export function writeFiles(files, cwd, { overwrite }) {
  const result = { created: [], updated: [], unchanged: [], kept: [] };
  for (const [target, content] of files) {
    const absolute = path.join(cwd, target);
    const exists = fs.existsSync(absolute);
    if (exists && fs.readFileSync(absolute).equals(content)) {
      result.unchanged.push(target);
    } else if (exists && !overwrite) {
      result.kept.push(target);
    } else {
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.writeFileSync(absolute, content);
      (exists ? result.updated : result.created).push(target);
    }
  }
  return result;
}

/** Adds the stylesheets right after the Tailwind import, in order, once. */
export function addImports(imports, cssFile, cwd) {
  const absolute = path.join(cwd, cssFile);
  const css = fs.readFileSync(absolute, "utf8");
  const lines = imports
    .map((file) => {
      const relative = path.posix.relative(path.posix.dirname(cssFile), file);
      return `@import "${relative.startsWith(".") ? relative : `./${relative}`}";`;
    })
    .filter((line) => !css.includes(line));
  if (lines.length === 0) return 0;
  fs.writeFileSync(
    absolute,
    css.replace(TAILWIND_IMPORT_LINE, (line) => [line, ...lines].join("\n")),
  );
  return lines.length;
}

/** Runs the project's package manager. No shell, except where Windows needs one for .cmd files. */
export function installDependencies(manager, dependencies, cwd) {
  const { status } = spawnSync(manager, [INSTALL_ARGS[manager], ...dependencies], {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return status === 0;
}

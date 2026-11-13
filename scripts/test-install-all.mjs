#!/usr/bin/env node
// Installs every registry item into a Next.js project and proves the project still builds: the
// promise on vitrin.design is that every part installs with one command. Run it
// on a fresh `create-next-app` project with its defaults (cacheComponents on), against a registry
// built from this commit (scripts/serve-registry.mjs). CI: .github/workflows/cli-install.yml.
//
// Installing only proves the files land. So the script also writes one page that imports every
// installed module, so `next build` compiles and bundles all of them, then runs the type check and
// the build. Rendering each part needs its props: that is what the stories and tests are for; the
// page renders only the parts that read the date.
//
// Then the runtime check: every connected block gets a page of its own on the adapter it installs
// with (scripts/install-check-pages.mjs). The script starts the built project, opens each page in
// Chromium and does the block's main action: it must work with no setup, and with no error.
//
//   node scripts/test-install-all.mjs <project> --registry http://127.0.0.1:4790

import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHECK_PAGES } from "./install-check-pages.mjs";

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), "../cli/bin/vitrin.mjs");
const PAGE = "src/app/vitrin-all/page.tsx";
const CHECK_DIR = "src/app/vitrin-check";
const PORT = Number(process.env.VITRIN_CHECK_PORT ?? 3457);
/** Brand marks a project adds itself (THIRD_PARTY_NOTICES): missing on purpose, drawn as fallbacks. */
const BRAND_FILES = /\/brand\/(flags|payment|social)\//;
const MODULES = "src/app/vitrin-all/modules.ts";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function run(command, args, cwd) {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

/** Every installed module, as an import path: the items' code files, without the stylesheets. */
export function modulesOf(items) {
  const files = new Set(
    items.flatMap((item) =>
      item.files
        .filter(
          (file) => !file.root && /\.(ts|tsx)$/.test(file.target) && !/\.d\.ts$/.test(file.target),
        )
        .map((file) => file.target.replace(/\.(ts|tsx)$/, "")),
    ),
  );
  return [...files].sort().map((file) => `@/${file}`);
}

export function modulesSource(modules) {
  const imports = modules.map((spec, index) => `import * as m${index} from "${spec}";`);
  return `// Written by scripts/test-install-all.mjs: every installed Vitrin module, so the build sees them all.
${imports.join("\n")}

export const MODULES = [${modules.map((_, index) => `m${index}`).join(", ")}];
`;
}

// The page also renders the parts that need today's date with no wrapper: under cacheComponents a
// clock read while prerendering fails the build, so this proves they read it in the browser.
const PAGE_SOURCE = `"use client";

import { DatePicker } from "@/components/ui/date-picker/date-picker";
import { CardFeatureStore } from "@/components/ui/card-feature/store/card-feature-store";
import { MODULES } from "./modules";

export default function VitrinAll() {
  return (
    <>
      <p>{MODULES.length} Vitrin modules</p>
      <DatePicker />
      <CardFeatureStore
        name="Sample store"
        address="1 Sample Street"
        status="closed"
        nextChange={new Date("2026-01-02T09:00:00Z")}
      />
    </>
  );
}
`;

async function main() {
  const project = path.resolve(process.argv[2] ?? "");
  const registry = arg("--registry");
  if (!process.argv[2] || !registry) throw new Error("usage: <project> --registry <url>");

  const { items } = await json(`${registry}/index.json`);
  const names = items.map((item) => item.name);
  console.log(`${names.length} items`);
  run("node", [CLI, "add", ...names, "--registry", registry], project);

  const installed = await Promise.all(names.map((name) => json(`${registry}/${name}.json`)));
  const modules = modulesOf(installed);
  fs.mkdirSync(path.join(project, path.dirname(PAGE)), { recursive: true });
  fs.writeFileSync(path.join(project, MODULES), modulesSource(modules));
  fs.writeFileSync(path.join(project, PAGE), PAGE_SOURCE);
  console.log(`${modules.length} modules imported by ${PAGE}`);

  for (const [name, { source }] of Object.entries(CHECK_PAGES)) {
    const file = path.join(project, CHECK_DIR, name, "page.tsx");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, source);
  }

  run("npx", ["tsc", "--noEmit"], project);
  run("npx", ["next", "build"], project);
  await checkInBrowser(project);
}

async function waitForServer(url, server) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error("next start exited");
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${url} did not answer`);
}

/** Opens every check page in Chromium and does the block's main action. */
export async function checkInBrowser(project) {
  const { chromium } = await import("playwright");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: project,
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  const failures = [];
  try {
    await waitForServer(`http://localhost:${PORT}/vitrin-all`, server);
    const browser = await chromium.launch();
    for (const [name, { action, check }] of Object.entries(CHECK_PAGES)) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      // Missing files are errors; a 404 on a route the page links to (Next prefetches it, `?_rsc=`)
      // is not: the check pages link to store routes a fresh project doesn't have.
      page.on("response", (response) => {
        const url = response.url();
        if (response.status() >= 400 && !url.includes("_rsc=") && !BRAND_FILES.test(url)) {
          errors.push(`${response.status()} ${response.url()}`);
        }
      });
      page.on("console", (message) => {
        if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
          errors.push(message.text());
        }
      });
      try {
        await page.goto(`http://localhost:${PORT}/vitrin-check/${name}`);
        const status = page.locator("[data-check]");
        await status.waitFor();
        const expected = await check(page);
        if (expected)
          await page.waitForFunction(
            (text) => document.querySelector("[data-check]")?.textContent === text,
            expected,
            { timeout: 5000 },
          );
        const shown = await status.textContent();
        if (shown?.startsWith("error:")) errors.push(shown);
      } catch (error) {
        errors.push(
          error instanceof Error ? error.message.split("\n").slice(0, 3).join(" ") : String(error),
        );
      }
      console.log(`${errors.length === 0 ? "ok  " : "FAIL"} ${name}: ${action}`);
      if (errors.length > 0) failures.push(`${name}: ${errors.join(" | ")}`);
      await page.close();
    }
    await browser.close();
  } finally {
    server.kill();
  }
  if (failures.length > 0) throw new Error(`Runtime check failed:\n${failures.join("\n")}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

import path from "node:path";
import { parseArgs } from "node:util";
import { CliError } from "./errors.mjs";
import { addImports, installDependencies, planInstall, writeFiles } from "./install.mjs";
import { readConfig, readProject, writeConfig } from "./project.mjs";
import { createRegistry, DEFAULT_REGISTRY } from "./registry.mjs";

const FOUNDATIONS = "foundations";

const HELP = `Vitrin: e-commerce components and blocks for your Next.js project.

Usage
  vitrin add <items...>    Add items. Sets up the project the first time.
  vitrin init [items...]   Set up the project, with or without items.
  vitrin list              Show what the registry offers.

Options
  --cwd <dir>        Project folder (default: this folder)
  --css <file>       Your stylesheet, if it is not found by itself
  --overwrite        Replace files you changed (default: keep them)
  --dry-run          Show what would change, write nothing
  --no-install       Name the npm packages instead of installing them
  --registry <url>   Registry address
  -h, --help         Show this help`;

const OPTIONS = {
  cwd: { type: "string" },
  css: { type: "string" },
  overwrite: { type: "boolean", default: false },
  "dry-run": { type: "boolean", default: false },
  "no-install": { type: "boolean", default: false },
  registry: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
};

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

async function install(names, values, context) {
  const { cwd, env, log, install: runInstall } = context;
  const project = readProject(cwd, { css: values.css });
  const registryUrl =
    values.registry ?? readConfig(cwd)?.registry ?? env.VITRIN_REGISTRY ?? DEFAULT_REGISTRY;
  const registry = createRegistry(registryUrl, env.VITRIN_TOKEN);

  const items = await registry.resolve([FOUNDATIONS, ...names]);
  const plan = planInstall(items, project);

  if (values["dry-run"]) {
    log(`Would write ${plural(plan.files.size, "file")}:`);
    for (const target of plan.files.keys()) log(`  ${target}`);
    if (plan.dependencies.length) log(`Would install: ${plan.dependencies.join(" ")}`);
    return 0;
  }

  const result = writeFiles(plan.files, cwd, { overwrite: values.overwrite });
  addImports(plan.imports, project.cssFile, cwd);
  writeConfig(cwd, {
    registry: registryUrl,
    baseDir: project.baseDir,
    alias: project.alias,
    cssFile: project.cssFile,
    items: [...new Set([...project.items, ...names])],
  });

  log(
    `Added ${plural(result.created.length + result.updated.length, "file")}, ${result.unchanged.length} already up to date.`,
  );
  if (result.kept.length) {
    log(`Kept ${plural(result.kept.length, "file")} you changed (--overwrite replaces them):`);
    for (const target of result.kept) log(`  ${target}`);
  }

  if (plan.dependencies.length === 0) return 0;
  const manual = `${project.packageManager} install ${plan.dependencies.join(" ")}`;
  if (values["no-install"]) {
    log(`Now install the packages: ${manual}`);
    return 0;
  }
  if (!runInstall(project.packageManager, plan.dependencies, cwd)) {
    log(`The files are in place, but the packages did not install. Try: ${manual}`);
    return 1;
  }
  return 0;
}

async function list(values, { cwd, env, log }) {
  const registryUrl =
    values.registry ?? readConfig(cwd)?.registry ?? env.VITRIN_REGISTRY ?? DEFAULT_REGISTRY;
  const items = await createRegistry(registryUrl, env.VITRIN_TOKEN).list();
  for (const item of items) log(`${item.name.padEnd(24)} ${item.title ?? ""}`);
  return 0;
}

/** Runs one command and answers with the exit code. Everything the tests replace comes in here. */
export async function run(argv, overrides = {}) {
  const log = overrides.log ?? console.log;
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: OPTIONS,
      allowPositionals: true,
    });
    const [command, ...names] = positionals;
    if (values.help || !command) {
      log(HELP);
      return 0;
    }
    const context = {
      cwd: path.resolve(overrides.cwd ?? values.cwd ?? process.cwd()),
      env: overrides.env ?? process.env,
      log,
      install: overrides.install ?? installDependencies,
    };
    if (command === "list") return await list(values, context);
    if (command === "init") return await install(names, values, context);
    if (command === "add") {
      if (names.length === 0) throw new CliError('Name what to add, e.g. "vitrin add mini-cart".');
      return await install(names, values, context);
    }
    throw new CliError(`Unknown command "${command}". Run "vitrin --help".`);
  } catch (error) {
    if (error instanceof CliError || error?.code?.startsWith?.("ERR_PARSE_ARGS")) {
      log(error.message);
      return 1;
    }
    throw error;
  }
}

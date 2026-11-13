import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/main.mjs";

const FOUNDATIONS = {
  name: "foundations",
  type: "foundations",
  dependencies: ["clsx@^2.1.1"],
  files: [
    { target: "styles/vitrin/tokens.css", content: ":root { --a: 1; }\n" },
    {
      target: "styles/vitrin/icons.woff2",
      content: Buffer.from([0, 255, 1]).toString("base64"),
      encoding: "base64",
    },
    { target: "lib/cn.ts", content: "export const cn = 1;\n" },
    { target: "public/vitrin/add-image.svg", content: "<svg/>", root: true },
  ],
  css: { imports: ["styles/vitrin/tokens.css"] },
};

const BUTTON = {
  name: "button",
  type: "component",
  requires: ["foundations"],
  dependencies: ["class-variance-authority@^0.7.1"],
  files: [
    {
      target: "components/ui/button/button.tsx",
      content: 'import { cn } from "@/lib/cn";\nexport const B = cn;\n',
    },
  ],
};

const ITEMS: Record<string, unknown> = {
  foundations: FOUNDATIONS,
  button: BUTTON,
  card: {
    name: "card",
    type: "component",
    requires: ["foundations", "button"],
    files: [{ target: "components/ui/card/card.tsx", content: "export const C = 1;\n" }],
  },
  escape: {
    name: "escape",
    type: "component",
    files: [{ target: "../../evil.txt", content: "x" }],
  },
  absolute: {
    name: "absolute",
    type: "component",
    files: [{ target: "/tmp/evil.txt", content: "x" }],
  },
  config: {
    name: "config",
    type: "component",
    files: [{ target: "next.config.ts", content: "x" }],
  },
  rootly: {
    name: "rootly",
    type: "component",
    files: [{ target: "package.json", content: "x", root: true }],
  },
  baddep: { name: "baddep", type: "component", dependencies: ["x; rm -rf /"], files: [] },
  urldep: {
    name: "urldep",
    type: "component",
    dependencies: ["https://evil.example/x.tgz"],
    files: [],
  },
  malformed: { name: "malformed" },
};

let server: http.Server;
let registry: string;
let requests: { url: string; auth?: string }[] = [];
let denied = false;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    requests.push({ url: req.url ?? "", auth: req.headers.authorization });
    if (denied) {
      res.writeHead(401).end();
      return;
    }
    if (req.url === "/index.json") {
      res
        .writeHead(200)
        .end(JSON.stringify({ items: [{ name: "button", type: "component", title: "Button" }] }));
      return;
    }
    const item = ITEMS[(req.url ?? "").replace(/^\/|\.json$/g, "")];
    if (!item) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200).end(JSON.stringify(item));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  registry = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server.close());

let cwd: string;
let output: string[];
let install: ReturnType<typeof vi.fn>;

interface ProjectOptions {
  src?: boolean;
  paths?: Record<string, string[]> | null;
  css?: string | null;
  dependencies?: Record<string, string>;
  lockfile?: string;
}

function project({
  src = true,
  paths = src ? { "@/*": ["./src/*"] } : { "@/*": ["./*"] },
  css = '@import "tailwindcss";\n\nbody { color: red; }\n',
  dependencies = { next: "16.0.0", tailwindcss: "^4" },
  lockfile = "pnpm-lock.yaml",
}: ProjectOptions = {}) {
  fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ dependencies }));
  fs.writeFileSync(path.join(cwd, lockfile), "");
  if (paths) {
    fs.writeFileSync(
      path.join(cwd, "tsconfig.json"),
      `{\n  // a comment\n  "compilerOptions": { "paths": ${JSON.stringify(paths)}, },\n}\n`,
    );
  }
  const app = src ? "src/app" : "app";
  fs.mkdirSync(path.join(cwd, app), { recursive: true });
  if (css !== null) fs.writeFileSync(path.join(cwd, app, "globals.css"), css);
}

const read = (file: string) => fs.readFileSync(path.join(cwd, file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(cwd, file));
const cli = (args: string[], env: Record<string, string> = {}) =>
  run([...args, "--registry", registry], {
    cwd,
    env,
    log: (line: string) => output.push(line),
    install,
  });

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), "vitrin-cli-"));
  output = [];
  requests = [];
  denied = false;
  install = vi.fn(() => true);
});

afterEach(() => fs.rmSync(cwd, { recursive: true, force: true }));

describe("add", () => {
  it("installs the item and its requirements under src, with one command", async () => {
    project();
    expect(await cli(["add", "button"])).toBe(0);
    expect(read("src/components/ui/button/button.tsx")).toContain("@/lib/cn");
    expect(read("src/lib/cn.ts")).toContain("cn");
    expect(read("public/vitrin/add-image.svg")).toBe("<svg/>");
    expect(exists("src/public")).toBe(false);
  });

  it("writes to the project root when there is no src folder", async () => {
    project({ src: false });
    expect(await cli(["add", "button"])).toBe(0);
    expect(exists("components/ui/button/button.tsx")).toBe(true);
    expect(read("app/globals.css")).toContain('@import "../styles/vitrin/tokens.css";');
  });

  it("restores binary files byte for byte", async () => {
    project();
    await cli(["add", "button"]);
    expect([...fs.readFileSync(path.join(cwd, "src/styles/vitrin/icons.woff2"))]).toEqual([
      0, 255, 1,
    ]);
  });

  it("adds the stylesheet right after Tailwind, once", async () => {
    project();
    await cli(["add", "button"]);
    await cli(["add", "button"]);
    const css = read("src/app/globals.css");
    expect(css.match(/tokens\.css/g)).toHaveLength(1);
    expect(css.indexOf("tokens.css")).toBeGreaterThan(css.indexOf('"tailwindcss"'));
    expect(css.indexOf("tokens.css")).toBeLessThan(css.indexOf("body"));
  });

  it("reads each requirement once, even when several items need it", async () => {
    project();
    await cli(["add", "button", "card"]);
    expect(requests.filter((request) => request.url === "/foundations.json")).toHaveLength(1);
  });

  it("creates no shadcn configuration, only its own", async () => {
    project();
    await cli(["add", "button"]);
    expect(exists("components.json")).toBe(false);
    expect(JSON.parse(read("vitrin.json"))).toMatchObject({
      baseDir: "src",
      cssFile: "src/app/globals.css",
      items: ["button"],
    });
  });

  it("uses the project's alias when it is not @", async () => {
    project({ paths: { "~/*": ["./src/*"] } });
    expect(await cli(["add", "button"])).toBe(0);
    expect(read("src/components/ui/button/button.tsx")).toContain('from "~/lib/cn"');
  });

  it("stops before writing when the project has no path alias", async () => {
    project({ paths: null });
    expect(await cli(["add", "button"])).toBe(1);
    expect(exists("src/lib/cn.ts")).toBe(false);
    expect(output.join("\n")).toMatch(/alias/i);
  });

  it("does nothing on a dry run", async () => {
    project();
    expect(await cli(["add", "button", "--dry-run"])).toBe(0);
    expect(exists("src/lib/cn.ts")).toBe(false);
    expect(exists("vitrin.json")).toBe(false);
    expect(read("src/app/globals.css")).not.toContain("tokens.css");
    expect(install).not.toHaveBeenCalled();
  });
});

describe("changed files", () => {
  it("keeps a file the developer changed, says so and still finishes", async () => {
    project();
    fs.mkdirSync(path.join(cwd, "src/lib"), { recursive: true });
    fs.writeFileSync(path.join(cwd, "src/lib/cn.ts"), "// mine\n");
    expect(await cli(["add", "button"])).toBe(0);
    expect(read("src/lib/cn.ts")).toBe("// mine\n");
    expect(read("src/components/ui/button/button.tsx")).toContain("B");
    expect(output.join("\n")).toContain("src/lib/cn.ts");
  });

  it("replaces it with --overwrite", async () => {
    project();
    fs.mkdirSync(path.join(cwd, "src/lib"), { recursive: true });
    fs.writeFileSync(path.join(cwd, "src/lib/cn.ts"), "// mine\n");
    expect(await cli(["add", "button", "--overwrite"])).toBe(0);
    expect(read("src/lib/cn.ts")).toContain("cn");
  });
});

describe("what the registry may not do", () => {
  it.each(["escape", "absolute", "config", "rootly"])("rejects the target in %s", async (name) => {
    project();
    const before = read("package.json");
    expect(await cli(["add", name])).toBe(1);
    expect(read("package.json")).toBe(before);
    expect(exists("next.config.ts")).toBe(false);
    expect(fs.existsSync(path.join(cwd, "../../evil.txt"))).toBe(false);
  });

  it.each(["baddep", "urldep"])("rejects the dependency in %s", async (name) => {
    project();
    expect(await cli(["add", name])).toBe(1);
    expect(install).not.toHaveBeenCalled();
  });

  it("rejects a malformed item", async () => {
    project();
    expect(await cli(["add", "malformed"])).toBe(1);
  });

  it("rejects an item name that is not a plain name", async () => {
    project();
    expect(await cli(["add", "../secret"])).toBe(1);
    expect(requests.some((request) => request.url.includes("secret"))).toBe(false);
  });
});

describe("project checks", () => {
  it.each([
    ["Next.js", { dependencies: { tailwindcss: "^4" } }, /Next/],
    ["Tailwind", { dependencies: { next: "16.0.0" } }, /Tailwind/],
    ["Tailwind 3", { dependencies: { next: "16.0.0", tailwindcss: "^3.4.0" } }, /Tailwind/],
    ["a stylesheet", { css: null }, /--css/],
    ["the Tailwind import", { css: "body {}\n" }, /tailwindcss/],
  ])("explains when %s is missing", async (_, options, message) => {
    project(options);
    expect(await cli(["add", "button"])).toBe(1);
    expect(output.join("\n")).toMatch(message);
  });

  it("explains when there is no project at all", async () => {
    expect(await cli(["add", "button"])).toBe(1);
    expect(output.join("\n")).toMatch(/package\.json/);
  });

  it("accepts --css for a stylesheet elsewhere", async () => {
    project({ css: null });
    fs.mkdirSync(path.join(cwd, "src/css"));
    fs.writeFileSync(path.join(cwd, "src/css/main.css"), '@import "tailwindcss";\n');
    expect(await cli(["add", "button", "--css", "src/css/main.css"])).toBe(0);
    expect(read("src/css/main.css")).toContain('@import "../styles/vitrin/tokens.css";');
  });
});

describe("dependencies", () => {
  it("installs only what is missing, with the project's package manager", async () => {
    project({
      dependencies: { next: "16.0.0", tailwindcss: "^4", clsx: "^2.0.0" },
      lockfile: "yarn.lock",
    });
    await cli(["add", "button"]);
    expect(install).toHaveBeenCalledWith("yarn", ["class-variance-authority@^0.7.1"], cwd);
  });

  it("names them instead with --no-install", async () => {
    project();
    expect(await cli(["add", "button", "--no-install"])).toBe(0);
    expect(install).not.toHaveBeenCalled();
    expect(output.join("\n")).toContain("clsx@^2.1.1");
  });

  it("fails loudly when the install fails, with the files in place", async () => {
    project();
    install.mockReturnValue(false);
    expect(await cli(["add", "button"])).toBe(1);
    expect(exists("src/lib/cn.ts")).toBe(true);
    expect(output.join("\n")).toContain("clsx@^2.1.1");
  });
});

describe("registry access", () => {
  it("explains an unknown item", async () => {
    project();
    expect(await cli(["add", "nope"])).toBe(1);
    expect(output.join("\n")).toMatch(/nope/);
    expect(output.join("\n")).toMatch(/list/);
  });

  it("explains a refused request", async () => {
    project();
    denied = true;
    expect(await cli(["add", "button"])).toBe(1);
    expect(output.join("\n")).toMatch(/VITRIN_TOKEN/);
  });

  it("sends the token and never stores or prints it", async () => {
    project();
    expect(await cli(["add", "button"], { VITRIN_TOKEN: "secret-token" })).toBe(0);
    expect(requests[0].auth).toBe("Bearer secret-token");
    expect(read("vitrin.json")).not.toContain("secret-token");
    expect(output.join("\n")).not.toContain("secret-token");
  });

  it("refuses to send a token over plain http to another host", async () => {
    project();
    const code = await run(["add", "button", "--registry", "http://registry.example"], {
      cwd,
      env: { VITRIN_TOKEN: "secret-token" },
      log: (line: string) => output.push(line),
      install,
    });
    expect(code).toBe(1);
    expect(output.join("\n")).toMatch(/https/);
  });

  it("keeps the registry for the next command", async () => {
    project();
    await cli(["add", "button"]);
    expect(JSON.parse(read("vitrin.json")).registry).toBe(registry);
    const code = await run(["add", "card"], {
      cwd,
      env: {},
      log: (line: string) => output.push(line),
      install,
    });
    expect(code).toBe(0);
    expect(JSON.parse(read("vitrin.json")).items).toEqual(["button", "card"]);
  });
});

describe("other commands", () => {
  it("init sets up foundations without any item", async () => {
    project();
    expect(await cli(["init"])).toBe(0);
    expect(exists("src/styles/vitrin/tokens.css")).toBe(true);
    expect(JSON.parse(read("vitrin.json")).items).toEqual([]);
  });

  it("init takes items too", async () => {
    project();
    expect(await cli(["init", "button"])).toBe(0);
    expect(exists("src/components/ui/button/button.tsx")).toBe(true);
  });

  it("list shows what the registry offers", async () => {
    project();
    expect(await cli(["list"])).toBe(0);
    expect(output.join("\n")).toContain("button");
  });

  it("asks for items on add", async () => {
    project();
    expect(await cli(["add"])).toBe(1);
  });

  it.each([[["--help"]], [[]]])("shows help for %j", async (args) => {
    const code = await run(args, {
      cwd,
      env: {},
      log: (line: string) => output.push(line),
      install,
    });
    expect(code).toBe(0);
    expect(output.join("\n")).toContain("vitrin add");
  });

  it("rejects an unknown command", async () => {
    const code = await run(["nope"], {
      cwd,
      env: {},
      log: (line: string) => output.push(line),
      install,
    });
    expect(code).toBe(1);
  });
});

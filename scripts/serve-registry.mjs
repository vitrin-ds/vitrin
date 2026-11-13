// Serves a built registry folder over http, for testing the CLI against it (the Windows install
// test in .github/workflows/cli-install.yml). Only `{name}.json` files at the top of the folder.
//
//   node scripts/serve-registry.mjs public/r 4790

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [dir = "public/r", port = "4790"] = process.argv.slice(2);
const root = path.resolve(dir);
const FILE = /^\/([a-z0-9][a-z0-9-]*\.json)$/;

http
  .createServer((request, response) => {
    const name = FILE.exec(new URL(request.url ?? "/", "http://localhost").pathname)?.[1];
    const file = name && path.join(root, name);
    if (!file || !fs.existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    fs.createReadStream(file).pipe(response);
  })
  .listen(Number(port), "127.0.0.1", () => {
    console.log(`Registry ${root} on http://127.0.0.1:${port}`);
  });

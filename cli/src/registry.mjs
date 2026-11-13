import { CliError } from "./errors.mjs";

export const DEFAULT_REGISTRY = "https://vitrin.design/r";
const TIMEOUT_MS = 30_000;
const ITEM_NAME = /^[a-z0-9][a-z0-9-]*$/;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function assertSafeForToken(registry) {
  const { protocol, hostname } = new URL(registry);
  if (protocol !== "https:" && !LOCAL_HOSTS.has(hostname)) {
    throw new CliError(
      `Not sending your token over plain http to ${hostname}. Use an https registry.`,
    );
  }
}

export function createRegistry(registry, token) {
  if (token) assertSafeForToken(registry);

  async function get(file, what) {
    let response;
    try {
      response = await fetch(`${registry}/${file}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      throw new CliError(`Could not reach ${registry}: ${error.message}`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new CliError(
        `${what} needs a licence. Set VITRIN_TOKEN to your token, or check that it is still valid.`,
      );
    }
    if (response.status === 404) {
      throw new CliError(`${what} was not found. Run "vitrin list" to see what is available.`);
    }
    if (!response.ok) throw new CliError(`${registry} answered ${response.status} for ${what}.`);
    try {
      return await response.json();
    } catch {
      throw new CliError(`${registry} sent something that is not JSON for ${what}.`);
    }
  }

  return {
    list: async () => (await get("index.json", "The item list")).items ?? [],
    async item(name) {
      if (!ITEM_NAME.test(name)) throw new CliError(`"${name}" is not a valid item name.`);
      const item = await get(`${name}.json`, `"${name}"`);
      if (typeof item?.name !== "string" || !Array.isArray(item.files)) {
        throw new CliError(`The registry sent a malformed item for "${name}".`);
      }
      return item;
    },
    /** The items and everything they require, requirements first, each once. */
    async resolve(names) {
      const seen = new Map();
      const visit = async (name) => {
        if (seen.has(name)) return;
        seen.set(name, null);
        const item = await this.item(name);
        for (const requirement of item.requires ?? []) await visit(requirement);
        seen.delete(name);
        seen.set(name, item);
      };
      for (const name of names) await visit(name);
      return [...seen.values()];
    },
  };
}

// Where a real Shopify store is reached: the shop's domain and a Storefront API token, from the
// environment (.env.local locally, the host's settings in production). Both are public by Shopify's
// design: a Storefront token only reads the catalogue and runs carts, so the browser may hold it.
// The literal `process.env.NEXT_PUBLIC_…` reads let Next inline them into client code.

/** The Storefront API version the adapters are written against. */
export const SHOPIFY_API_VERSION = "2026-10";

export interface ShopifyStoreConfig {
  /** `https://<shop>.myshopify.com/api/<version>/graphql.json`. */
  endpoint: string;
  storefrontToken: string;
}

export interface ShopifyEnv {
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?: string;
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?: string;
}

const fromProcess = (): ShopifyEnv => ({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
});

/** The store, or null when either value is missing (the demo then stays on its mock data). */
export function shopifyConfig(env: ShopifyEnv = fromProcess()): ShopifyStoreConfig | null {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const storefrontToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !storefrontToken) return null;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error(
      `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN must be the shop's myshopify.com domain, e.g. things-lab-01.myshopify.com`,
    );
  }
  return {
    endpoint: `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    storefrontToken,
  };
}

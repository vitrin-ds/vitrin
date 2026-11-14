import { describe, expect, it } from "vitest";
import { SHOPIFY_API_VERSION, shopifyConfig } from "./shopify-config";

describe("shopifyConfig", () => {
  it("builds the Storefront endpoint from the shop's domain", () => {
    expect(
      shopifyConfig({
        NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "https://things-lab-01.myshopify.com/",
        NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: " token ",
      }),
    ).toEqual({
      endpoint: `https://things-lab-01.myshopify.com/api/${SHOPIFY_API_VERSION}/graphql.json`,
      storefrontToken: "token",
    });
  });

  it("is null until both values are set", () => {
    expect(shopifyConfig({})).toBeNull();
    expect(
      shopifyConfig({ NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "things-lab-01.myshopify.com" }),
    ).toBeNull();
  });

  it("refuses a domain that isn't the shop's myshopify.com address", () => {
    expect(() =>
      shopifyConfig({
        NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "shop.example.com",
        NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: "token",
      }),
    ).toThrow(/myshopify\.com/);
  });
});

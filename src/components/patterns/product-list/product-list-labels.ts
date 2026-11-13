// UI strings of the product-list block (04 Product List, 08 Search results): the count, the
// range next to the pagination, the Categories tree and the Filter / Sort buttons. English
// placeholder copy from the Figma frames (WD.04.01.01, WD.08.03); pass `labels` to translate.

const NUMBER = new Intl.NumberFormat("en");

export const PRODUCT_LIST_LABELS = {
  /** Figma `2,300 Products` (list header) / PageHeaderLeft subtitle. */
  count: (count: number) => `${NUMBER.format(count)} ${count === 1 ? "Product" : "Products"}`,
  /** Range text left of the pagination, e.g. "25–48 of 120". */
  range: (from: number, to: number, total: number) =>
    `${NUMBER.format(from)}–${NUMBER.format(to)} of ${NUMBER.format(total)}`,
  categories: "Categories",
  categoryToggle: (category: string) => `${category} subcategories`,
  filter: (count: number) => (count > 0 ? `Filter (${count})` : "Filter"),
  sort: "Sort",
};

export type ProductListLabels = typeof PRODUCT_LIST_LABELS;

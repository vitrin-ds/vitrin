// State colours shared by Checkbox and Radio (Figma: semantic interactive-* / icon-* / text-*
// tokens, not input-*). `peer` is the hidden native input, `group` the row label.

/** The glyph wrapper: focus ring, Default · Hover · Disabled · Error colours. */
export function choiceGlyphClass(error: boolean): string {
  return [
    "inline-flex shrink-0 rounded-4 peer-disabled:text-icon-disabled",
    error
      ? "text-icon-error"
      : "text-interactive-default peer-enabled:group-hover:text-interactive-hover",
  ].join(" ");
}

/** The label (no underline on hover, Figma 29 Oct). */
export function choiceLabelClass(error: boolean): string {
  return [error ? "text-text-error" : "text-text-primary", "peer-disabled:text-text-disabled"].join(
    " ",
  );
}

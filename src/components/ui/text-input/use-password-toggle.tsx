"use client";

import { useState } from "react";
import { Icon } from "../icon/icon";

// A password field is a plain Text Input: this hook gives it `type` and the Right Icon as a show /
// hide toggle (visibility / visibility_off). A real button (aria-pressed, one constant name) in the
// `action` slot, 16 from the edge like Figma's icon: the slot leaves 8, the button's padding 8.
// 20px glyph in input-icon, 36px button, 44px hit area.

export const PASSWORD_TOGGLE_LABELS = { show: "Show password" };

export function usePasswordToggle(
  /** The input's id: the button points at it. */
  id: string,
  { disabled = false, show = PASSWORD_TOGGLE_LABELS.show } = {},
) {
  const [visible, setVisible] = useState(false);
  return {
    id,
    disabled,
    type: visible ? "text" : "password",
    // A shown password must not be spell-checked or sent to a spelling service.
    spellCheck: false,
    autoCapitalize: "none",
    action: (
      <button
        type="button"
        aria-label={show}
        aria-pressed={visible}
        aria-controls={id}
        disabled={disabled}
        onClick={() => setVisible((shown) => !shown)}
        className="relative flex cursor-pointer rounded-4 p-8 text-(--th-input-icon) before:absolute before:-inset-4 disabled:cursor-not-allowed disabled:text-(--th-input-icon-disabled)"
      >
        <Icon name={visible ? "visibility_off" : "visibility"} tone="current" />
      </button>
    ),
  };
}

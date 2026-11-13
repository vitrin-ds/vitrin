"use client";

import { useEffect, useState } from "react";

// Scroll-spy for TableOfContents: the active section is the last one whose heading has passed
// the top 30% of the viewport (IntersectionObserver, no scroll handlers). Before the first
// heading nothing is active. Ids that aren't in the DOM are ignored.

/** Viewport band in which a heading becomes current: top 30%. */
const ROOT_MARGIN = "0px 0px -70% 0px";

export function useActiveSection(ids: readonly string[], enabled = true): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const key = ids.join("\u0000");

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const targets = key
      .split("\u0000")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const update = () => {
      const limit = window.innerHeight * 0.3;
      let current: string | undefined;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= limit) current = el.id;
      }
      setActiveId(current);
    };
    const observer = new IntersectionObserver(update, { rootMargin: ROOT_MARGIN });
    targets.forEach((el) => observer.observe(el));
    update();
    return () => observer.disconnect();
  }, [key, enabled]);

  return activeId;
}

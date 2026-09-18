"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Puts every newly opened page at the top.
 *
 * The router does this itself, but on long pages the browser's own scroll
 * restoration can win the race and leave the visitor part-way down — or at
 * the very bottom — of a page they have never seen. Resetting once the new
 * pathname has painted settles it either way.
 *
 * A link carrying a hash (/menu#dum-pukht) is left alone and scrolled to its
 * target instead, which is the whole point of that link.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // The browser's own scrollRestoration is left alone on purpose: turning
    // it off here would fix forward navigation and break the back button,
    // which is supposed to return you to where you were reading.
    const hash = window.location.hash;

    if (hash.length > 1) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default ScrollToTop;

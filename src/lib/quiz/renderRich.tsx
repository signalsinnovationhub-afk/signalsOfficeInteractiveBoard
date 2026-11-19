import { Fragment, type ReactNode } from "react";

/**
 * Renders text with simple inline markup:
 *  - **word** → <strong>
 * Other markdown is ignored.
 */
export function renderRich(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length >= 4) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

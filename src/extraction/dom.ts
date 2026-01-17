import { JSDOM } from 'jsdom';

export interface DomSanitizeOptions {
  removeIframes?: boolean;
  maxChars?: number;
}

export interface SanitizedDomResult {
  html: string;
  truncated: boolean;
}

const INLINE_EVENT_HANDLER = /^on/i;

export function sanitizeDom(html: string, options: DomSanitizeOptions = {}): SanitizedDomResult {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  document.querySelectorAll('script, style, noscript').forEach((node) => {
    node.remove();
  });

  if (options.removeIframes) {
    document.querySelectorAll('iframe').forEach((node) => {
      node.remove();
    });
  }

  document.querySelectorAll('*').forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (INLINE_EVENT_HANDLER.test(attribute.name)) {
        node.removeAttribute(attribute.name);
      }
    }
  });

  const serialized = document.documentElement?.outerHTML ?? '';
  const maxChars = options.maxChars ?? 200_000;
  const truncated = serialized.length > maxChars;
  const htmlOutput = truncated ? `${serialized.slice(0, maxChars)}\n<!-- TRUNCATED -->` : serialized;

  return { html: htmlOutput, truncated };
}

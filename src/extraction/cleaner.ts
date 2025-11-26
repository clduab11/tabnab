import { JSDOM } from 'jsdom';

/**
 * Selectors for elements that should be removed from the page
 */
const REMOVE_SELECTORS = [
  // Scripts and styles
  'script',
  'style',
  'noscript',
  'link[rel="stylesheet"]',

  // Ads and tracking
  'ins.adsbygoogle',
  '[class*="ad-"]',
  '[class*="ads-"]',
  '[class*="advertisement"]',
  '[id*="ad-"]',
  '[id*="ads-"]',
  '[id*="google_ads"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',

  // Social widgets
  '[class*="social-share"]',
  '[class*="share-buttons"]',
  '.fb-like',
  '.twitter-share',

  // Cookie banners and popups
  '[class*="cookie"]',
  '[class*="consent"]',
  '[class*="gdpr"]',
  '[id*="cookie"]',
  '[class*="popup"]',
  '[class*="modal"]',

  // Navigation and headers (often not useful for content)
  'nav',
  'header',
  'footer',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',

  // Comments sections
  '[class*="comment"]',
  '[id*="comment"]',
  '#disqus_thread',

  // Sidebars (often ads/related content)
  'aside',
  '[class*="sidebar"]',
  '[class*="related-"]',
  '[class*="recommended"]',

  // Hidden elements
  '[hidden]',
  '[aria-hidden="true"]',
  '.hidden',
  '.visually-hidden',
  '.sr-only',

  // Forms (usually not content)
  'form:not([class*="search"])',

  // SVG icons and decorative images
  'svg:not([class*="content"])',
  'img[src*="icon"]',
  'img[src*="logo"]',
  'img[width="1"]',
  'img[height="1"]',
];

/**
 * Clean HTML by removing scripts, styles, ads, and non-content elements
 */
export function cleanHtml(html: string, baseUrl?: string): string {
  const dom = new JSDOM(html, {
    url: baseUrl,
  });

  const document = dom.window.document;

  // Remove elements by selector
  for (const selector of REMOVE_SELECTORS) {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    } catch {
      // Invalid selector, skip
    }
  }

  // Remove empty elements
  removeEmptyElements(document);

  // Remove unnecessary attributes
  cleanAttributes(document);

  // Get the cleaned HTML
  const body = document.body;
  return body ? body.innerHTML : '';
}

/**
 * Remove elements that are empty or contain only whitespace
 */
function removeEmptyElements(document: Document): void {
  const emptySelectors = ['div', 'span', 'p', 'section', 'article'];

  for (const selector of emptySelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (!el.textContent?.trim() && !el.querySelector('img, video, audio, canvas')) {
        el.remove();
      }
    });
  }
}

/**
 * Remove unnecessary attributes from elements
 */
function cleanAttributes(document: Document): void {
  const allElements = document.querySelectorAll('*');

  allElements.forEach((el) => {
    // Get all attributes
    const attrs = Array.from(el.attributes);

    for (const attr of attrs) {
      const name = attr.name.toLowerCase();

      // Remove event handlers
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }

      // Remove data attributes
      if (name.startsWith('data-')) {
        el.removeAttribute(attr.name);
        continue;
      }

      // Remove aria attributes
      if (name.startsWith('aria-')) {
        el.removeAttribute(attr.name);
        continue;
      }

      // Remove style and class
      if (name === 'style' || name === 'class' || name === 'id') {
        el.removeAttribute(attr.name);
      }
    }
  });
}

/**
 * Extract main content area if identifiable
 */
export function extractMainContent(html: string, baseUrl?: string): string {
  const dom = new JSDOM(html, {
    url: baseUrl,
  });

  const document = dom.window.document;

  // Try to find main content area
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '#content',
    '#main-content',
    '.content',
    '.main-content',
    '.post-content',
    '.article-content',
    '.entry-content',
  ];

  for (const selector of mainSelectors) {
    const main = document.querySelector(selector);
    if (main && main.textContent && main.textContent.trim().length > 500) {
      return main.outerHTML;
    }
  }

  // Fall back to body
  return document.body?.innerHTML ?? html;
}

/**
 * Get a simplified text representation of the page
 */
export function getSimplifiedText(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove all scripts and styles first
  const scripts = document.querySelectorAll('script, style, noscript');
  scripts.forEach((el) => el.remove());

  // Get text content
  let text = document.body?.textContent ?? '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return text;
}

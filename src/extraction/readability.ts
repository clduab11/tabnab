import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ReadabilityResult {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  siteName: string | null;
}

/**
 * Extract readable content from HTML using Mozilla Readability
 */
export function extractReadableContent(
  html: string,
  url?: string
): ReadabilityResult | null {
  try {
    const dom = new JSDOM(html, {
      url: url ?? 'https://example.com',
    });

    const reader = new Readability(dom.window.document, {
      charThreshold: 100,
      keepClasses: false,
    });

    const article = reader.parse();

    if (!article) {
      return null;
    }

    return {
      title: article.title ?? '',
      content: article.content ?? '',
      textContent: article.textContent ?? '',
      length: article.length ?? 0,
      excerpt: article.excerpt ?? '',
      byline: article.byline,
      siteName: article.siteName,
    };
  } catch (error) {
    console.error('Readability extraction failed:', error);
    return null;
  }
}

/**
 * Check if content is likely to be parseable by Readability
 */
export function isContentParseable(html: string): boolean {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Check if there's substantial text content
    const textContent = document.body?.textContent ?? '';
    const strippedText = textContent.replace(/\s+/g, ' ').trim();

    // Minimum threshold for readable content
    return strippedText.length > 200;
  } catch {
    return false;
  }
}

/**
 * Get page title from HTML
 */
export function getPageTitle(html: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try various sources for title
    const title =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ??
      document.title ??
      document.querySelector('h1')?.textContent ??
      '';

    return title.trim();
  } catch {
    return '';
  }
}

/**
 * Get page description/excerpt from HTML
 */
export function getPageDescription(html: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const description =
      document.querySelector('meta[property="og:description"]')?.getAttribute('content') ??
      document.querySelector('meta[name="description"]')?.getAttribute('content') ??
      document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ??
      '';

    return description.trim();
  } catch {
    return '';
  }
}

import { Page } from 'puppeteer-core';
import { cleanHtml, extractMainContent } from './cleaner';
import { extractReadableContent, getPageTitle } from './readability';
import { htmlToMarkdown, truncateMarkdown } from './turndown';
import { TabContent } from '../mcp/types';

export interface ExtractionOptions {
  maxLength?: number;
  useReadability?: boolean;
  includeMetadata?: boolean;
}

const DEFAULT_MAX_LENGTH = 50000; // ~50KB of markdown

/**
 * Extract clean content from a Puppeteer page
 */
export async function extractPageContent(
  page: Page,
  options: ExtractionOptions = {}
): Promise<TabContent> {
  const {
    maxLength = DEFAULT_MAX_LENGTH,
    useReadability = true,
    includeMetadata = true,
  } = options;

  // Get page info
  const url = page.url();
  const html = await page.content();

  // Get title
  let title = await page.title();
  if (!title) {
    title = getPageTitle(html);
  }

  // Extract content
  let markdown: string;

  if (useReadability) {
    // Try Readability first
    const readableContent = extractReadableContent(html, url);

    if (readableContent && readableContent.content) {
      markdown = htmlToMarkdown(readableContent.content);

      // Add metadata if requested
      if (includeMetadata) {
        const metadataLines: string[] = [];

        if (readableContent.byline) {
          metadataLines.push(`**Author:** ${readableContent.byline}`);
        }

        if (readableContent.siteName) {
          metadataLines.push(`**Source:** ${readableContent.siteName}`);
        }

        if (readableContent.excerpt && readableContent.excerpt !== markdown.substring(0, 100)) {
          metadataLines.push(`**Summary:** ${readableContent.excerpt}`);
        }

        if (metadataLines.length > 0) {
          markdown = metadataLines.join('\n') + '\n\n---\n\n' + markdown;
        }
      }
    } else {
      // Fallback to direct extraction
      markdown = extractFallback(html, url);
    }
  } else {
    // Direct extraction without Readability
    markdown = extractFallback(html, url);
  }

  // Truncate if needed
  if (markdown.length > maxLength) {
    markdown = truncateMarkdown(markdown, maxLength);
  }

  return {
    url,
    title,
    content: markdown,
  };
}

/**
 * Fallback extraction without Readability
 */
function extractFallback(html: string, url: string): string {
  // Try to get main content area
  const mainContent = extractMainContent(html, url);

  // Clean the HTML
  const cleanedHtml = cleanHtml(mainContent, url);

  // Convert to markdown
  return htmlToMarkdown(cleanedHtml);
}

/**
 * Extract content from raw HTML string
 */
export function extractFromHtml(
  html: string,
  url?: string,
  options: ExtractionOptions = {}
): TabContent {
  const {
    maxLength = DEFAULT_MAX_LENGTH,
    useReadability = true,
    includeMetadata = true,
  } = options;

  const title = getPageTitle(html);
  let markdown: string;

  if (useReadability) {
    const readableContent = extractReadableContent(html, url);

    if (readableContent && readableContent.content) {
      markdown = htmlToMarkdown(readableContent.content);

      if (includeMetadata) {
        const metadataLines: string[] = [];

        if (readableContent.byline) {
          metadataLines.push(`**Author:** ${readableContent.byline}`);
        }

        if (readableContent.siteName) {
          metadataLines.push(`**Source:** ${readableContent.siteName}`);
        }

        if (metadataLines.length > 0) {
          markdown = metadataLines.join('\n') + '\n\n---\n\n' + markdown;
        }
      }
    } else {
      markdown = extractFallback(html, url ?? '');
    }
  } else {
    markdown = extractFallback(html, url ?? '');
  }

  if (markdown.length > maxLength) {
    markdown = truncateMarkdown(markdown, maxLength);
  }

  return {
    url: url ?? '',
    title,
    content: markdown,
  };
}

// Re-export individual modules
export { cleanHtml, extractMainContent } from './cleaner';
export { extractReadableContent, getPageTitle, getPageDescription } from './readability';
export { htmlToMarkdown, truncateMarkdown } from './turndown';

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import type { Page } from 'playwright';
import TurndownService from 'turndown';
import { sanitizeDom, type DomSanitizeOptions, type SanitizedDomResult } from './dom.js';

export interface ExtractedContent {
  title: string;
  markdown: string;
  url: string;
}

export interface ExtractedDomContent {
  title: string;
  url: string;
  html: string;
  truncated: boolean;
}

export class MarkdownExtractor {
  private turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
    });

    // Add custom rules for better Markdown conversion
    this.turndown.addRule('removeScripts', {
      filter: ['script', 'style', 'noscript'],
      replacement: () => '',
    });
  }

  async extractFromPage(page: Page): Promise<ExtractedContent> {
    const url = page.url();
    const html = await page.content();

    // Use Mozilla's Readability to extract the main content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      // Fallback to basic extraction if Readability fails
      const title = await page.title();
      const bodyHtml = (await page.evaluate(() => {
        const article = document.querySelector('article');
        const main = document.querySelector('main');
        const content = article || main || document.body;
        return content.innerHTML;
      })) as string;

      const markdown = this.turndown.turndown(bodyHtml);
      return {
        title,
        markdown: markdown.trim(),
        url,
      };
    }

    // Convert the extracted HTML to Markdown
    const markdown = this.turndown.turndown(article.content || '');

    return {
      title: article.title || 'Untitled',
      markdown: markdown.trim(),
      url,
    };
  }

  async extractRawHtml(page: Page): Promise<string> {
    return page.content();
  }

  async extractSanitizedDom(
    page: Page,
    options: DomSanitizeOptions = {}
  ): Promise<ExtractedDomContent> {
    const url = page.url();
    const title = await page.title();
    const html = await page.content();
    const sanitized = sanitizeDom(html, options);

    return {
      title,
      url,
      html: sanitized.html,
      truncated: sanitized.truncated,
    };
  }
}

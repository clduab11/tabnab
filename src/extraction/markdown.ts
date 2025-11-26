import type { Page } from 'puppeteer-core';
import TurndownService from 'turndown';

// Readability.js content extraction script
const READABILITY_SCRIPT = `
(function() {
  // Simplified Readability.js implementation
  function getArticleContent() {
    const article = document.querySelector('article') || document.body;
    return article.innerHTML;
  }
  
  function getPageTitle() {
    return document.title;
  }
  
  return {
    title: getPageTitle(),
    content: getArticleContent()
  };
})();
`;

export interface ExtractedContent {
  title: string;
  markdown: string;
  url: string;
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

    // Execute Readability-like extraction
    const extracted = (await page.evaluate(READABILITY_SCRIPT)) as {
      title: string;
      content: string;
    };

    // Convert HTML to Markdown
    const markdown = this.turndown.turndown(extracted.content);

    return {
      title: extracted.title,
      markdown: markdown.trim(),
      url,
    };
  }

  async extractRawHtml(page: Page): Promise<string> {
    return page.content();
  }
}

import type { Page } from 'puppeteer-core';
import { z } from 'zod';
import { BrowserConnection } from '../browser/connection.js';
import { MarkdownExtractor } from '../extraction/markdown.js';

// Tool input schemas
export const NavigateAndExtractSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

export const ClickElementSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
});

export const FillInputSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  value: z.string(),
});

export const ScreenshotSchema = z.object({
  fullPage: z.boolean().default(false),
  path: z.string().optional(),
});

export type NavigateAndExtractInput = z.infer<typeof NavigateAndExtractSchema>;
export type ClickElementInput = z.infer<typeof ClickElementSchema>;
export type FillInputInput = z.infer<typeof FillInputSchema>;
export type ScreenshotInput = z.infer<typeof ScreenshotSchema>;

export class MCPTools {
  private browserConnection: BrowserConnection;
  private markdownExtractor: MarkdownExtractor;

  constructor(debugPort = 9222) {
    this.browserConnection = new BrowserConnection(debugPort);
    this.markdownExtractor = new MarkdownExtractor();
  }

  /**
   * Get the URL of the currently active tab
   */
  async getActiveTab(): Promise<{ url: string; title: string }> {
    const page = await this.browserConnection.getActiveTab();
    const url = page.url();
    const title = await page.title();

    return { url, title };
  }

  /**
   * Navigate to a URL and extract the page content as Markdown
   */
  async navigateAndExtract(input: NavigateAndExtractInput): Promise<{
    url: string;
    title: string;
    markdown: string;
  }> {
    // Validate input
    const validated = NavigateAndExtractSchema.parse(input);

    const page = await this.browserConnection.getActiveTab();
    await page.goto(validated.url, { waitUntil: 'networkidle2' });

    const extracted = await this.markdownExtractor.extractFromPage(page);

    return extracted;
  }

  /**
   * Click an element on the page
   */
  async clickElement(input: ClickElementInput): Promise<{ success: boolean; message: string }> {
    // Validate input
    const validated = ClickElementSchema.parse(input);

    const page = await this.browserConnection.getActiveTab();

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });
      await page.click(validated.selector);

      return {
        success: true,
        message: `Clicked element: ${validated.selector}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to click element: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Fill an input field on the page
   */
  async fillInput(input: FillInputInput): Promise<{ success: boolean; message: string }> {
    // Validate input
    const validated = FillInputSchema.parse(input);

    const page = await this.browserConnection.getActiveTab();

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });

      // Clear existing content before typing
      await page.$eval(validated.selector, (el) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.value = '';
        }
      });

      // Type the new value
      await page.type(validated.selector, validated.value);

      return {
        success: true,
        message: `Filled input: ${validated.selector}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fill input: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Take a screenshot of the current tab
   */
  async screenshotTab(input: ScreenshotInput): Promise<{
    success: boolean;
    screenshot?: string;
    path?: string;
    message: string;
  }> {
    // Validate input
    const validated = ScreenshotSchema.parse(input);

    const page = await this.browserConnection.getActiveTab();

    try {
      const screenshotOptions: {
        fullPage?: boolean;
        encoding?: 'base64' | 'binary';
        path?: string;
      } = {
        fullPage: validated.fullPage,
        encoding: 'base64',
      };

      if (validated.path) {
        screenshotOptions.path = validated.path;
      }

      const screenshot = await page.screenshot(screenshotOptions);
      const screenshotStr =
        typeof screenshot === 'string' ? screenshot : Buffer.from(screenshot).toString('base64');

      return {
        success: true,
        screenshot: validated.path ? undefined : screenshotStr,
        path: validated.path,
        message: validated.path
          ? `Screenshot saved to: ${validated.path}`
          : 'Screenshot captured as base64',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async disconnect(): Promise<void> {
    await this.browserConnection.disconnect();
  }
}

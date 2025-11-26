import puppeteer, { type Browser, type Page } from 'puppeteer-core';

export class BrowserConnection {
  private browser: Browser | null = null;
  private readonly debugPort: number;

  constructor(debugPort = 9222) {
    this.debugPort = debugPort;
  }

  async connect(): Promise<Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }

    try {
      this.browser = await puppeteer.connect({
        browserURL: `http://localhost:${this.debugPort}`,
        defaultViewport: null,
      });

      return this.browser;
    } catch (error) {
      throw new Error(
        `Failed to connect to Chrome on port ${this.debugPort}. ` +
          `Make sure Chrome is running with --remote-debugging-port=${this.debugPort}. ` +
          `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getActiveTab(): Promise<Page> {
    const browser = await this.connect();
    const pages = await browser.pages();

    if (pages.length === 0) {
      throw new Error('No tabs found in the browser');
    }

    // Try to find the active tab by checking if the page has focus
    // We'll use the most recently accessed page as a heuristic
    // Fallback to the last page in the list (usually the most recent)
    return pages[pages.length - 1];
  }

  async getAllTabs(): Promise<Page[]> {
    const browser = await this.connect();
    return browser.pages();
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      await this.browser.disconnect();
      this.browser = null;
    }
  }

  isConnected(): boolean {
    return this.browser?.connected ?? false;
  }
}

import puppeteer, { Browser, Page } from 'puppeteer-core';
import { BrowserState, TabNabConfig, defaultConfig, Logger } from '../mcp/types';

export class BrowserConnection {
  private browser: Browser | null = null;
  private config: TabNabConfig;
  private logger: Logger;

  constructor(config: Partial<TabNabConfig> = {}, logger?: Logger) {
    this.config = { ...defaultConfig, ...config };
    this.logger = logger ?? this.createDefaultLogger();
  }

  private createDefaultLogger(): Logger {
    const levels = ['debug', 'info', 'warn', 'error'] as const;
    const currentLevel = levels.indexOf(this.config.logLevel);

    const shouldLog = (level: typeof levels[number]) => {
      return levels.indexOf(level) >= currentLevel;
    };

    return {
      debug: (msg, ...args) => shouldLog('debug') && console.log(`[DEBUG] ${msg}`, ...args),
      info: (msg, ...args) => shouldLog('info') && console.log(`[INFO] ${msg}`, ...args),
      warn: (msg, ...args) => shouldLog('warn') && console.warn(`[WARN] ${msg}`, ...args),
      error: (msg, ...args) => shouldLog('error') && console.error(`[ERROR] ${msg}`, ...args),
    };
  }

  get debugUrl(): string {
    return `http://${this.config.chromeDebugHost}:${this.config.chromeDebugPort}`;
  }

  async connect(): Promise<BrowserState> {
    try {
      this.logger.info(`Connecting to Chrome at ${this.debugUrl}...`);

      this.browser = await puppeteer.connect({
        browserURL: this.debugUrl,
        defaultViewport: null, // Use existing viewport
      });

      this.logger.info('Successfully connected to Chrome');

      // Set up disconnect handler for auto-reconnect
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected');
        this.browser = null;
      });

      return {
        connected: true,
        debugUrl: this.debugUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Chrome: ${errorMessage}`);

      return {
        connected: false,
        debugUrl: this.debugUrl,
        error: `Failed to connect to Chrome at ${this.debugUrl}. Make sure Chrome is running with --remote-debugging-port=${this.config.chromeDebugPort}`,
      };
    }
  }

  async ensureConnected(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      const state = await this.connect();
      if (!state.connected || !this.browser) {
        throw new Error(state.error ?? 'Failed to connect to Chrome');
      }
    }
    return this.browser;
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      try {
        this.browser.disconnect();
        this.logger.info('Disconnected from Chrome');
      } catch (error) {
        this.logger.warn('Error during disconnect:', error);
      }
      this.browser = null;
    }
  }

  async getActivePage(): Promise<Page> {
    const browser = await this.ensureConnected();
    const pages = await browser.pages();

    if (pages.length === 0) {
      throw new Error('No tabs found in Chrome');
    }

    // Try to find the most recently focused page
    // Chrome doesn't expose focus state directly, so we use the last page
    // In practice, the active tab is usually the last one in the list
    // or we can try to find one that's visible
    for (const page of pages.reverse()) {
      try {
        // Check if page is accessible
        await page.evaluate(() => document.readyState);
        return page;
      } catch {
        // Page might be crashed or inaccessible, try next
        continue;
      }
    }

    // Fallback to first accessible page
    const firstPage = pages[0];
    if (!firstPage) {
      throw new Error('No accessible tabs found');
    }
    return firstPage;
  }

  async getAllPages(): Promise<Page[]> {
    const browser = await this.ensureConnected();
    return browser.pages();
  }

  async createNewPage(): Promise<Page> {
    const browser = await this.ensureConnected();
    const page = await browser.newPage();
    return page;
  }

  async getPageByUrl(url: string): Promise<Page | null> {
    const pages = await this.getAllPages();
    for (const page of pages) {
      try {
        const pageUrl = page.url();
        if (pageUrl === url || pageUrl.startsWith(url)) {
          return page;
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  isConnected(): boolean {
    return this.browser !== null && this.browser.connected;
  }

  getState(): BrowserState {
    return {
      connected: this.isConnected(),
      debugUrl: this.debugUrl,
    };
  }
}

// Singleton instance for the application
let browserInstance: BrowserConnection | null = null;

export function getBrowserConnection(config?: Partial<TabNabConfig>, logger?: Logger): BrowserConnection {
  if (!browserInstance) {
    browserInstance = new BrowserConnection(config, logger);
  }
  return browserInstance;
}

export function resetBrowserConnection(): void {
  if (browserInstance) {
    browserInstance.disconnect();
    browserInstance = null;
  }
}

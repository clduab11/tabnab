import { Page, ElementHandle } from 'puppeteer-core';

export interface WaitOptions {
  timeout?: number;
  waitFor?: string;
}

const DEFAULT_TIMEOUT = 30000;

/**
 * Wait for page to be ready for extraction
 */
export async function waitForPageReady(page: Page, options: WaitOptions = {}): Promise<void> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  // Wait for DOM to be loaded
  await page.waitForFunction(
    () => document.readyState === 'complete' || document.readyState === 'interactive',
    { timeout }
  );

  // If a specific selector is provided, wait for it
  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout });
  }

  // Small delay to allow dynamic content to load
  await delay(500);
}

/**
 * Navigate to URL and wait for page to be ready
 */
export async function navigateAndWait(
  page: Page,
  url: string,
  options: WaitOptions = {}
): Promise<void> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout,
  });

  await waitForPageReady(page, options);
}

/**
 * Find element by CSS selector
 */
export async function findBySelector(page: Page, selector: string): Promise<ElementHandle | null> {
  try {
    return await page.$(selector);
  } catch {
    return null;
  }
}

/**
 * Find element by text content
 */
export async function findByText(page: Page, text: string): Promise<ElementHandle<Element> | null> {
  try {
    // Use evaluate to find elements by text content
    const element = await page.evaluateHandle((searchText: string) => {
      // Helper to check if element contains text
      const containsText = (el: Element): boolean => {
        return el.textContent?.includes(searchText) ?? false;
      };

      // First try buttons and links
      const clickables = Array.from(
        document.querySelectorAll('button, a, [role="button"], input[type="submit"], input[type="button"]')
      );
      for (const el of clickables) {
        if (containsText(el) || (el as HTMLInputElement).value?.includes(searchText)) {
          return el;
        }
      }

      // Then try any element with the text
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        // Check direct text content
        const directText = Array.from(el.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join('');
        if (directText.includes(searchText)) {
          return el;
        }
      }

      return null;
    }, text);

    const elementHandle = element.asElement();
    if (elementHandle) {
      return elementHandle as ElementHandle<Element>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get element bounding box center coordinates
 */
export async function getElementCenter(
  element: ElementHandle
): Promise<{ x: number; y: number } | null> {
  const box = await element.boundingBox();
  if (!box) return null;

  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Scroll element into view if needed
 */
export async function scrollIntoViewIfNeeded(element: ElementHandle): Promise<void> {
  await element.evaluate((el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await delay(300); // Wait for scroll to complete
}

/**
 * Check if element is visible in viewport
 */
export async function isElementVisible(element: ElementHandle): Promise<boolean> {
  try {
    const isVisible = await element.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        parseFloat(style.opacity) > 0 &&
        el.getBoundingClientRect().height > 0
      );
    });
    return isVisible;
  } catch {
    return false;
  }
}

/**
 * Wait for navigation after an action
 */
export async function waitForNavigationOptional(
  page: Page,
  action: () => Promise<void>,
  timeout = 5000
): Promise<boolean> {
  const startUrl = page.url();

  try {
    await Promise.all([
      page.waitForNavigation({ timeout, waitUntil: 'networkidle2' }),
      action(),
    ]);
    return page.url() !== startUrl;
  } catch {
    // Navigation didn't occur, that's okay
    return false;
  }
}

/**
 * Get page HTML content
 */
export async function getPageHtml(page: Page): Promise<string> {
  return page.content();
}

/**
 * Get page title
 */
export async function getPageTitle(page: Page): Promise<string> {
  return page.title();
}

/**
 * Get page URL
 */
export function getPageUrl(page: Page): string {
  return page.url();
}

/**
 * Simple delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Random delay within a range
 */
export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

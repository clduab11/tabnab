import { Page, ElementHandle } from 'puppeteer-core';
import { TabNabConfig, defaultConfig } from '../mcp/types';
import { getElementCenter, scrollIntoViewIfNeeded, delay, randomDelay } from './pageUtils';

export class HumanBehavior {
  private config: TabNabConfig;

  constructor(config: Partial<TabNabConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Move mouse with human-like curves to target position
   */
  async humanMouseMove(
    page: Page,
    targetX: number,
    targetY: number
  ): Promise<void> {
    if (!this.config.humanizeDelays) {
      await page.mouse.move(targetX, targetY);
      return;
    }

    // Get current mouse position (or start from center)
    const viewport = page.viewport();
    const startX = viewport ? viewport.width / 2 : 500;
    const startY = viewport ? viewport.height / 2 : 300;

    // Create bezier curve points for natural movement
    const steps = 10 + Math.floor(Math.random() * 10);
    const controlX1 = startX + (Math.random() - 0.5) * 100;
    const controlY1 = startY + (Math.random() - 0.5) * 100;
    const controlX2 = targetX + (Math.random() - 0.5) * 50;
    const controlY2 = targetY + (Math.random() - 0.5) * 50;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Cubic bezier interpolation
      const x = this.bezier(t, startX, controlX1, controlX2, targetX);
      const y = this.bezier(t, startY, controlY1, controlY2, targetY);

      await page.mouse.move(x, y);
      await delay(Math.random() * 20 + 5);
    }
  }

  private bezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const oneMinusT = 1 - t;
    return (
      Math.pow(oneMinusT, 3) * p0 +
      3 * Math.pow(oneMinusT, 2) * t * p1 +
      3 * oneMinusT * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  }

  /**
   * Click element with human-like behavior
   */
  async humanClick(page: Page, element: ElementHandle): Promise<void> {
    // Scroll element into view first
    await scrollIntoViewIfNeeded(element);

    // Get element center
    const center = await getElementCenter(element);
    if (!center) {
      // Fallback to regular click
      await element.click();
      return;
    }

    // Add slight randomness to click position
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    const targetX = center.x + offsetX;
    const targetY = center.y + offsetY;

    if (this.config.humanizeDelays) {
      // Move mouse to element
      await this.humanMouseMove(page, targetX, targetY);

      // Random pre-click delay
      await randomDelay(this.config.minClickDelay, this.config.maxClickDelay);
    }

    // Click
    await page.mouse.click(targetX, targetY);

    if (this.config.humanizeDelays) {
      // Random post-click delay
      await randomDelay(100, 200);
    }
  }

  /**
   * Type text with human-like delays between keystrokes
   */
  async humanType(page: Page, text: string): Promise<void> {
    for (const char of text) {
      await page.keyboard.type(char);

      if (this.config.humanizeDelays) {
        // Variable delay between keystrokes
        let charDelay = Math.random() *
          (this.config.maxTypingDelay - this.config.minTypingDelay) +
          this.config.minTypingDelay;

        // Occasionally add longer pauses (like humans thinking)
        if (Math.random() < 0.1) {
          charDelay += Math.random() * 200;
        }

        // Speed up for repeated characters
        if (text.indexOf(char) < text.lastIndexOf(char)) {
          charDelay *= 0.8;
        }

        await delay(charDelay);
      }
    }
  }

  /**
   * Fill input with human-like typing
   */
  async humanFillInput(
    page: Page,
    element: ElementHandle,
    value: string
  ): Promise<void> {
    // Focus the element with a click
    await this.humanClick(page, element);

    // Small delay before typing
    if (this.config.humanizeDelays) {
      await randomDelay(200, 400);
    }

    // Clear existing content
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await delay(50);

    // Type the new value
    await this.humanType(page, value);
  }

  /**
   * Press Enter key with natural delay
   */
  async humanPressEnter(page: Page): Promise<void> {
    if (this.config.humanizeDelays) {
      await randomDelay(200, 500);
    }
    await page.keyboard.press('Enter');
  }

  /**
   * Random scroll to simulate reading
   */
  async randomScroll(page: Page): Promise<void> {
    const scrollAmount = Math.floor(Math.random() * 300) + 100;
    const direction = Math.random() > 0.5 ? 1 : -1;

    await page.evaluate((amount: number) => {
      window.scrollBy({ top: amount, behavior: 'smooth' });
    }, scrollAmount * direction);

    await randomDelay(500, 1000);
  }

  /**
   * Add random mouse jitter to avoid detection
   */
  async addMouseJitter(page: Page): Promise<void> {
    const viewport = page.viewport();
    if (!viewport) return;

    const jitterX = Math.random() * 50 - 25;
    const jitterY = Math.random() * 50 - 25;
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    await page.mouse.move(centerX + jitterX, centerY + jitterY);
    await delay(100);
  }
}

// Singleton instance
let humanBehaviorInstance: HumanBehavior | null = null;

export function getHumanBehavior(config?: Partial<TabNabConfig>): HumanBehavior {
  if (!humanBehaviorInstance) {
    humanBehaviorInstance = new HumanBehavior(config);
  }
  return humanBehaviorInstance;
}

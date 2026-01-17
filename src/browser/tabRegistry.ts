import type { Page } from 'playwright';

export type TabSummary = {
  tabId: string;
  title: string;
  url: string;
  active: boolean;
  windowId?: string;
};

type TargetInfo = {
  targetId?: string;
  windowId?: string;
};

export class TabRegistry {
  private map = new WeakMap<Page, string>();
  private reverse = new Map<string, Page>();
  private counter = 0;
  private lastFocusedTabId: string | null = null;

  async refresh(pages: Page[]): Promise<void> {
    const current = new Set(pages);
    for (const [id, page] of this.reverse.entries()) {
      if (!current.has(page)) {
        this.reverse.delete(id);
      }
    }

    await Promise.all(pages.map((page) => this.getId(page)));
  }

  async getId(page: Page): Promise<string> {
    const existing = this.map.get(page);
    if (existing) {
      return existing;
    }

    const targetId = await this.getTargetId(page);
    const id = targetId ?? `tab-${++this.counter}`;
    this.map.set(page, id);
    this.reverse.set(id, page);
    return id;
  }

  getPage(id: string): Page | undefined {
    return this.reverse.get(id);
  }

  async markFocused(page: Page): Promise<void> {
    this.lastFocusedTabId = await this.getId(page);
  }

  async getActivePage(pages: Page[]): Promise<Page | undefined> {
    await this.refresh(pages);

    // Active tab strategy: prefer a focused page if detectable (document.hasFocus),
    // otherwise fall back to the last focused tab we observed, otherwise choose the
    // first non-extension/non-devtools/non-blank tab, finally fall back to the most
    // recent page (last in the list) to match BrowserConnection.getActiveTab() behavior.
    const focused = await this.findFocusedPage(pages);
    if (focused) {
      return focused;
    }

    if (this.lastFocusedTabId) {
      const lastFocused = this.getPage(this.lastFocusedTabId);
      if (lastFocused) {
        return lastFocused;
      }
    }

    const nonIgnored = pages.find((page) => {
      const url = page.url();
      return !isIgnoredUrl(url) && url !== 'about:blank';
    });
    if (nonIgnored) {
      return nonIgnored;
    }
    
    // Fallback to last page (most recent) to match BrowserConnection.getActiveTab()
    return pages[pages.length - 1];
  }

  async listTabs(pages: Page[]): Promise<TabSummary[]> {
    const activePage = await this.getActivePage(pages);
    const activeId = activePage ? await this.getId(activePage) : null;

    return Promise.all(
      pages.map(async (page) => {
        const tabId = await this.getId(page);
        const url = page.url();
        const title = await safeTitle(page);
        const windowId = await this.getWindowId(page);
        return {
          tabId,
          title,
          url,
          active: tabId === activeId,
          windowId,
        };
      })
    );
  }

  private async findFocusedPage(pages: Page[]): Promise<Page | null> {
    const focusStates = await Promise.all(
      pages.map(async (page) => {
        const url = page.url();
        if (isIgnoredUrl(url) || url === 'about:blank') {
          return false;
        }
        try {
          return (await page.evaluate(() => document.hasFocus())) as boolean;
        } catch {
          return false;
        }
      })
    );

    const index = focusStates.findIndex(Boolean);
    return index >= 0 ? pages[index] : null;
  }

  private async getTargetId(page: Page): Promise<string | undefined> {
    try {
      const session = await page.context().newCDPSession(page);
      const result = (await session.send('Target.getTargetInfo')) as {
        targetInfo?: TargetInfo;
      };
      await session.detach();
      return result.targetInfo?.targetId;
    } catch {
      return undefined;
    }
  }

  private async getWindowId(page: Page): Promise<string | undefined> {
    try {
      const session = await page.context().newCDPSession(page);
      const targetInfo = (await session.send('Target.getTargetInfo')) as {
        targetInfo?: TargetInfo;
      };
      const targetId = targetInfo.targetInfo?.targetId;
      if (!targetId) {
        await session.detach();
        return undefined;
      }
      const result = (await session.send('Browser.getWindowForTarget', {
        targetId,
      })) as { windowId?: number };
      await session.detach();
      return result.windowId !== undefined ? String(result.windowId) : undefined;
    } catch {
      return undefined;
    }
  }
}

async function safeTitle(page: Page): Promise<string> {
  try {
    return await page.title();
  } catch {
    return '';
  }
}

function isIgnoredUrl(url: string): boolean {
  return (
    url.startsWith('chrome-extension://') ||
    url.startsWith('chrome://') ||
    url.startsWith('devtools://')
  );
}

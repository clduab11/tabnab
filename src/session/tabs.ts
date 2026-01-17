import type { Page } from 'playwright';

export class TabRegistry {
  private map = new WeakMap<Page, string>();
  private reverse = new Map<string, Page>();
  private counter = 0;

  getId(page: Page): string {
    const existing = this.map.get(page);
    if (existing) {
      return existing;
    }
    const id = `tab-${++this.counter}`;
    this.map.set(page, id);
    this.reverse.set(id, page);
    return id;
  }

  getPage(id: string): Page | undefined {
    return this.reverse.get(id);
  }

  refresh(pages: Page[]): void {
    const current = new Set(pages);
    for (const [id, page] of this.reverse.entries()) {
      if (!current.has(page)) {
        this.reverse.delete(id);
      }
    }
  }
}

export class SessionManager {
  private stepCount = 0;
  private lastActionAt = 0;
  private activeTabId: string | null = null;

  constructor(private maxSteps: number) {}

  getStepsRemaining(): number {
    return Math.max(this.maxSteps - this.stepCount, 0);
  }

  recordStep(): boolean {
    if (this.stepCount >= this.maxSteps) {
      return false;
    }

    this.stepCount += 1;
    this.lastActionAt = Date.now();
    return true;
  }

  setActiveTabId(tabId: string | null): void {
    this.activeTabId = tabId;
  }

  getActiveTabId(): string | null {
    return this.activeTabId;
  }

  reset(): void {
    this.stepCount = 0;
    this.lastActionAt = 0;
    this.activeTabId = null;
  }
}

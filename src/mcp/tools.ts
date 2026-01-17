import { z } from 'zod';
import { BrowserConnection } from '../browser/connection.js';
import { MarkdownExtractor } from '../extraction/markdown.js';
import { detectPromptInjection, buildInjectionWarnings } from '../policy/prompts.js';
import { enforcePolicy, loadPolicyConfig } from '../policy/policy.js';
import { AuditLogger } from '../policy/audit.js';
import { ConfirmationStore } from '../policy/confirmations.js';
import type { PolicyConfig } from '../policy/types.js';
import { SessionManager } from '../session/session.js';
import { TabRegistry } from '../session/tabs.js';
import type { Page } from 'playwright';
import { JSDOM } from 'jsdom';

const ExtractionModeSchema = z.enum(['readability_markdown', 'raw_dom_sanitized']);

export const NavigateAndExtractSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  extractionMode: ExtractionModeSchema.default('readability_markdown'),
  includeWarnings: z.boolean().default(true),
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

export const ActivateTabSchema = z.object({
  tabId: z.string().min(1, 'Tab ID is required'),
});

export const WaitForSelectorSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  timeoutMs: z.number().int().positive().optional(),
});

export const WaitForNavigationSchema = z.object({
  timeoutMs: z.number().int().positive().optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
});

export const QuerySelectorAllSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  attributes: z.array(z.string()).optional(),
  maxItems: z.number().int().positive().optional(),
});

export const KeyboardTypeSchema = z.object({
  text: z.string(),
});

export const PressKeySchema = z.object({
  key: z.string().min(1, 'Key is required'),
});

export const ConfirmActionSchema = z.object({
  confirmationToken: z.string().min(1, 'Confirmation token is required'),
  action: z.enum(['confirm', 'cancel']).default('confirm'),
});

export type NavigateAndExtractInput = z.input<typeof NavigateAndExtractSchema>;
export type ClickElementInput = z.infer<typeof ClickElementSchema>;
export type FillInputInput = z.infer<typeof FillInputSchema>;
export type ScreenshotInput = z.infer<typeof ScreenshotSchema>;
export type ActivateTabInput = z.infer<typeof ActivateTabSchema>;
export type WaitForSelectorInput = z.infer<typeof WaitForSelectorSchema>;
export type WaitForNavigationInput = z.infer<typeof WaitForNavigationSchema>;
export type QuerySelectorAllInput = z.infer<typeof QuerySelectorAllSchema>;
export type KeyboardTypeInput = z.infer<typeof KeyboardTypeSchema>;
export type PressKeyInput = z.infer<typeof PressKeySchema>;
export type ConfirmActionInput = z.input<typeof ConfirmActionSchema>;

type ToolResponse<T> = {
  ok: boolean;
  data?: T;
  warnings: string[];
  auditId?: string;
  status?: 'needs_confirmation';
  confirmation_token?: string;
  summary?: string;
  next_call_hint?: string;
  reasonCodes?: string[];
  message?: string;
};

type PendingAction = ToolResponse<unknown>;

export interface MCPToolsOptions {
  debugPort?: number;
  connection?: BrowserConnection;
  extractor?: MarkdownExtractor;
  policyConfig?: PolicyConfig;
}

export class MCPTools {
  private browserConnection: BrowserConnection;
  private markdownExtractor: MarkdownExtractor;
  private policyConfig: PolicyConfig;
  private auditLogger: AuditLogger;
  private confirmations = new ConfirmationStore<ToolResponse<unknown>>();
  private session: SessionManager;
  private tabs = new TabRegistry();
  private lastUsedTabId: string | null = null;

  constructor(options: number | MCPToolsOptions = 9222) {
    const resolvedOptions = typeof options === 'number' ? { debugPort: options } : options;
    const policyConfig = resolvedOptions.policyConfig ?? loadPolicyConfig();

    this.browserConnection =
      resolvedOptions.connection ?? new BrowserConnection(resolvedOptions.debugPort ?? 9222);
    this.markdownExtractor = resolvedOptions.extractor ?? new MarkdownExtractor();
    this.policyConfig = policyConfig;
    this.auditLogger = new AuditLogger(policyConfig);
    this.session = new SessionManager(policyConfig.maxSteps);
  }

  async getActiveTab(): Promise<ToolResponse<{ url: string; title: string }>> {
    const page = await this.getActivePage();
    const url = page.url();
    const title = await page.title();

    return { ok: true, data: { url, title }, warnings: [] };
  }

  async listTabs(): Promise<ToolResponse<{ tabId: string; url: string; title: string }[]>> {
    const pages = await this.browserConnection.getAllTabs();
    if (pages.length === 0) {
      return {
        ok: false,
        warnings: [],
        message: 'No tabs found in the browser',
      };
    }

    this.tabs.refresh(pages);
    const results = await Promise.all(
      pages.map(async (page) => ({
        tabId: this.tabs.getId(page),
        url: page.url(),
        title: await page.title(),
      }))
    );

    return { ok: true, data: results, warnings: [] };
  }

  async activateTab(input: ActivateTabInput): Promise<ToolResponse<{ tabId: string }>> {
    const validated = ActivateTabSchema.parse(input);
    const pages = await this.browserConnection.getAllTabs();
    this.tabs.refresh(pages);
    const page = this.tabs.getPage(validated.tabId);

    if (!page) {
      return { ok: false, warnings: [], message: 'Tab not found' };
    }

    this.session.setActiveTabId(validated.tabId);
    this.lastUsedTabId = validated.tabId;
    await page.bringToFront();

    return { ok: true, data: { tabId: validated.tabId }, warnings: [] };
  }

  async navigateAndExtract(
    input: NavigateAndExtractInput
  ): Promise<
    ToolResponse<{ url: string; title: string; markdown?: string; html?: string; truncated?: boolean }>
  > {
    const validated = NavigateAndExtractSchema.parse(input);
    const page = await this.getActivePage();

    const policyDecision = enforcePolicy(
      {
        toolName: 'navigate_and_extract',
        url: validated.url,
        actionType: 'navigate',
        isNavigation: true,
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'navigate_and_extract',
        actionType: 'navigate',
        url: validated.url,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Navigation blocked by policy.',
        auditId,
      };
    }

    if (policyDecision.requiresConfirmation) {
      const pending = this.confirmations.create(
        `Navigate to ${validated.url} and extract content`,
        async () => this.executeNavigateAndExtract(validated, page)
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'navigate_and_extract',
        actionType: 'navigate',
        url: validated.url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        status: 'needs_confirmation',
        confirmation_token: pending.token,
        summary: pending.summary,
        next_call_hint: 'Use confirm_action with the confirmation_token to proceed.',
        auditId,
      };
    }

    return this.executeNavigateAndExtract(validated, page);
  }

  async clickElement(input: ClickElementInput): Promise<ToolResponse<{ message: string }>> {
    const validated = ClickElementSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();
    const elementText = await this.safeGetElementText(page, validated.selector);

    const policyDecision = enforcePolicy(
      {
        toolName: 'click_element',
        url,
        selector: validated.selector,
        elementText,
        actionType: 'click',
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'click_element',
        actionType: 'click',
        url,
        selector: validated.selector,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Click blocked by policy.',
        auditId,
      };
    }

    if (policyDecision.requiresConfirmation) {
      const pending = this.confirmations.create(
        `Click ${validated.selector} on ${url}`,
        async () => this.executeClick(validated, page)
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'click_element',
        actionType: 'click',
        url,
        selector: validated.selector,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        status: 'needs_confirmation',
        confirmation_token: pending.token,
        summary: pending.summary,
        next_call_hint: 'Use confirm_action with the confirmation_token to proceed.',
        auditId,
      };
    }

    return this.executeClick(validated, page);
  }

  async fillInput(input: FillInputInput): Promise<ToolResponse<{ message: string }>> {
    const validated = FillInputSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'fill_input',
        url,
        selector: validated.selector,
        actionType: 'fill',
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'fill_input',
        actionType: 'fill',
        url,
        selector: validated.selector,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Fill blocked by policy.',
        auditId,
      };
    }

    if (policyDecision.requiresConfirmation) {
      const pending = this.confirmations.create(
        `Fill ${validated.selector} on ${url}`,
        async () => this.executeFill(validated, page)
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'fill_input',
        actionType: 'fill',
        url,
        selector: validated.selector,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        status: 'needs_confirmation',
        confirmation_token: pending.token,
        summary: pending.summary,
        next_call_hint: 'Use confirm_action with the confirmation_token to proceed.',
        auditId,
      };
    }

    return this.executeFill(validated, page);
  }

  async keyboardType(input: KeyboardTypeInput): Promise<ToolResponse<{ message: string }>> {
    const validated = KeyboardTypeSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'keyboard_type',
        url,
        actionType: 'keyboard_type',
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'keyboard_type',
        actionType: 'keyboard_type',
        url,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Keyboard input blocked by policy.',
        auditId,
      };
    }

    if (policyDecision.requiresConfirmation) {
      const pending = this.confirmations.create(
        `Type text on ${url}`,
        async () => this.executeKeyboardType(validated, page)
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'keyboard_type',
        actionType: 'keyboard_type',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        status: 'needs_confirmation',
        confirmation_token: pending.token,
        summary: pending.summary,
        next_call_hint: 'Use confirm_action with the confirmation_token to proceed.',
        auditId,
      };
    }

    return this.executeKeyboardType(validated, page);
  }

  async pressKey(input: PressKeyInput): Promise<ToolResponse<{ message: string }>> {
    const validated = PressKeySchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'press_key',
        url,
        actionType: 'press_key',
        key: validated.key,
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'press_key',
        actionType: 'press_key',
        url,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Key press blocked by policy.',
        auditId,
      };
    }

    if (policyDecision.requiresConfirmation) {
      const pending = this.confirmations.create(
        `Press ${validated.key} on ${url}`,
        async () => this.executePressKey(validated, page)
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'press_key',
        actionType: 'press_key',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        status: 'needs_confirmation',
        confirmation_token: pending.token,
        summary: pending.summary,
        next_call_hint: 'Use confirm_action with the confirmation_token to proceed.',
        auditId,
      };
    }

    return this.executePressKey(validated, page);
  }

  async waitForSelector(
    input: WaitForSelectorInput
  ): Promise<ToolResponse<{ found: boolean; url: string; title: string }>> {
    const validated = WaitForSelectorSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'wait_for_selector',
        url,
        selector: validated.selector,
        actionType: 'wait_for_selector',
        isReadOnly: false,
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'wait_for_selector',
        actionType: 'wait_for_selector',
        url,
        selector: validated.selector,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Wait blocked by policy.',
        auditId,
      };
    }

    try {
      await page.waitForSelector(validated.selector, {
        timeout: validated.timeoutMs ?? 5000,
      });
      const title = await page.title();
      return {
        ok: true,
        data: { found: true, url, title },
        warnings: [],
      };
    } catch {
      const title = await page.title();
      return {
        ok: true,
        data: { found: false, url, title },
        warnings: [],
      };
    }
  }

  async waitForNavigation(
    input: WaitForNavigationInput
  ): Promise<ToolResponse<{ url: string; title: string }>> {
    const validated = WaitForNavigationSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'wait_for_navigation',
        url,
        actionType: 'wait_for_navigation',
        isNavigation: true,
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'wait_for_navigation',
        actionType: 'wait_for_navigation',
        url,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Navigation wait blocked by policy.',
        auditId,
      };
    }

    await page.waitForNavigation({
      timeout: validated.timeoutMs ?? 10000,
      waitUntil: validated.waitUntil ?? 'load',
    });

    const title = await page.title();
    return { ok: true, data: { url: page.url(), title }, warnings: [] };
  }

  async querySelectorAll(
    input: QuerySelectorAllInput
  ): Promise<ToolResponse<{ items: { text: string; attrs: Record<string, string> }[] }>> {
    const validated = QuerySelectorAllSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'query_selector_all',
        url,
        selector: validated.selector,
        actionType: 'query_selector_all',
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'query_selector_all',
        actionType: 'query_selector_all',
        url,
        selector: validated.selector,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Query blocked by policy.',
        auditId,
      };
    }

    const maxItems = validated.maxItems ?? 50;
    const attributes = validated.attributes ?? [];

    const items = (await page.$$eval(
      validated.selector,
      (nodes: Element[], payload: { attrs: string[]; limit: number }) =>
        nodes.slice(0, payload.limit).map((node) => {
          const element = node as HTMLElement;
          const text = element.innerText || element.textContent || '';
          const attrsResult: Record<string, string> = {};
          for (const attr of payload.attrs) {
            const value = element.getAttribute(attr);
            if (value !== null) {
              attrsResult[attr] = value;
            }
          }
          return { text: text.trim(), attrs: attrsResult };
        }),
      { attrs: attributes, limit: maxItems }
    )) as { text: string; attrs: Record<string, string> }[];

    return { ok: true, data: { items }, warnings: [] };
  }

  async screenshotTab(
    input: ScreenshotInput
  ): Promise<ToolResponse<{ screenshot?: string; path?: string; message: string }>> {
    const validated = ScreenshotSchema.parse(input);
    const page = await this.getActivePage();
    const url = page.url();

    const policyDecision = enforcePolicy(
      {
        toolName: 'screenshot_tab',
        url,
        actionType: 'screenshot',
      },
      this.policyConfig
    );

    if (!policyDecision.allowed) {
      const auditId = await this.auditLogger.logEvent({
        toolName: 'screenshot_tab',
        actionType: 'screenshot',
        url,
        outcome: 'denied',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ok: false,
        warnings: [],
        reasonCodes: policyDecision.reasonCodes,
        message: 'Screenshot blocked by policy.',
        auditId,
      };
    }

    try {
      const screenshot = await page.screenshot({
        fullPage: validated.fullPage,
        path: validated.path,
      });
      const screenshotStr = Buffer.from(screenshot).toString('base64');
      const auditId = await this.auditLogger.logEvent({
        toolName: 'screenshot_tab',
        actionType: 'screenshot',
        url,
        outcome: 'allowed',
      });

      return {
        ok: true,
        data: {
          screenshot: validated.path ? undefined : screenshotStr,
          path: validated.path,
          message: validated.path
            ? `Screenshot saved to: ${validated.path}`
            : 'Screenshot captured as base64',
        },
        warnings: [],
        auditId,
      };
    } catch (error) {
      return {
        ok: false,
        warnings: [],
        message: `Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async confirmAction(input: ConfirmActionInput): Promise<ToolResponse<unknown>> {
    const validated = ConfirmActionSchema.parse(input);
    if (validated.action === 'cancel') {
      this.confirmations.consume(validated.confirmationToken);
      return { ok: true, warnings: [], data: { cancelled: true } };
    }

    const pending = this.confirmations.consume(validated.confirmationToken);
    if (!pending) {
      return { ok: false, warnings: [], message: 'Confirmation token expired or invalid.' };
    }

    return pending.execute();
  }

  async resetSession(): Promise<ToolResponse<{ reset: boolean }>> {
    this.session.reset();
    this.confirmations.clear();
    return { ok: true, warnings: [], data: { reset: true } };
  }

  async disconnect(): Promise<void> {
    await this.browserConnection.disconnect();
  }

  private async executeNavigateAndExtract(
    validated: NavigateAndExtractInput,
    page: Page
  ): Promise<
    ToolResponse<{ url: string; title: string; markdown?: string; html?: string; truncated?: boolean }>
  > {
    if (!this.session.recordStep()) {
      return {
        ok: false,
        warnings: [],
        reasonCodes: ['max_steps_exceeded'],
        message: 'Session step limit exceeded. Use reset_session to continue.',
      };
    }

    await page.goto(validated.url, { waitUntil: 'networkidle' });
    this.lastUsedTabId = this.tabs.getId(page);

    if (validated.extractionMode === 'raw_dom_sanitized') {
      const extracted = await this.markdownExtractor.extractSanitizedDom(page, {
        removeIframes: true,
      });

      const warnings = validated.includeWarnings
        ? this.getInjectionWarnings(extracted.html)
        : [];
      const auditId = await this.auditLogger.logEvent({
        toolName: 'navigate_and_extract',
        actionType: 'navigate',
        url: extracted.url,
        outcome: 'confirmed',
      });

      return {
        ok: true,
        data: {
          url: extracted.url,
          title: extracted.title,
          html: extracted.html,
          truncated: extracted.truncated,
        },
        warnings,
        auditId,
      };
    }

    const extracted = await this.markdownExtractor.extractFromPage(page);
    const warnings = validated.includeWarnings
      ? this.getInjectionWarnings(extracted.markdown)
      : [];
    const auditId = await this.auditLogger.logEvent({
      toolName: 'navigate_and_extract',
      actionType: 'navigate',
      url: extracted.url,
      outcome: 'confirmed',
    });

    return {
      ok: true,
      data: extracted,
      warnings,
      auditId,
    };
  }

  private async executeClick(
    validated: ClickElementInput,
    page: Page
  ): Promise<ToolResponse<{ message: string }>> {
    if (!this.session.recordStep()) {
      return {
        ok: false,
        warnings: [],
        reasonCodes: ['max_steps_exceeded'],
        message: 'Session step limit exceeded. Use reset_session to continue.',
      };
    }

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });
      await page.click(validated.selector);
      this.lastUsedTabId = this.tabs.getId(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'click_element',
        actionType: 'click',
        url: page.url(),
        selector: validated.selector,
        outcome: 'confirmed',
      });

      return {
        ok: true,
        warnings: [],
        data: {
          message: `Clicked element: ${validated.selector}`,
        },
        auditId,
      };
    } catch (error) {
      return {
        ok: false,
        warnings: [],
        message: `Failed to click element: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async executeFill(
    validated: FillInputInput,
    page: Page
  ): Promise<ToolResponse<{ message: string }>> {
    if (!this.session.recordStep()) {
      return {
        ok: false,
        warnings: [],
        reasonCodes: ['max_steps_exceeded'],
        message: 'Session step limit exceeded. Use reset_session to continue.',
      };
    }

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });
      await page.fill(validated.selector, validated.value);
      this.lastUsedTabId = this.tabs.getId(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'fill_input',
        actionType: 'fill',
        url: page.url(),
        selector: validated.selector,
        outcome: 'confirmed',
      });

      return {
        ok: true,
        warnings: [],
        data: {
          message: `Filled input: ${validated.selector}`,
        },
        auditId,
      };
    } catch (error) {
      return {
        ok: false,
        warnings: [],
        message: `Failed to fill input: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async executeKeyboardType(
    validated: KeyboardTypeInput,
    page: Page
  ): Promise<ToolResponse<{ message: string }>> {
    if (!this.session.recordStep()) {
      return {
        ok: false,
        warnings: [],
        reasonCodes: ['max_steps_exceeded'],
        message: 'Session step limit exceeded. Use reset_session to continue.',
      };
    }

    await page.keyboard.type(validated.text);
    this.lastUsedTabId = this.tabs.getId(page);
    const auditId = await this.auditLogger.logEvent({
      toolName: 'keyboard_type',
      actionType: 'keyboard_type',
      url: page.url(),
      outcome: 'confirmed',
    });

    return {
      ok: true,
      warnings: [],
      data: { message: 'Typed text via keyboard.' },
      auditId,
    };
  }

  private async executePressKey(
    validated: PressKeyInput,
    page: Page
  ): Promise<ToolResponse<{ message: string }>> {
    if (!this.session.recordStep()) {
      return {
        ok: false,
        warnings: [],
        reasonCodes: ['max_steps_exceeded'],
        message: 'Session step limit exceeded. Use reset_session to continue.',
      };
    }

    await page.keyboard.press(validated.key);
    this.lastUsedTabId = this.tabs.getId(page);
    const auditId = await this.auditLogger.logEvent({
      toolName: 'press_key',
      actionType: 'press_key',
      url: page.url(),
      outcome: 'confirmed',
    });

    return {
      ok: true,
      warnings: [],
      data: { message: `Pressed key: ${validated.key}` },
      auditId,
    };
  }

  private getInjectionWarnings(content: string): string[] {
    const text = this.stripHtml(content);
    const detection = detectPromptInjection(text);
    return buildInjectionWarnings(detection);
  }

  private stripHtml(content: string): string {
    if (!content.includes('<')) {
      return content;
    }

    try {
      const dom = new JSDOM(content);
      return dom.window.document.body?.textContent ?? content;
    } catch {
      return content;
    }
  }

  private async getActivePage(): Promise<Page> {
    const pages = await this.browserConnection.getAllTabs();
    if (pages.length === 0) {
      throw new Error('No tabs found in the browser');
    }

    this.tabs.refresh(pages);

    const activeTabId = this.session.getActiveTabId();
    if (activeTabId) {
      const active = this.tabs.getPage(activeTabId);
      if (active) {
        return active;
      }
    }

    if (this.lastUsedTabId) {
      const lastUsed = this.tabs.getPage(this.lastUsedTabId);
      if (lastUsed) {
        return lastUsed;
      }
    }

    const nonExtension = pages.find((page) => !isExtensionUrl(page.url()));
    return nonExtension ?? pages[pages.length - 1];
  }

  private async safeGetElementText(page: Page, selector: string): Promise<string | undefined> {
    try {
      return (await page.$eval(selector, (element) => element.textContent?.trim() ?? '')) as string;
    } catch {
      return undefined;
    }
  }
}

function isExtensionUrl(url: string): boolean {
  return url.startsWith('chrome-extension://') || url.startsWith('chrome://');
}

import { z } from 'zod';
import { BrowserConnection } from '../browser/connection.js';
import { MarkdownExtractor } from '../extraction/markdown.js';
import { TabRegistry } from '../browser/tabRegistry.js';
import { ok, fail, type ToolResponse } from '../lib/response.js';
import { detectPromptInjection, buildInjectionWarnings } from '../policy/prompts.js';
import { enforcePolicy, loadPolicyConfig } from '../policy/policy.js';
import { AuditLogger } from '../policy/audit.js';
import { ConfirmationStore } from '../policy/confirmations.js';
import type { PolicyConfig } from '../policy/types.js';
import { SessionManager } from '../session/session.js';
import type { Page } from 'playwright';
import { JSDOM } from 'jsdom';

const ExtractionModeSchema = z.enum(['readability_markdown', 'raw_dom_sanitized']);

export const NavigateAndExtractSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  extractionMode: ExtractionModeSchema.default('readability_markdown'),
  includeWarnings: z.boolean().default(true),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const ClickElementSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const FillInputSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  value: z.string(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const ScreenshotSchema = z.object({
  fullPage: z.boolean().default(false),
  path: z.string().optional(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const ActivateTabSchema = z.object({
  tabId: z.string().min(1, 'Tab ID is required'),
});

export const WaitForSelectorSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  timeoutMs: z.number().int().positive().optional(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const WaitForNavigationSchema = z.object({
  timeoutMs: z.number().int().positive().optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const QuerySelectorAllSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  attributes: z.array(z.string()).optional(),
  maxItems: z.number().int().positive().optional(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const KeyboardTypeSchema = z.object({
  text: z.string(),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const PressKeySchema = z.object({
  key: z.string().min(1, 'Key is required'),
  tabId: z.string().min(1, 'Tab ID is required').optional(),
  confirmationId: z.string().min(1, 'Confirmation ID is required').optional(),
});

export const ConfirmActionSchema = z.object({
  confirmationId: z.string().min(1, 'Confirmation ID is required'),
});

export const DenyActionSchema = z.object({
  confirmationId: z.string().min(1, 'Confirmation ID is required'),
});

export type NavigateAndExtractInput = z.input<typeof NavigateAndExtractSchema>;
export type ClickElementInput = z.infer<typeof ClickElementSchema>;
export type FillInputInput = z.infer<typeof FillInputSchema>;
export type ScreenshotInput = z.input<typeof ScreenshotSchema>;
export type ActivateTabInput = z.infer<typeof ActivateTabSchema>;
export type WaitForSelectorInput = z.infer<typeof WaitForSelectorSchema>;
export type WaitForNavigationInput = z.infer<typeof WaitForNavigationSchema>;
export type QuerySelectorAllInput = z.infer<typeof QuerySelectorAllSchema>;
export type KeyboardTypeInput = z.infer<typeof KeyboardTypeSchema>;
export type PressKeyInput = z.infer<typeof PressKeySchema>;
export type ConfirmActionInput = z.infer<typeof ConfirmActionSchema>;
export type DenyActionInput = z.infer<typeof DenyActionSchema>;

type PolicyMetadata = {
  auditId?: string;
  reasonCodes?: string[];
};

type ConfirmationMetadata = PolicyMetadata & {
  confirmationId: string;
  actionSummary: string;
};

type PageResolution =
  | { page: Page; error?: undefined }
  | { page?: undefined; error: ToolResponse<never> };

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
  private confirmations = new ConfirmationStore();
  private session: SessionManager;
  private tabs = new TabRegistry();

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
    const resolved = await this.getPageForInput();
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
    const url = page.url();
    const title = await page.title();

    return ok({ url, title });
  }

  async listTabs(): Promise<
    ToolResponse<{ tabId: string; url: string; title: string; active: boolean; windowId?: string }[]>
  > {
    const pages = await this.browserConnection.getAllTabs();
    if (pages.length === 0) {
      return fail('NO_TABS', 'No tabs found in the browser');
    }

    const results = await this.tabs.listTabs(pages);
    return ok(results);
  }

  async activateTab(input: ActivateTabInput): Promise<ToolResponse<{ tabId: string }>> {
    const validated = ActivateTabSchema.parse(input);
    const pages = await this.browserConnection.getAllTabs();
    if (pages.length === 0) {
      return fail('NO_TABS', 'No tabs found in the browser');
    }
    await this.tabs.refresh(pages);
    const page = this.tabs.getPage(validated.tabId);

    if (!page) {
      return fail('TAB_NOT_FOUND', 'Tab not found');
    }

    this.session.setActiveTabId(validated.tabId);
    await page.bringToFront();
    await this.tabs.markFocused(page);

    return ok({ tabId: validated.tabId });
  }

  async navigateAndExtract(
    input: NavigateAndExtractInput
  ): Promise<
    ToolResponse<
      | {
          url: string;
          title: string;
          markdown?: string;
          html?: string;
          truncated?: boolean;
          auditId?: string;
        }
      | ConfirmationMetadata
      | PolicyMetadata
    >
  > {
    const validated = NavigateAndExtractSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;

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
        ...fail('POLICY_BLOCKED', 'Navigation blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'navigate_and_extract',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Navigate to ${validated.url} and extract content`,
        'navigate_and_extract'
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'navigate_and_extract',
        actionType: 'navigate',
        url: validated.url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Navigation requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    return this.executeNavigateAndExtract(validated, page);
  }

  async clickElement(
    input: ClickElementInput
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | ConfirmationMetadata | PolicyMetadata>> {
    const validated = ClickElementSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Click blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'click_element',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Click ${validated.selector} on ${url}`,
        'click_element'
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
        ...fail('NEEDS_CONFIRMATION', 'Click requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    return this.executeClick(validated, page);
  }

  async fillInput(
    input: FillInputInput
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | ConfirmationMetadata | PolicyMetadata>> {
    const validated = FillInputSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Fill blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved('fill_input', validated.confirmationId);
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Fill ${validated.selector} on ${url}`,
        'fill_input'
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
        ...fail('NEEDS_CONFIRMATION', 'Fill requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    return this.executeFill(validated, page);
  }

  async keyboardType(
    input: KeyboardTypeInput
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | ConfirmationMetadata | PolicyMetadata>> {
    const validated = KeyboardTypeSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Keyboard input blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'keyboard_type',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(`Type text on ${url}`, 'keyboard_type');
      const auditId = await this.auditLogger.logEvent({
        toolName: 'keyboard_type',
        actionType: 'keyboard_type',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Keyboard input requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    return this.executeKeyboardType(validated, page);
  }

  async pressKey(
    input: PressKeyInput
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | ConfirmationMetadata | PolicyMetadata>> {
    const validated = PressKeySchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Key press blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved('press_key', validated.confirmationId);
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(`Press ${validated.key} on ${url}`, 'press_key');
      const auditId = await this.auditLogger.logEvent({
        toolName: 'press_key',
        actionType: 'press_key',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Key press requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    return this.executePressKey(validated, page);
  }

  async waitForSelector(
    input: WaitForSelectorInput
  ): Promise<
    ToolResponse<
      | { found: boolean; url: string; title: string }
      | ConfirmationMetadata
      | PolicyMetadata
    >
  > {
    const validated = WaitForSelectorSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Wait blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'wait_for_selector',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Wait for ${validated.selector} on ${url}`,
        'wait_for_selector'
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'wait_for_selector',
        actionType: 'wait_for_selector',
        url,
        selector: validated.selector,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Wait requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    try {
      await page.waitForSelector(validated.selector, {
        timeout: validated.timeoutMs ?? 5000,
      });
      const title = await page.title();
      return ok({ found: true, url, title });
    } catch {
      const title = await page.title();
      return ok({ found: false, url, title });
    }
  }

  async waitForNavigation(
    input: WaitForNavigationInput
  ): Promise<ToolResponse<{ url: string; title: string } | ConfirmationMetadata | PolicyMetadata>> {
    const validated = WaitForNavigationSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Navigation wait blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'wait_for_navigation',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Wait for navigation on ${url}`,
        'wait_for_navigation'
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'wait_for_navigation',
        actionType: 'wait_for_navigation',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Navigation wait requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
      };
    }

    await page.waitForNavigation({
      timeout: validated.timeoutMs ?? 10000,
      waitUntil: validated.waitUntil ?? 'load',
    });

    const title = await page.title();
    return ok({ url: page.url(), title });
  }

  async querySelectorAll(
    input: QuerySelectorAllInput
  ): Promise<
    ToolResponse<
      | { items: { text: string; attrs: Record<string, string> }[] }
      | ConfirmationMetadata
      | PolicyMetadata
    >
  > {
    const validated = QuerySelectorAllSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Query blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'query_selector_all',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(
        `Query ${validated.selector} on ${url}`,
        'query_selector_all'
      );
      const auditId = await this.auditLogger.logEvent({
        toolName: 'query_selector_all',
        actionType: 'query_selector_all',
        url,
        selector: validated.selector,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Query requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
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

    return ok({ items });
  }

  async screenshotTab(
    input: ScreenshotInput
  ): Promise<
    ToolResponse<
      | { screenshot?: string; path?: string; message: string; auditId?: string }
      | ConfirmationMetadata
      | PolicyMetadata
    >
  > {
    const validated = ScreenshotSchema.parse(input);
    const resolved = await this.getPageForInput(validated.tabId);
    if (resolved.error) {
      return resolved.error;
    }
    const { page } = resolved;
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
        ...fail('POLICY_BLOCKED', 'Screenshot blocked by policy.'),
        data: { auditId, reasonCodes: policyDecision.reasonCodes },
      };
    }

    const approved = this.consumeConfirmationIfApproved(
      'screenshot_tab',
      validated.confirmationId
    );
    if (policyDecision.requiresConfirmation && !approved) {
      const pending = this.confirmations.create(`Take screenshot on ${url}`, 'screenshot_tab');
      const auditId = await this.auditLogger.logEvent({
        toolName: 'screenshot_tab',
        actionType: 'screenshot',
        url,
        outcome: 'needs_confirmation',
        reasonCodes: policyDecision.reasonCodes,
      });
      return {
        ...fail('NEEDS_CONFIRMATION', 'Screenshot requires confirmation.'),
        data: {
          confirmationId: pending.id,
          actionSummary: pending.summary,
          auditId,
          reasonCodes: policyDecision.reasonCodes,
        },
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

      return ok({
        screenshot: validated.path ? undefined : screenshotStr,
        path: validated.path,
        message: validated.path
          ? `Screenshot saved to: ${validated.path}`
          : 'Screenshot captured as base64',
        auditId,
      });
    } catch (error) {
      return fail(
        'ACTION_FAILED',
        `Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async confirmAction(
    input: ConfirmActionInput
  ): Promise<ToolResponse<{ confirmationId: string; actionSummary: string }>> {
    const result = ConfirmActionSchema.safeParse(input);
    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message).join(', ');
      return fail('INVALID_INPUT', `Validation failed: ${errorMessages}`);
    }
    const validated = result.data;
    const approved = this.confirmations.approve(validated.confirmationId);
    if (!approved) {
      return fail('CONFIRMATION_EXPIRED', 'Confirmation ID expired or invalid.');
    }

    return ok({ confirmationId: approved.id, actionSummary: approved.summary });
  }

  async denyAction(
    input: DenyActionInput
  ): Promise<ToolResponse<{ confirmationId: string; denied: boolean }>> {
    const result = DenyActionSchema.safeParse(input);
    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message).join(', ');
      return fail('INVALID_INPUT', `Validation failed: ${errorMessages}`);
    }
    const validated = result.data;
    const denied = this.confirmations.deny(validated.confirmationId);
    if (!denied) {
      return fail('CONFIRMATION_EXPIRED', 'Confirmation ID expired or invalid.');
    }

    return ok({ confirmationId: validated.confirmationId, denied: true });
  }

  async resetSession(): Promise<ToolResponse<{ reset: boolean }>> {
    this.session.reset();
    this.confirmations.clear();
    return ok({ reset: true });
  }

  async disconnect(): Promise<void> {
    await this.browserConnection.disconnect();
  }

  private async executeNavigateAndExtract(
    validated: NavigateAndExtractInput,
    page: Page
  ): Promise<
    ToolResponse<
      | {
          url: string;
          title: string;
          markdown?: string;
          html?: string;
          truncated?: boolean;
          auditId?: string;
        }
      | PolicyMetadata
    >
  > {
    if (!this.session.recordStep()) {
      return {
        ...fail('MAX_STEPS_EXCEEDED', 'Session step limit exceeded. Use reset_session to continue.'),
        data: { reasonCodes: ['max_steps_exceeded'] },
      };
    }

    await page.goto(validated.url, { waitUntil: 'networkidle' });
    await this.tabs.markFocused(page);

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

      return ok(
        {
          url: extracted.url,
          title: extracted.title,
          html: extracted.html,
          truncated: extracted.truncated,
          auditId,
        },
        warnings
      );
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

    return ok({ ...extracted, auditId }, warnings);
  }

  private async executeClick(
    validated: ClickElementInput,
    page: Page
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | PolicyMetadata>> {
    if (!this.session.recordStep()) {
      return {
        ...fail('MAX_STEPS_EXCEEDED', 'Session step limit exceeded. Use reset_session to continue.'),
        data: { reasonCodes: ['max_steps_exceeded'] },
      };
    }

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });
      await page.click(validated.selector);
      await this.tabs.markFocused(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'click_element',
        actionType: 'click',
        url: page.url(),
        selector: validated.selector,
        outcome: 'confirmed',
      });

      return ok({
        message: `Clicked element: ${validated.selector}`,
        auditId,
      });
    } catch (error) {
      return fail(
        'ACTION_FAILED',
        `Failed to click element: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async executeFill(
    validated: FillInputInput,
    page: Page
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | PolicyMetadata>> {
    if (!this.session.recordStep()) {
      return {
        ...fail('MAX_STEPS_EXCEEDED', 'Session step limit exceeded. Use reset_session to continue.'),
        data: { reasonCodes: ['max_steps_exceeded'] },
      };
    }

    try {
      await page.waitForSelector(validated.selector, { timeout: 5000 });
      await page.fill(validated.selector, validated.value);
      await this.tabs.markFocused(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'fill_input',
        actionType: 'fill',
        url: page.url(),
        selector: validated.selector,
        outcome: 'confirmed',
      });

      return ok({
        message: `Filled input: ${validated.selector}`,
        auditId,
      });
    } catch (error) {
      return fail(
        'ACTION_FAILED',
        `Failed to fill input: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async executeKeyboardType(
    validated: KeyboardTypeInput,
    page: Page
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | PolicyMetadata>> {
    if (!this.session.recordStep()) {
      return {
        ...fail('MAX_STEPS_EXCEEDED', 'Session step limit exceeded. Use reset_session to continue.'),
        data: { reasonCodes: ['max_steps_exceeded'] },
      };
    }

    try {
      await page.keyboard.type(validated.text);
      await this.tabs.markFocused(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'keyboard_type',
        actionType: 'keyboard_type',
        url: page.url(),
        outcome: 'confirmed',
      });

      return ok({ message: 'Typed text via keyboard.', auditId });
    } catch (error) {
      await this.auditLogger.logEvent({
        toolName: 'keyboard_type',
        actionType: 'keyboard_type',
        url: page.url(),
        outcome: 'denied',
      });
      return fail(
        'ACTION_FAILED',
        `Failed to type text: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async executePressKey(
    validated: PressKeyInput,
    page: Page
  ): Promise<ToolResponse<{ message?: string; auditId?: string } | PolicyMetadata>> {
    if (!this.session.recordStep()) {
      return {
        ...fail('MAX_STEPS_EXCEEDED', 'Session step limit exceeded. Use reset_session to continue.'),
        data: { reasonCodes: ['max_steps_exceeded'] },
      };
    }

    try {
      await page.keyboard.press(validated.key);
      await this.tabs.markFocused(page);
      const auditId = await this.auditLogger.logEvent({
        toolName: 'press_key',
        actionType: 'press_key',
        url: page.url(),
        outcome: 'confirmed',
      });

      return ok({ message: `Pressed key: ${validated.key}`, auditId });
    } catch (error) {
      await this.auditLogger.logEvent({
        toolName: 'press_key',
        actionType: 'press_key',
        url: page.url(),
        outcome: 'denied',
      });
      return fail(
        'ACTION_FAILED',
        `Failed to press key: ${error instanceof Error ? error.message : String(error)}`
      );
    }
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

  private async getPageForInput(tabId?: string): Promise<PageResolution> {
    const pages = await this.browserConnection.getAllTabs();
    if (pages.length === 0) {
      return { error: fail('NO_TABS', 'No tabs found in the browser') };
    }

    await this.tabs.refresh(pages);

    if (tabId) {
      const page = this.tabs.getPage(tabId);
      if (!page) {
        return { error: fail('TAB_NOT_FOUND', 'Tab not found') };
      }
      await this.tabs.markFocused(page);
      return { page };
    }

    // Call getActiveTab() if available to ensure page properties are accessible
    if ('getActiveTab' in this.browserConnection && typeof this.browserConnection.getActiveTab === 'function') {
      try {
        await this.browserConnection.getActiveTab();
      } catch {
        // Ignore errors, fallback to registry-based selection
      }
    }
    
    const page = await this.tabs.getActivePage(pages);
    if (!page) {
      return { error: fail('NO_TABS', 'No active tab found') };
    }
    await this.tabs.markFocused(page);
    return { page };
  }

  private consumeConfirmationIfApproved(toolName: string, confirmationId?: string): boolean {
    if (!confirmationId) {
      return false;
    }
    return Boolean(this.confirmations.consumeApproved(confirmationId, toolName));
  }

  private async safeGetElementText(page: Page, selector: string): Promise<string | undefined> {
    try {
      return (await page.$eval(selector, (element) => element.textContent?.trim() ?? '')) as string;
    } catch {
      return undefined;
    }
  }
}

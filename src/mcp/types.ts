import { z } from 'zod';

// Tool parameter schemas
export const GetActiveTabParamsSchema = z.object({}).optional();

export const NavigateAndExtractParamsSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  waitFor: z.string().optional().describe('CSS selector to wait for before extracting'),
  timeout: z.number().min(1000).max(60000).default(30000).optional(),
});

export const ClickElementParamsSchema = z.object({
  selector: z.string().optional().describe('CSS selector of element to click'),
  text: z.string().optional().describe('Text content of element to click'),
  waitForNavigation: z.boolean().default(false).optional(),
}).refine((data) => data.selector || data.text, {
  message: 'Either selector or text must be provided',
});

export const FillInputParamsSchema = z.object({
  selector: z.string().describe('CSS selector of input element'),
  value: z.string().describe('Value to fill into the input'),
  pressEnter: z.boolean().default(false).optional(),
});

export const ScreenshotTabParamsSchema = z.object({
  fullPage: z.boolean().default(false).optional(),
});

// Tool response types
export interface TabContent {
  url: string;
  title: string;
  content: string;
}

export interface ClickResult {
  success: boolean;
  newUrl?: string;
  content?: string;
  error?: string;
}

export interface FillResult {
  success: boolean;
  error?: string;
}

export interface ScreenshotResult {
  base64: string;
  mimeType: 'image/png';
}

// Type inference from schemas
export type GetActiveTabParams = z.infer<typeof GetActiveTabParamsSchema>;
export type NavigateAndExtractParams = z.infer<typeof NavigateAndExtractParamsSchema>;
export type ClickElementParams = z.infer<typeof ClickElementParamsSchema>;
export type FillInputParams = z.infer<typeof FillInputParamsSchema>;
export type ScreenshotTabParams = z.infer<typeof ScreenshotTabParamsSchema>;

// Browser connection state
export interface BrowserState {
  connected: boolean;
  debugUrl: string;
  activeTabId?: string;
  error?: string;
}

// Logger interface
export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

// Configuration
export interface TabNabConfig {
  chromeDebugPort: number;
  chromeDebugHost: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  humanizeDelays: boolean;
  minTypingDelay: number;
  maxTypingDelay: number;
  minClickDelay: number;
  maxClickDelay: number;
}

export const defaultConfig: TabNabConfig = {
  chromeDebugPort: 9222,
  chromeDebugHost: 'localhost',
  logLevel: 'info',
  humanizeDelays: true,
  minTypingDelay: 50,
  maxTypingDelay: 150,
  minClickDelay: 100,
  maxClickDelay: 300,
};

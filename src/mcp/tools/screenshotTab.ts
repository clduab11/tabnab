import { getBrowserConnection } from '../../browser/connection';
import { ScreenshotResult, ScreenshotTabParamsSchema, ScreenshotTabParams } from '../types';

export const screenshotTabTool = {
  name: 'screenshot_tab',
  description:
    'Captures a screenshot of the current tab as a base64-encoded PNG image. Can capture either the visible viewport or the full scrollable page.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      fullPage: {
        type: 'boolean',
        description: 'Whether to capture the full scrollable page (default: false, captures viewport only)',
        default: false,
      },
    },
    required: [],
  },
};

export async function executeScreenshotTab(
  params: unknown
): Promise<ScreenshotResult> {
  const validatedParams = ScreenshotTabParamsSchema.parse(params) as ScreenshotTabParams;
  const { fullPage = false } = validatedParams ?? {};

  const browser = getBrowserConnection();
  const page = await browser.getActivePage();

  if (!page) {
    throw new Error('No active tab found');
  }

  try {
    // Take screenshot with base64 encoding - returns string
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage,
      type: 'png',
    }) as string;

    return {
      base64: screenshot,
      mimeType: 'image/png',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Screenshot failed: ${errorMessage}`);
  }
}

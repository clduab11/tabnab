import { getBrowserConnection } from '../../browser/connection';
import { navigateAndWait, waitForPageReady } from '../../browser/pageUtils';
import { extractPageContent } from '../../extraction';
import { TabContent, NavigateAndExtractParamsSchema, NavigateAndExtractParams } from '../types';

export const navigateAndExtractTool = {
  name: 'navigate_and_extract',
  description:
    'Opens a URL in a new background tab, waits for the page to load, and extracts clean Markdown content. Use this to fetch content from a specific URL while preserving the user\'s current browsing context.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'The URL to navigate to and extract content from',
      },
      waitFor: {
        type: 'string',
        description: 'Optional CSS selector to wait for before extracting content',
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for page load in milliseconds (default: 30000)',
        default: 30000,
      },
    },
    required: ['url'],
  },
};

export async function executeNavigateAndExtract(
  params: unknown
): Promise<TabContent> {
  const validatedParams = NavigateAndExtractParamsSchema.parse(params) as NavigateAndExtractParams;
  const { url, waitFor, timeout = 30000 } = validatedParams;

  const browser = getBrowserConnection();

  // Create a new page for the navigation
  const page = await browser.createNewPage();

  try {
    // Navigate to the URL
    await navigateAndWait(page, url, { timeout, waitFor });

    // Wait for any specific element if requested
    if (waitFor) {
      await waitForPageReady(page, { waitFor, timeout });
    }

    // Extract content
    const content = await extractPageContent(page);

    return content;
  } finally {
    // Close the background tab to clean up
    try {
      await page.close();
    } catch {
      // Page might already be closed
    }
  }
}

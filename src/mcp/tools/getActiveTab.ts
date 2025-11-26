import { getBrowserConnection } from '../../browser/connection';
import { extractPageContent } from '../../extraction';
import { TabContent, GetActiveTabParamsSchema } from '../types';

export const getActiveTabTool = {
  name: 'get_active_tab',
  description:
    'Returns the URL, title, and cleaned Markdown content of the user\'s currently focused Chrome tab. Use this to understand what the user is looking at right now.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [] as string[],
  },
};

export async function executeGetActiveTab(
  _params: unknown
): Promise<TabContent> {
  // Validate params (empty object is fine)
  GetActiveTabParamsSchema.parse(_params);

  const browser = getBrowserConnection();
  const page = await browser.getActivePage();

  if (!page) {
    throw new Error('No active tab found. Make sure Chrome is open with at least one tab.');
  }

  const content = await extractPageContent(page);

  return content;
}

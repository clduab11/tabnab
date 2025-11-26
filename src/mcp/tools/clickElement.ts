import { getBrowserConnection } from '../../browser/connection';
import { findBySelector, findByText, waitForNavigationOptional } from '../../browser/pageUtils';
import { getHumanBehavior } from '../../browser/antiDetection';
import { extractPageContent } from '../../extraction';
import { ClickResult, ClickElementParamsSchema, ClickElementParams } from '../types';

export const clickElementTool = {
  name: 'click_element',
  description:
    'Clicks an element on the current page by CSS selector or visible text content. Optionally waits for navigation and returns the resulting page content. Use this to interact with buttons, links, and other clickable elements.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector of the element to click',
      },
      text: {
        type: 'string',
        description: 'Visible text content of the element to click (used if selector not provided)',
      },
      waitForNavigation: {
        type: 'boolean',
        description: 'Whether to wait for page navigation after clicking (default: false)',
        default: false,
      },
    },
    required: [],
  },
};

export async function executeClickElement(
  params: unknown
): Promise<ClickResult> {
  const validatedParams = ClickElementParamsSchema.parse(params) as ClickElementParams;
  const { selector, text, waitForNavigation = false } = validatedParams;

  const browser = getBrowserConnection();
  const page = await browser.getActivePage();

  if (!page) {
    throw new Error('No active tab found');
  }

  const humanBehavior = getHumanBehavior();

  // Find the element
  let element = null;

  if (selector) {
    element = await findBySelector(page, selector);
    if (!element) {
      return {
        success: false,
        error: `Element not found with selector: ${selector}`,
      };
    }
  } else if (text) {
    element = await findByText(page, text);
    if (!element) {
      return {
        success: false,
        error: `Element not found with text: ${text}`,
      };
    }
  } else {
    return {
      success: false,
      error: 'Either selector or text must be provided',
    };
  }

  const startUrl = page.url();

  try {
    if (waitForNavigation) {
      const navigated = await waitForNavigationOptional(page, async () => {
        await humanBehavior.humanClick(page, element);
      });

      if (navigated) {
        // Extract content from the new page
        const content = await extractPageContent(page);
        return {
          success: true,
          newUrl: page.url(),
          content: content.content,
        };
      }
    } else {
      await humanBehavior.humanClick(page, element);
    }

    const newUrl = page.url();
    const urlChanged = newUrl !== startUrl;

    // Extract current page content
    const content = await extractPageContent(page);

    return {
      success: true,
      newUrl: urlChanged ? newUrl : undefined,
      content: content.content,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Click failed: ${errorMessage}`,
    };
  }
}

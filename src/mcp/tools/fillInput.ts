import { getBrowserConnection } from '../../browser/connection';
import { findBySelector } from '../../browser/pageUtils';
import { getHumanBehavior } from '../../browser/antiDetection';
import { FillResult, FillInputParamsSchema, FillInputParams } from '../types';

export const fillInputTool = {
  name: 'fill_input',
  description:
    'Fills a form input field with the specified value using human-like typing. Can optionally press Enter after filling. Use this to fill search boxes, form fields, and other input elements.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector of the input element to fill',
      },
      value: {
        type: 'string',
        description: 'The value to type into the input',
      },
      pressEnter: {
        type: 'boolean',
        description: 'Whether to press Enter after filling (default: false)',
        default: false,
      },
    },
    required: ['selector', 'value'],
  },
};

export async function executeFillInput(
  params: unknown
): Promise<FillResult> {
  const validatedParams = FillInputParamsSchema.parse(params) as FillInputParams;
  const { selector, value, pressEnter = false } = validatedParams;

  const browser = getBrowserConnection();
  const page = await browser.getActivePage();

  if (!page) {
    throw new Error('No active tab found');
  }

  const humanBehavior = getHumanBehavior();

  // Find the input element
  const element = await findBySelector(page, selector);

  if (!element) {
    return {
      success: false,
      error: `Input element not found with selector: ${selector}`,
    };
  }

  try {
    // Check if element is an input/textarea
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

    if (!['input', 'textarea', 'div'].includes(tagName)) {
      // Check for contenteditable
      const isEditable = await element.evaluate((el) => el.getAttribute('contenteditable') === 'true');

      if (!isEditable) {
        return {
          success: false,
          error: `Element is not an input field: ${tagName}`,
        };
      }
    }

    // Fill the input with human-like typing
    await humanBehavior.humanFillInput(page, element, value);

    // Press Enter if requested
    if (pressEnter) {
      await humanBehavior.humanPressEnter(page);
    }

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Fill input failed: ${errorMessage}`,
    };
  }
}

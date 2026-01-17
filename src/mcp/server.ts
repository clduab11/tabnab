import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  type CallToolRequest,
  CallToolRequestSchema,
  type ListToolsRequest,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MCPTools } from './tools.js';

export class TabNabMCPServer {
  private server: Server;
  private tools: MCPTools;

  constructor(debugPort = 9222) {
    this.tools = new MCPTools(debugPort);
    this.server = new Server(
      {
        name: 'tabnab',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => {
      return {
        tools: [
          {
            name: 'get_active_tab',
            description: 'Get the URL and title of the currently active browser tab',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'list_tabs',
            description: 'List all open tabs with their IDs, URLs, and titles',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'activate_tab',
            description: 'Set the active tab by ID',
            inputSchema: {
              type: 'object',
              properties: {
                tabId: {
                  type: 'string',
                  description: 'Tab identifier returned by list_tabs',
                },
              },
              required: ['tabId'],
            },
          },
          {
            name: 'navigate_and_extract',
            description:
              'Navigate to a URL and extract the page content as Markdown or sanitized DOM',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to navigate to',
                },
                extractionMode: {
                  type: 'string',
                  description: 'readability_markdown or raw_dom_sanitized',
                },
                includeWarnings: {
                  type: 'boolean',
                  description: 'Whether to include prompt-injection warnings',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'click_element',
            description: 'Click an element on the current page using a CSS selector',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector for the element to click',
                },
              },
              required: ['selector'],
            },
          },
          {
            name: 'fill_input',
            description: 'Fill an input field on the current page',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector for the input field',
                },
                value: {
                  type: 'string',
                  description: 'Value to fill into the input field',
                },
              },
              required: ['selector', 'value'],
            },
          },
          {
            name: 'keyboard_type',
            description: 'Type text into the active page using the keyboard',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text to type',
                },
              },
              required: ['text'],
            },
          },
          {
            name: 'press_key',
            description: 'Press a keyboard key on the active page',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'Key to press (e.g., Enter, Escape)',
                },
              },
              required: ['key'],
            },
          },
          {
            name: 'wait_for_selector',
            description: 'Wait for a selector to appear on the active page',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector to wait for',
                },
                timeoutMs: {
                  type: 'number',
                  description: 'Timeout in milliseconds',
                },
              },
              required: ['selector'],
            },
          },
          {
            name: 'wait_for_navigation',
            description: 'Wait for navigation to complete',
            inputSchema: {
              type: 'object',
              properties: {
                timeoutMs: {
                  type: 'number',
                  description: 'Timeout in milliseconds',
                },
                waitUntil: {
                  type: 'string',
                  description: 'load, domcontentloaded, or networkidle',
                },
              },
              required: [],
            },
          },
          {
            name: 'query_selector_all',
            description: 'Query multiple elements and return their text and attributes',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector to query',
                },
                attributes: {
                  type: 'array',
                  description: 'Attributes to extract from each element',
                  items: { type: 'string' },
                },
                maxItems: {
                  type: 'number',
                  description: 'Maximum number of items to return',
                },
              },
              required: ['selector'],
            },
          },
          {
            name: 'screenshot_tab',
            description: 'Take a screenshot of the current tab',
            inputSchema: {
              type: 'object',
              properties: {
                fullPage: {
                  type: 'boolean',
                  description: 'Whether to capture the full page (default: false)',
                },
                path: {
                  type: 'string',
                  description: 'Optional file path to save the screenshot',
                },
              },
              required: [],
            },
          },
          {
            name: 'confirm_action',
            description: 'Confirm or cancel a pending action',
            inputSchema: {
              type: 'object',
              properties: {
                confirmationToken: {
                  type: 'string',
                  description: 'Token from a needs_confirmation response',
                },
                action: {
                  type: 'string',
                  description: 'confirm or cancel',
                },
              },
              required: ['confirmationToken'],
            },
          },
          {
            name: 'reset_session',
            description: 'Reset the session step counter and pending confirmations',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'get_active_tab': {
            const result = await this.tools.getActiveTab();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'list_tabs': {
            const result = await this.tools.listTabs();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'activate_tab': {
            const result = await this.tools.activateTab(args as { tabId: string });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'navigate_and_extract': {
            const result = await this.tools.navigateAndExtract(
              args as {
                url: string;
                extractionMode?: 'readability_markdown' | 'raw_dom_sanitized';
                includeWarnings?: boolean;
              }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'click_element': {
            const result = await this.tools.clickElement(args as { selector: string });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'fill_input': {
            const result = await this.tools.fillInput(args as { selector: string; value: string });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'keyboard_type': {
            const result = await this.tools.keyboardType(args as { text: string });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'press_key': {
            const result = await this.tools.pressKey(args as { key: string });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'wait_for_selector': {
            const result = await this.tools.waitForSelector(
              args as { selector: string; timeoutMs?: number }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'wait_for_navigation': {
            const result = await this.tools.waitForNavigation(
              args as { timeoutMs?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'query_selector_all': {
            const result = await this.tools.querySelectorAll(
              args as { selector: string; attributes?: string[]; maxItems?: number }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'screenshot_tab': {
            const screenshotArgs = args || {};
            const result = await this.tools.screenshotTab({
              fullPage: (screenshotArgs as { fullPage?: boolean }).fullPage ?? false,
              path: (screenshotArgs as { path?: string }).path,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'confirm_action': {
            const result = await this.tools.confirmAction(
              args as { confirmationToken: string; action?: 'confirm' | 'cancel' }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'reset_session': {
            const result = await this.tools.resetSession();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Handle cleanup on exit
    process.on('SIGINT', async () => {
      await this.tools.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.tools.disconnect();
      process.exit(0);
    });
  }
}

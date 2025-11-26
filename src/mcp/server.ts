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
            name: 'navigate_and_extract',
            description:
              'Navigate to a URL and extract the page content as clean Markdown using Readability.js',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to navigate to',
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

          case 'navigate_and_extract': {
            const result = await this.tools.navigateAndExtract(args as { url: string });
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

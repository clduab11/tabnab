import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getBrowserConnection } from '../browser/connection';
import {
  getActiveTabTool,
  executeGetActiveTab,
  navigateAndExtractTool,
  executeNavigateAndExtract,
  clickElementTool,
  executeClickElement,
  fillInputTool,
  executeFillInput,
  screenshotTabTool,
  executeScreenshotTab,
} from './tools';

// All available tools
const tools = [
  getActiveTabTool,
  navigateAndExtractTool,
  clickElementTool,
  fillInputTool,
  screenshotTabTool,
];

// Tool executor map
const toolExecutors: Record<string, (params: unknown) => Promise<unknown>> = {
  get_active_tab: executeGetActiveTab,
  navigate_and_extract: executeNavigateAndExtract,
  click_element: executeClickElement,
  fill_input: executeFillInput,
  screenshot_tab: executeScreenshotTab,
};

export function createMcpServer(): Server {
  const server = new Server(
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

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.error(`[TabNab] Executing tool: ${name}`);

    // Ensure browser is connected
    const browser = getBrowserConnection();
    const state = await browser.connect();

    if (!state.connected) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: state.error ?? 'Failed to connect to Chrome',
              help: 'Make sure Chrome is running with --remote-debugging-port=9222',
            }),
          },
        ],
        isError: true,
      };
    }

    const executor = toolExecutors[name];

    if (!executor) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await executor(args ?? {});

      // Handle screenshot specially - return as image content
      if (name === 'screenshot_tab' && typeof result === 'object' && result !== null) {
        const screenshotResult = result as { base64: string; mimeType: string };
        return {
          content: [
            {
              type: 'image' as const,
              data: screenshotResult.base64,
              mimeType: screenshotResult.mimeType,
            },
          ],
        };
      }

      // Return result as JSON text
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[TabNab] Tool error: ${errorMessage}`);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: errorMessage }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Main entry point for running as standalone MCP server
async function main(): Promise<void> {
  console.error('[TabNab] Starting MCP server...');

  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('[TabNab] MCP server running on stdio');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('[TabNab] Shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('[TabNab] Shutting down...');
    await server.close();
    process.exit(0);
  });
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('[TabNab] Fatal error:', error);
    process.exit(1);
  });
}

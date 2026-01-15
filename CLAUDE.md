# CLAUDE.md - TabNab Development Guide

## Project Overview

**TabNab** is a local MCP (Model Context Protocol) server that provides AI agents (Claude, Cursor, Windsurf) with access to authenticated browser sessions. It connects to Chrome/Chromium via the Chrome DevTools Protocol, enabling browser automation while preserving user cookies and sessions.

### Core Value Proposition
Give AI agents access to your real browser cookies and authenticated sessions without sharing passwords. Users can see and control what automation is happening in their existing browser.

## Architecture

```text
src/
├── main/           # Electron menu bar application entry point
├── mcp/            # MCP server implementation
│   ├── index.ts    # MCP server entry point (stdio transport)
│   ├── server.ts   # Server setup and tool registration
│   └── tools.ts    # Tool implementations with Zod validation
├── browser/        # Browser connection management
│   ├── index.ts    # Module exports
│   └── connection.ts # Chrome DevTools Protocol connection
├── extraction/     # Content extraction utilities
│   ├── index.ts    # Module exports
│   └── markdown.ts # Readability.js + Turndown HTML-to-Markdown
└── test-connection.ts # Milestone 1 verification script
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `BrowserConnection` | `src/browser/connection.ts` | Manages puppeteer-core connection to Chrome |
| `MCPTools` | `src/mcp/tools.ts` | Implements all 5 MCP tools with validation |
| `MarkdownExtractor` | `src/extraction/markdown.ts` | HTML → Markdown using Readability + Turndown |
| `McpServer` | `src/mcp/server.ts` | MCP protocol handler with stdio transport |

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | ^5.7 | Type-safe development (strict mode) |
| Electron | ^33.2 | Menu bar desktop application |
| puppeteer-core | ^23.10 | Browser automation via CDP |
| @modelcontextprotocol/sdk | ^0.5 | MCP protocol implementation |
| @mozilla/readability | ^0.6 | Intelligent content extraction |
| turndown | ^7.2 | HTML to Markdown conversion |
| zod | ^3.23 | Runtime type validation |
| Biome | ^1.9 | Linting and formatting |
| pnpm | - | Package manager |

## Development Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript to dist/
pnpm run build

# Run Electron app in development
pnpm run dev

# Type checking without emit
pnpm run type-check

# Lint with Biome
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Format code with Biome
pnpm run format

# Test Chrome connection (Milestone 1)
pnpm run test:milestone1
```

## MCP Tools Reference

### 1. `get_active_tab`
Returns URL and title of the active browser tab.
- **Input**: None
- **Success Output**: `{ success: true, url: string, title: string }`
- **Error Output**: `{ success: false, message: string }`

### 2. `navigate_and_extract`
Navigate to URL and extract page content as clean Markdown.
- **Input**: `{ url: string }` (Zod-validated URL)
- **Success Output**: `{ success: true, url: string, title: string, markdown: string }`
- **Error Output**: `{ success: false, message: string }`

### 3. `click_element`
Click element using CSS selector.
- **Input**: `{ selector: string }` (non-empty)
- **Output**: `{ success: boolean, message: string }`

### 4. `fill_input`
Fill input field (clears existing content first).
- **Input**: `{ selector: string, value: string }`
- **Output**: `{ success: boolean, message: string }`

### 5. `screenshot_tab`
Capture screenshot of current tab.
- **Input**: `{ fullPage?: boolean, path?: string }`
- **Output**: `{ success: boolean, screenshot?: string, path?: string, message: string }`

## Code Style & Conventions

### TypeScript
- **Strict mode enabled** - all strict type checks active
- **ES2022 target** with ESNext modules
- Use explicit types for function parameters and return values
- Prefer `type` imports for type-only imports: `import type { X } from 'y'`

### Biome Configuration
- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quote style**: Single quotes
- **Trailing commas**: ES5 style
- **Import organization**: Enabled

### Patterns Used
```typescript
// Zod schema definition pattern
export const SchemaName = z.object({
  field: z.string().min(1, 'Error message'),
});
export type SchemaType = z.infer<typeof SchemaName>;

// Error handling pattern
try {
  // operation
} catch (error) {
  return {
    success: false,
    message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
  };
}

// Browser connection pattern (always await connect first)
const page = await this.browserConnection.getActiveTab();
```

## Prerequisites for Development

1. **Node.js 18+** and **pnpm** installed
2. **Chrome/Chromium** running with remote debugging:
   ```bash
   ./scripts/start-chrome.sh  # macOS/Linux
   .\scripts\start-chrome.ps1 # Windows
   ```
3. Remote debugging port: **9222** (configurable via `CHROME_DEBUG_PORT` env var)

## Testing

### Milestone 1 Test
```bash
pnpm run test:milestone1
```
Verifies:
- Chrome connection on port 9222
- Active tab retrieval
- URL and title extraction

### Manual MCP Testing
Configure MCP client (e.g., Claude Desktop):
```json
{
  "mcpServers": {
    "tabnab": {
      "command": "node",
      "args": ["/path/to/tabnab/dist/mcp/index.js"],
      "env": { "CHROME_DEBUG_PORT": "9222" }
    }
  }
}
```

## Common Development Tasks

### Adding a New MCP Tool

1. **Define Zod schema** in `src/mcp/tools.ts`:
   ```typescript
   export const NewToolSchema = z.object({
     param: z.string(),
   });
   export type NewToolInput = z.infer<typeof NewToolSchema>;
   ```

2. **Implement tool method** in `MCPTools` class:
   ```typescript
   async newTool(input: NewToolInput): Promise<{ result: string }> {
     const validated = NewToolSchema.parse(input);
     // Implementation
     return { result: 'done' };
   }
   ```

3. **Register tool** in `src/mcp/server.ts` - add to tool definitions

### Modifying Content Extraction

The `MarkdownExtractor` in `src/extraction/markdown.ts`:
- Uses Mozilla Readability for article extraction
- Falls back to body content if Readability fails
- Converts HTML → Markdown via Turndown

### Debugging Chrome Connection

1. Ensure Chrome is running with `--remote-debugging-port=9222`
2. Verify at `http://localhost:9222/json/version`
3. Check `BrowserConnection.connect()` error messages

## Security Considerations

- **Local-only**: Connects only to localhost Chrome instance
- **No credential storage**: Uses existing browser sessions
- **CDP connection**: Standard Chrome DevTools Protocol
- **Input validation**: All tool inputs validated via Zod schemas

## File Locations

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `biome.json` | Linter/formatter configuration |
| `mcp-config.example.json` | Example MCP client config |
| `scripts/start-chrome.sh` | Chrome launcher (macOS/Linux) |
| `scripts/start-chrome.ps1` | Chrome launcher (Windows) |
| `docs/` | Documentation (IMPLEMENTATION, CONTRIBUTING, SECURITY, etc.) |
| `dist/` | Compiled JavaScript output |

## Build Artifacts

After `pnpm run build`:
- `dist/mcp/index.js` - MCP server entry (use with MCP clients)
- `dist/main/index.js` - Electron app entry
- `dist/**/*.d.ts` - TypeScript declarations
- `dist/**/*.js.map` - Source maps

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHROME_DEBUG_PORT` | `9222` | Chrome remote debugging port |

## Troubleshooting

### "Failed to connect to Chrome"
- Ensure Chrome is running with `--remote-debugging-port=9222`
- Check no other process is using port 9222
- Verify `http://localhost:9222/json` returns browser info

### "No tabs found"
- Open at least one tab in Chrome
- Chrome may need to be focused/active

### Build Errors
- Run `pnpm run type-check` for TypeScript errors
- Run `pnpm run lint` for code style issues
- Ensure all dependencies installed: `pnpm install`

## Contributing Guidelines

1. **Type safety**: Maintain strict TypeScript - no `any` types
2. **Validation**: Use Zod for all external inputs
3. **Error handling**: Return structured error objects, don't throw
4. **Code style**: Run `pnpm run lint:fix && pnpm run format` before commits
5. **Testing**: Verify changes work with `pnpm run test:milestone1`

# TabNab 🍪

Local MCP server that gives AI agents (Claude, Cursor, Windsurf) access to your authenticated browser sessions. Grab DOM, fill forms, and click through Cloudflare, all from your real Chromium browser with your real cookies. Give your AI your cookies, without giving it your password.

## Features

- **Authenticated Browser Automation**: Connect to your existing Chrome/Chromium browser with all your cookies and sessions
- **5 MCP Tools**: 
  - `get_active_tab` - Get URL and title of the active browser tab
  - `navigate_and_extract` - Navigate to a URL and extract clean Markdown content
  - `click_element` - Click elements using CSS selectors
  - `fill_input` - Fill input fields on web pages
  - `screenshot_tab` - Capture screenshots of the current tab
- **Clean Markdown Extraction**: Uses Readability.js and Turndown to convert web pages to clean Markdown
- **Type-Safe**: Built with TypeScript in strict mode with Zod validation
- **Menu Bar App**: Runs as an Electron menu bar application

## Prerequisites

- Node.js 18+ and pnpm
- Chrome/Chromium browser running with remote debugging enabled

### Starting Chrome with Remote Debugging

TabNab includes helper scripts to start Chrome with remote debugging enabled:

**macOS/Linux:**
```bash
./start-chrome.sh
```

**Windows:**
```powershell
.\start-chrome.ps1
```

Or start Chrome manually:

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux:**
```bash
google-chrome --remote-debugging-port=9222
```

**Windows:**
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

## Installation

```bash
# Clone the repository
git clone https://github.com/clduab11/tabnab.git
cd tabnab

# Install dependencies
pnpm install

# Build the project
pnpm run build
```

## Quick Start

1. **Start Chrome with remote debugging:**
   ```bash
   ./start-chrome.sh  # macOS/Linux
   # or
   .\start-chrome.ps1  # Windows
   ```

2. **Test the connection (Milestone 1):**
   ```bash
   pnpm run test:milestone1
   ```
   
   This will verify that TabNab can connect to Chrome and retrieve the active tab URL.

3. **Configure MCP client** (see Usage section below)

## Usage

### As an MCP Server

Add TabNab to your MCP client configuration (e.g., Claude Desktop).

**Configuration File Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "tabnab": {
      "command": "node",
      "args": ["/absolute/path/to/tabnab/dist/mcp/index.js"],
      "env": {
        "CHROME_DEBUG_PORT": "9222"
      }
    }
  }
}
```

See `mcp-config.example.json` for a complete example.

### As a Standalone Electron App

```bash
pnpm run dev
```

This will start the menu bar application.

## Available Tools

### 1. get_active_tab

Returns the URL and title of the currently active browser tab.

**Input:** None

**Output:**
```json
{
  "url": "https://example.com",
  "title": "Example Domain"
}
```

### 2. navigate_and_extract

Navigate to a URL and extract the page content as clean Markdown.

**Input:**
```json
{
  "url": "https://example.com"
}
```

**Output:**
```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\n\nThis domain is for use in illustrative examples..."
}
```

### 3. click_element

Click an element on the current page using a CSS selector.

**Input:**
```json
{
  "selector": "button.submit"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Clicked element: button.submit"
}
```

### 4. fill_input

Fill an input field on the current page.

**Input:**
```json
{
  "selector": "input[name='email']",
  "value": "user@example.com"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Filled input: input[name='email']"
}
```

### 5. screenshot_tab

Take a screenshot of the current tab.

**Input:**
```json
{
  "fullPage": false,
  "path": "/path/to/screenshot.png"
}
```

**Output:**
```json
{
  "success": true,
  "path": "/path/to/screenshot.png",
  "message": "Screenshot saved to: /path/to/screenshot.png"
}
```

If `path` is not provided, the screenshot is returned as base64-encoded data.

## Architecture

```
/src
  /main       - Electron menu bar application
  /mcp        - MCP server implementation
  /browser    - Browser connection and automation
  /extraction - HTML to Markdown extraction
```

## Development

```bash
# Run type checking
pnpm run type-check

# Run linter
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Build
pnpm run build
```

## Technology Stack

- **Electron**: Menu bar application
- **Puppeteer Core**: Browser automation via Chrome DevTools Protocol
- **MCP SDK**: Model Context Protocol implementation
- **Turndown**: HTML to Markdown conversion
- **Zod**: Runtime type validation
- **TypeScript**: Type-safe development
- **Biome**: Fast linting and formatting

## License

MIT

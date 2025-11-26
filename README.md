# TabNab

Local MCP server that gives AI agents (Claude, Cursor, Windsurf) access to your authenticated browser sessions. Grab DOM, fill forms, and click through Cloudflare—all from your real Chrome browser with your real cookies.

**Give your AI your cookies, without giving it your password.**

## Why TabNab?

Cloud AI tools get blocked by Cloudflare, CAPTCHAs, and bot detection. TabNab solves this by connecting to your *real* Chrome browser running on your *real* residential IP, with all your existing cookies and authenticated sessions.

- **Access authenticated content**: Read your Gmail, check Stripe invoices, browse LinkedIn—all without sharing credentials
- **Bypass bot detection**: Uses your real browser fingerprint, not a detectable automation tool
- **Clean content extraction**: Converts messy HTML to clean Markdown, reducing LLM token usage by ~90%
- **Full automation**: Click, type, navigate—automate any workflow that requires authentication

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tabnab.git
cd tabnab

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run the Electron app
pnpm start
```

## Usage

### 1. Launch Chrome with Remote Debugging

```bash
# Using the helper script
./scripts/launch-chrome.sh

# Or manually on macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# On Linux
google-chrome --remote-debugging-port=9222

# On Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

### 2. Run TabNab

**As Electron App (with tray icon):**
```bash
pnpm start
```

**As standalone MCP server:**
```bash
pnpm mcp:stdio
```

### 3. Configure Claude Desktop

Add TabNab to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "tabnab": {
      "command": "node",
      "args": ["/path/to/tabnab/dist/mcp/server.js"]
    }
  }
}
```

### 4. Use with Claude

Ask Claude things like:
- "What's on my active tab?"
- "Go to my Stripe dashboard and show me the latest invoice"
- "Click the 'Next' button and tell me what's on page 2"
- "Search for 'senior engineer' on LinkedIn"
- "Take a screenshot of what you see"

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_active_tab` | Returns URL + cleaned Markdown of the currently focused Chrome tab |
| `navigate_and_extract` | Opens URL in background tab, extracts clean content |
| `click_element` | Clicks element by selector or text, returns resulting page |
| `fill_input` | Fills form field with human-like typing |
| `screenshot_tab` | Captures visible viewport as base64 PNG |

## Architecture

```
/src
├── main/           # Electron main process
├── mcp/            # MCP server + tool implementations
├── browser/        # puppeteer-core Chrome connection
├── extraction/     # Readability + Turndown HTML→Markdown
├── preload/        # Electron preload scripts
└── renderer/       # Status UI
```

## Development

```bash
# Watch mode for TypeScript
pnpm build:watch

# Run with hot reload
pnpm dev

# Lint and format
pnpm lint:fix
pnpm format

# Run tests
pnpm test
```

## Security Notes

- TabNab only binds to `127.0.0.1`—it's not accessible from the network
- Your cookies never leave your machine
- All browser automation happens locally
- The AI sees the page content, not your credentials

## Building for Distribution

```bash
# macOS .dmg
pnpm package:mac

# Windows .exe
pnpm package:win
```

## License

MIT

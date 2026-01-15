# Contributing to TabNab

Thank you for your interest in contributing to TabNab! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something useful together.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Chrome or Chromium browser
- Git

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tabnab.git
   cd tabnab
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the project:**
   ```bash
   pnpm run build
   ```

4. **Start Chrome with remote debugging:**
   ```bash
   ./start-chrome.sh  # macOS/Linux
   # or
   .\start-chrome.ps1  # Windows
   ```

5. **Verify setup:**
   ```bash
   pnpm run test:milestone1
   ```

## Development Workflow

### Before Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Read the relevant existing code to understand patterns

3. Check `CLAUDE.md` for coding standards and conventions

### Making Changes

1. **Write TypeScript code** following the existing patterns:
   - Use strict TypeScript - no `any` types
   - Validate external inputs with Zod schemas
   - Return structured error objects, don't throw exceptions
   - Follow the existing code style

2. **Run quality checks:**
   ```bash
   pnpm run type-check  # TypeScript validation
   pnpm run lint        # Biome linting
   pnpm run lint:fix    # Auto-fix lint issues
   pnpm run format      # Format code
   ```

3. **Build and test:**
   ```bash
   pnpm run build
   pnpm run test:milestone1
   ```

### Commit Guidelines

- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues when applicable: "Fix #123: Description"
- Keep commits focused - one logical change per commit

Example commit messages:
```
Add wait_for_element tool for dynamic content
Fix connection timeout handling in BrowserConnection
Update Zod schema for screenshot_tab path validation
```

### Submitting Changes

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what and why
   - Any testing you've done
   - Screenshots if UI changes

3. **Address review feedback** promptly

## Code Style

### TypeScript

- **Strict mode**: All strict type checks are enabled
- **Explicit types**: Use explicit types for function parameters and returns
- **Type imports**: Use `import type { X } from 'y'` for type-only imports
- **No any**: Never use `any` - use `unknown` and narrow if needed

### Formatting (Biome)

- 2 spaces for indentation
- 100 character line width
- Single quotes
- Trailing commas (ES5 style)

### Patterns

```typescript
// Zod schema pattern
export const ToolInputSchema = z.object({
  param: z.string().min(1, 'Parameter is required'),
});
export type ToolInput = z.infer<typeof ToolInputSchema>;

// Error handling pattern
async function toolMethod(input: ToolInput): Promise<ToolResult> {
  try {
    const validated = ToolInputSchema.parse(input);
    // ... implementation
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
```

## Adding a New MCP Tool

1. **Define the Zod schema** in `src/mcp/tools.ts`
2. **Implement the tool method** in the `MCPTools` class
3. **Register the tool** in `src/mcp/server.ts`
4. **Update documentation** in README.md and CLAUDE.md
5. **Add tests** (when test framework is available)

See existing tools in `src/mcp/tools.ts` for examples.

## Reporting Issues

### Bug Reports

Please include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, Chrome version)
- Error messages or logs

### Feature Requests

Please include:
- Clear description of the feature
- Use case - why is this needed?
- Proposed implementation (if you have ideas)

## Questions?

- Check existing issues and discussions
- Review the documentation in CLAUDE.md
- Open a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

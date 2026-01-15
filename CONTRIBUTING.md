# Contributing to TabNab

Thank you for your interest in contributing to TabNab! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Making Changes](#making-changes)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [License and Copyright](#license-and-copyright)

## Code of Conduct

This project follows a simple code of conduct: be respectful, constructive, and professional. We're all here to improve TabNab together.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 22 LTS** or higher ([Download](https://nodejs.org/))
- **pnpm 9.15.4** or higher (`npm install -g pnpm@9.15.4`)
- **Chrome/Chromium browser** for testing
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tabnab.git
   cd tabnab
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/clduab11/tabnab.git
   ```

## Development Environment Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Chrome with Remote Debugging

TabNab requires Chrome running with remote debugging enabled:

**macOS/Linux:**
```bash
./start-chrome.sh
```

**Windows:**
```powershell
.\start-chrome.ps1
```

Or manually:
```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

### 3. Build the Project

```bash
pnpm run build
```

### 4. Verify Setup

Test the connection to Chrome:

```bash
pnpm run test:milestone1
```

If successful, you should see output showing the active tab's URL and title.

## Making Changes

### Branch Naming

Create a descriptive branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-improvement
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### Commit Messages

Write clear, descriptive commit messages following this format:

```
<type>: <short description>

<longer description if needed>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

Example:
```
feat: add support for multiple browser profiles

Add ability to connect to Chrome profiles other than the default.
Users can now specify a profile directory in the configuration.
```

## Code Style and Standards

### TypeScript

- **Strict mode enabled** - All TypeScript strict checks must pass
- **Explicit types** - Provide explicit type annotations for function parameters and return values
- **No `any`** - Avoid using `any` type; use `unknown` if necessary
- **Modern ES2022+** - Use modern JavaScript features

### Code Formatting

TabNab uses **Biome** for linting and formatting:

```bash
# Check code style
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

**Before submitting a PR, always run:**
```bash
pnpm run lint:fix && pnpm run format
```

### Biome Configuration

The project follows these style rules (see `biome.json`):
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Trailing commas**: ES5 style
- **Import organization**: Enabled

### Code Organization

```
src/
├── main/       # Electron menu bar application
├── mcp/        # MCP server implementation
├── browser/    # Browser connection management
└── extraction/ # Content extraction utilities
```

### Error Handling

- Always use structured error objects with `success` flag
- Include descriptive error messages
- Use try-catch blocks for async operations
- Example:
  ```typescript
  try {
    // operation
  } catch (error) {
    return {
      success: false,
      message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  ```

### Zod Validation

All external inputs must be validated using Zod schemas:

```typescript
import { z } from 'zod';

const MyInputSchema = z.object({
  url: z.string().url(),
  selector: z.string().min(1),
});

type MyInput = z.infer<typeof MyInputSchema>;
```

## Testing

### Type Checking

Ensure your code passes TypeScript type checking:

```bash
pnpm run type-check
```

### Building

Build the project to ensure there are no compilation errors:

```bash
pnpm run build
```

### Manual Testing

1. Start Chrome with remote debugging
2. Build your changes: `pnpm run build`
3. Test the connection: `pnpm run test:milestone1`
4. Test with an MCP client (e.g., Claude Desktop)

### Integration Testing

Test your changes with a real MCP client:

1. Build TabNab: `pnpm run build`
2. Configure your MCP client (see README.md)
3. Test the affected tools/features through the AI agent

## Submitting Changes

### Before Submitting

Complete this checklist before submitting your pull request:

- [ ] Code follows the project's style guidelines
- [ ] Ran `pnpm run lint:fix && pnpm run format`
- [ ] Ran `pnpm run type-check` with no errors
- [ ] Ran `pnpm run build` successfully
- [ ] Tested changes manually
- [ ] Updated documentation if needed
- [ ] Updated CLAUDE.md if making architectural changes
- [ ] Commit messages are clear and follow conventions

### Pull Request Process

1. **Update your branch** with latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin your-branch-name
   ```

3. **Open a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changed and why
   - Include screenshots for UI changes
   - List any breaking changes

4. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes in new commits
   - Don't force-push after review has started

5. **Wait for approval**:
   - At least one maintainer approval required
   - All CI checks must pass
   - Resolve any merge conflicts

### Pull Request Template

When opening a PR, include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Related Issues
Closes #issue_number

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] All tests pass
```

## License and Copyright

### Contributor License Agreement (CLA)

By contributing to TabNab, you agree that:

1. **You grant the project maintainers** a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and distribute your contributions under any license the maintainers choose

2. **You own the copyright** to your contributions or have permission to contribute them

3. **Your contributions are original work** and don't violate any third-party rights

4. **You understand** that contributions may be used in both the free (PolyForm Shield) and commercial versions of TabNab

### Copyright Notice

Add the following to new files:

```typescript
/**
 * TabNab - Local MCP server for authenticated browser sessions
 * Copyright (c) 2025 TabNab Contributors
 */
```

### License

TabNab uses a dual-license model:
- **PolyForm Shield License 1.0.0** for non-commercial use
- **Commercial License** for commercial use

By contributing, you agree that your contributions will be licensed under the same dual-license model.

## Getting Help

### Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/clduab11/tabnab/discussions)
- **Bug reports**: Open a [GitHub Issue](https://github.com/clduab11/tabnab/issues)
- **Security issues**: See [SECURITY.md](SECURITY.md)

### Resources

- [README.md](README.md) - Project overview and usage
- [CLAUDE.md](CLAUDE.md) - Development guide for AI agents
- [Architecture Documentation](IMPLEMENTATION.md) - Technical architecture

## Recognition

Contributors will be recognized in:
- The CONTRIBUTORS file (if we create one)
- Release notes for their contributions
- GitHub's contributor graph

Thank you for contributing to TabNab! 🚀

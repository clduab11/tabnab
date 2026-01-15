# Changelog

All notable changes to TabNab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced CLAUDE.md with AI agent instructions and quick context section
- LICENSE file (MIT)
- CHANGELOG.md for tracking changes
- CONTRIBUTING.md with development guidelines
- SECURITY.md with security policy

## [0.1.0] - 2024-12-XX

### Added
- Initial release of TabNab MCP server
- Core MCP tools:
  - `get_active_tab` - Retrieve URL and title of active browser tab
  - `navigate_and_extract` - Navigate to URL and extract content as Markdown
  - `click_element` - Click elements using CSS selectors
  - `fill_input` - Fill input fields on web pages
  - `screenshot_tab` - Capture screenshots (base64 or file)
- Chrome DevTools Protocol connection via puppeteer-core
- Electron menu bar application
- Content extraction using Readability.js and Turndown
- TypeScript strict mode with Zod validation
- Biome linting and formatting
- GitHub Actions CI/CD pipeline:
  - Multi-platform builds (Linux, macOS, Windows)
  - CodeQL security scanning
  - Dependabot configuration
  - Release automation
- Helper scripts for Chrome startup (bash and PowerShell)
- Comprehensive documentation (README.md, CLAUDE.md, IMPLEMENTATION.md)
- GitHub issue and PR templates

### Security
- Local-only connections (localhost Chrome instance only)
- No credential storage - uses existing browser sessions
- All tool inputs validated via Zod schemas
- CodeQL security scanning in CI

[Unreleased]: https://github.com/clduab11/tabnab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/clduab11/tabnab/releases/tag/v0.1.0

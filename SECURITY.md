# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Model

TabNab is designed with security in mind:

### Local-Only Architecture
- Connects only to localhost Chrome instances via Chrome DevTools Protocol
- No external network connections for browser control
- No cloud services or remote servers

### No Credential Storage
- Does not store, transmit, or log passwords or credentials
- Uses existing browser sessions and cookies
- Session data remains in the user's browser

### Input Validation
- All tool inputs validated with Zod schemas
- Type-safe TypeScript with strict mode enabled
- No dynamic code execution from inputs

### Security Scanning
- CodeQL security analysis runs on every PR and weekly
- Dependabot monitors for vulnerable dependencies
- Regular dependency updates

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### Do NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it's fixed

### DO:
1. **Email**: Send details to the repository maintainers privately
2. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature
   - Go to Security tab → Report a vulnerability
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### Response Timeline
- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity and complexity

### Severity Classification

| Severity | Description | Response |
|----------|-------------|----------|
| Critical | Remote code execution, credential theft | Immediate patch |
| High | Local privilege escalation, data exposure | Patch within 7 days |
| Medium | Information disclosure, denial of service | Patch within 30 days |
| Low | Minor issues, hardening improvements | Next release |

## Security Best Practices for Users

### Chrome Setup
- Only enable remote debugging when using TabNab
- Use `--remote-debugging-port=9222` on localhost only
- Close debugging Chrome when not in use

### MCP Configuration
- Verify the MCP server path in your config
- Don't expose the MCP server to network access
- Review tool permissions in your MCP client

### General
- Keep TabNab and dependencies updated
- Review what browser sessions are accessible
- Be cautious with automation on sensitive sites

## Known Security Considerations

### CDP Access
The Chrome DevTools Protocol provides full browser control. This is intentional and necessary for TabNab's functionality, but users should understand:
- Any MCP client using TabNab has full control of the connected browser
- This includes access to all cookies, sessions, and page content
- Only connect TabNab to trusted MCP clients

### Session Visibility
- TabNab can read cookies and session data from any tab
- Automation actions are visible in the browser
- Users should review what sites are open when using automation

## Acknowledgments

We appreciate responsible security researchers who help keep TabNab secure. Contributors who report valid security issues will be acknowledged (with permission) in release notes.

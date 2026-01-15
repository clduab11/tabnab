# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          | Node.js Requirement |
| ------- | ------------------ | ------------------- |
| 0.1.x   | :white_check_mark: | >= 22               |

## Reporting a Vulnerability

The TabNab team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@tabnab.dev** (placeholder - replace with actual security contact)

You should receive a response within 48 hours. If for some reason you do not, please follow up via GitHub to ensure we received your original message.

### What to Include in Your Report

To help us better understand the nature and scope of the possible issue, please include as much of the following information as possible:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

This information will help us triage your report more quickly.

### Disclosure Policy

When we receive a security bug report, we will:

1. **Confirm the problem** and determine the affected versions
2. **Audit code** to find any similar problems
3. **Prepare fixes** for all supported versions
4. **Release new versions** as soon as possible

### Responsible Disclosure Guidelines

We kindly ask that you:

- **Allow us time** to respond to your report before any public disclosure
- **Make a good faith effort** to avoid privacy violations, destruction of data, and interruption or degradation of our services
- **Do not exploit** a security issue you discover for any reason (This includes demonstrating additional risk, such as attempted compromise of sensitive company data or probing for additional issues)
- **Do not violate** any other applicable laws or regulations

## TabNab-Specific Security Considerations

### Browser Connection Security

TabNab connects to Chrome/Chromium via the Chrome DevTools Protocol (CDP):

- **Local connections only**: TabNab only connects to `localhost` (127.0.0.1)
- **Port 9222 default**: This is the standard Chrome remote debugging port
- **No remote access**: The CDP connection is designed for local development only
- **Session isolation**: Each TabNab instance connects to its own Chrome instance

### Authenticated Session Handling

TabNab provides AI agents access to authenticated browser sessions:

- **Cookie access**: AI agents can access cookies from the connected browser
- **Session state**: Full access to browser session storage and authentication tokens
- **User responsibility**: Users must trust the AI agent and understand what data they're exposing
- **No credential storage**: TabNab itself does not store credentials or session tokens

### Key Security Principles

1. **Never expose remote debugging publicly**: Chrome's remote debugging port should NEVER be exposed to the internet
2. **Trust your AI agent**: Only use TabNab with AI agents you trust, as they gain access to authenticated sessions
3. **Monitor AI actions**: TabNab operates on your live browser - monitor what actions are being taken
4. **Use for development only**: TabNab is designed for development and automation, not production systems
5. **Keep software updated**: Always use the latest version of TabNab to ensure you have security patches

### Potential Security Risks

Users should be aware of these inherent security considerations when using TabNab:

1. **AI agent access to sensitive data**
   - AI agents can read any data visible in your browser
   - This includes cookies, session tokens, and page content
   - Be cautious when using with sensitive accounts

2. **Automated actions on live sessions**
   - AI agents can perform actions on your behalf
   - This includes form submissions, clicks, and navigation
   - Monitor the AI agent's actions to prevent unintended consequences

3. **Chrome DevTools Protocol exposure**
   - CDP provides extensive control over the browser
   - Ensure the debugging port is only accessible locally
   - Never expose port 9222 to untrusted networks

4. **Session hijacking risk**
   - If TabNab or the AI agent is compromised, session tokens could be stolen
   - Use TabNab only on trusted systems
   - Consider using separate browser profiles for sensitive work

### Best Practices for Users

To use TabNab securely:

1. **Use a dedicated browser profile**
   - Create a separate Chrome profile for TabNab automation
   - Don't use the same profile for sensitive personal accounts

2. **Monitor AI agent actions**
   - Watch what the AI agent does in real-time
   - Stop the agent if it performs unexpected actions

3. **Limit scope of automation**
   - Don't grant AI agents access to highly sensitive accounts
   - Use for development and testing purposes primarily

4. **Keep systems updated**
   - Update TabNab, Node.js, and Chrome regularly
   - Apply security patches promptly

5. **Review code before running**
   - TabNab is open source - review the code before use
   - Verify you're running official releases

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. We will:

- Release a new version with the fix
- Publish a security advisory on GitHub
- Notify users via GitHub Releases and repository README
- Provide upgrade instructions and workarounds if available

Subscribe to GitHub notifications for this repository to receive security updates.

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.

---

**Thank you for helping keep TabNab and its users safe!**

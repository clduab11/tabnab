import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type BrowserContext } from 'playwright';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MCPTools } from '../mcp/tools.js';
import type { PolicyConfig } from '../policy/types.js';

function renderPage(title: string, body: string): string {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
    </head>
    <body>
      ${body}
    </body>
  </html>`;
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  if (req.url === '/next') {
    const html = renderPage(
      'Next',
      `
      <h1 id="next-title">Next Page</h1>
      <button id="delete-account">Delete Account</button>
    `
    );
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  const html = renderPage(
    'Home',
    `
    <label for="name">Name</label>
    <input id="name" name="name" />
    <a id="nav" href="/next">Go</a>
    <button id="delete-account">Delete Account</button>
  `
  );
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

async function startServer(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createServer(handleRequest);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to start test server');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

async function startTestBrowser(): Promise<{
  context: BrowserContext;
  close: () => Promise<void>;
}> {
  const userDataDir = await mkdtemp(join(tmpdir(), 'tabnab-test-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
  });
  return {
    context,
    close: async () => {
      await context.close();
      await rm(userDataDir, { recursive: true, force: true });
    },
  };
}

test('browser tools integration', async (t) => {
  const server = await startServer();
  t.after(async () => {
    await server.close();
  });

  const browser = await startTestBrowser();
  t.after(async () => {
    await browser.close();
  });

  const page = await browser.context.newPage();
  await page.goto(server.baseUrl);

  const policyConfig: PolicyConfig = {
    allowedDomains: ['127.0.0.1'],
    allowedPathPrefixes: {},
    confirmationMode: 'confirm-on-sensitive',
    auditLogPath: `${tmpdir()}/tabnab-audit.log`,
    maxSteps: 30,
    selectorLogMode: 'truncate',
  };

  const tools = new MCPTools({
    connection: {
      getAllTabs: async () => browser.context.pages(),
      disconnect: async () => browser.context.close(),
    } as never,
    policyConfig,
  });

  const tabs = await tools.listTabs();
  assert.equal(tabs.ok, true);
  assert.ok(tabs.data && tabs.data.length > 0);
  const active = tabs.data?.find((tab) => tab.active) ?? tabs.data?.[0];
  assert.ok(active);

  const fillResult = await tools.fillInput({
    selector: '#name',
    value: 'Ada Lovelace',
    tabId: active.tabId,
  });
  assert.equal(fillResult.ok, true);
  assert.equal(await page.inputValue('#name'), 'Ada Lovelace');

  const clickResult = await tools.clickElement({ selector: '#nav', tabId: active.tabId });
  assert.equal(clickResult.ok, true);
  await page.waitForURL('**/next');
  assert.ok(page.url().endsWith('/next'));

  const screenshotResult = await tools.screenshotTab({ tabId: active.tabId });
  assert.equal(screenshotResult.ok, true);
  assert.ok(screenshotResult.data && 'screenshot' in screenshotResult.data);
  const screenshotData = screenshotResult.data as { screenshot?: string };
  assert.ok(screenshotData.screenshot);
  assert.ok(screenshotData.screenshot?.length);

  const blocked = await tools.clickElement({ selector: '#delete-account', tabId: active.tabId });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.error?.code, 'NEEDS_CONFIRMATION');
  const confirmationId = (blocked.data as { confirmationId: string }).confirmationId;

  const confirm = await tools.confirmAction({ confirmationId });
  assert.equal(confirm.ok, true);

  const approvedClick = await tools.clickElement({
    selector: '#delete-account',
    tabId: active.tabId,
    confirmationId,
  });
  assert.equal(approvedClick.ok, true);
});

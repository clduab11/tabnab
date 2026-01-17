import test from 'node:test';
import assert from 'node:assert/strict';
import { MCPTools } from '../mcp/tools.js';
import type { PolicyConfig } from '../policy/types.js';

class MockPage {
  clicked = false;

  url() {
    return 'https://example.com/account';
  }

  async title() {
    return 'Account';
  }

  async waitForSelector() {
    return;
  }

  async click() {
    this.clicked = true;
  }

  async bringToFront() {
    return;
  }
}

test('click_element enforces confirmation and executes on confirm_action', async () => {
  const page = new MockPage();
  const connection = {
    getAllTabs: async () => [page],
    disconnect: async () => undefined,
  } as never;

  const policyConfig: PolicyConfig = {
    allowedDomains: ['example.com'],
    allowedPathPrefixes: {},
    confirmationMode: 'confirm-on-sensitive',
    auditLogPath: '/tmp/tabnab-audit.log',
    maxSteps: 30,
    selectorLogMode: 'truncate',
  };

  const tools = new MCPTools({ connection, policyConfig });
  const result = await tools.clickElement({ selector: '#delete-account' });

  assert.equal(result.ok, false);
  assert.equal(result.status, 'needs_confirmation');
  assert.equal(page.clicked, false);
  assert.ok(result.confirmation_token);

  const confirmed = await tools.confirmAction({
    confirmationToken: result.confirmation_token ?? '',
    action: 'confirm',
  });

  assert.equal(confirmed.ok, true);
  assert.equal(page.clicked, true);
});

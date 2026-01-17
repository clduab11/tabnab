import test from 'node:test';
import assert from 'node:assert/strict';
import { enforcePolicy } from '../policy/policy.js';
import type { PolicyConfig } from '../policy/types.js';

const config: PolicyConfig = {
  allowedDomains: ['example.com'],
  allowedPathPrefixes: {},
  confirmationMode: 'confirm-on-sensitive',
  auditLogPath: '/tmp/tabnab-audit.log',
  maxSteps: 30,
  selectorLogMode: 'truncate',
};

test('sensitive selectors require confirmation', () => {
  const decision = enforcePolicy(
    {
      toolName: 'click_element',
      url: 'https://example.com/account',
      selector: '#delete-account',
      actionType: 'click',
    },
    config
  );

  assert.equal(decision.allowed, true);
  assert.equal(decision.requiresConfirmation, true);
  assert.ok(decision.reasonCodes.includes('sensitive_action'));
});

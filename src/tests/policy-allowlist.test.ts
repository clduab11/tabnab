import test from 'node:test';
import assert from 'node:assert/strict';
import { isUrlAllowed } from '../policy/allowlist.js';
import type { PolicyConfig } from '../policy/types.js';

const baseConfig: PolicyConfig = {
  allowedDomains: ['example.com'],
  allowedPathPrefixes: { 'example.com': ['/billing', '/settings'] },
  confirmationMode: 'confirm-on-sensitive',
  auditLogPath: '/tmp/tabnab-audit.log',
  maxSteps: 30,
  selectorLogMode: 'truncate',
};

test('allowlist permits matching domain and path prefix', () => {
  const url = new URL('https://example.com/billing/invoices');
  const result = isUrlAllowed(url, baseConfig);
  assert.equal(result.allowed, true);
});

test('allowlist blocks unmatched path prefix', () => {
  const url = new URL('https://example.com/profile');
  const result = isUrlAllowed(url, baseConfig);
  assert.equal(result.allowed, false);
  assert.ok(result.reasonCodes.includes('path_prefix_blocked'));
});

test('allowlist blocks unknown domains', () => {
  const url = new URL('https://other.com/');
  const result = isUrlAllowed(url, baseConfig);
  assert.equal(result.allowed, false);
  assert.ok(result.reasonCodes.includes('allowlist_blocked'));
});

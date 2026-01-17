import test from 'node:test';
import assert from 'node:assert/strict';
import { redactAuditEvent, redactMetadata, redactUrl } from '../policy/redaction.js';

test('redactUrl masks obvious token query params', () => {
  const url = 'https://example.com/callback?token=secret&state=keep&code=abc123';
  const redacted = redactUrl(url);
  assert.equal(
    redacted,
    'https://example.com/callback?token=%5BREDACTED%5D&state=keep&code=%5BREDACTED%5D'
  );
});

test('redactMetadata hides sensitive keys and url tokens', () => {
  const payload = {
    selector: '#login',
    value: 'super-secret',
    headers: {
      authorization: 'Bearer token',
      cookie: 'sid=123',
    },
    url: 'https://example.com/account?session=xyz',
  };

  const redacted = redactMetadata(payload) as Record<string, unknown>;
  assert.equal(redacted.value, '[REDACTED]');
  assert.deepEqual(redacted.headers, { authorization: '[REDACTED]', cookie: '[REDACTED]' });
  assert.equal(
    redacted.url,
    'https://example.com/account?session=%5BREDACTED%5D'
  );
});

test('redactAuditEvent keeps only allowed audit fields', () => {
  const event = redactAuditEvent(
    {
      toolName: 'fill_input',
      actionType: 'fill',
      url: 'https://example.com/login?auth=token',
      selector: '#password',
      outcome: 'allowed',
      reasonCodes: ['sensitive_action'],
    },
    'truncate'
  );

  assert.equal(event.url, 'https://example.com/login?auth=%5BREDACTED%5D');
  assert.equal(event.selector, '#password');
  assert.equal(event.toolName, 'fill_input');
});

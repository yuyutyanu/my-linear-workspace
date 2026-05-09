import assert from 'node:assert/strict';
import test from 'node:test';

import { parseQrPayload } from './qrPayload';

test('parses custom scheme deep links whose route is in the host segment', () => {
  const result = parseQrPayload('mylinearworkspace://details?id=42');

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value.href, { pathname: '/details', params: { id: '42' } });
  }
});

test('parses URL-encoded JSON payloads with nested params', () => {
  const payload = encodeURIComponent(JSON.stringify({ route: 'details', params: { id: 'abc' } }));
  const result = parseQrPayload(payload);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value.href, { pathname: '/details', params: { id: 'abc' } });
  }
});

test('returns actionable errors for unsupported routes', () => {
  const result = parseQrPayload('mylinearworkspace://unknown');

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /サポートされていません/);
  }
});

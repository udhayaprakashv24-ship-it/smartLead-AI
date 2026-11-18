import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLogLine,
  sanitizeLogMeta,
  sanitizeLogText,
  shouldIgnoreClientError,
  trimLogLines,
} from './logger';

test('sanitizeLogText redacts API keys, bearer tokens, and flattens newlines', () => {
  const raw = 'Error with AIzaSyAbCdEf1234567890_XYZ\nand Bearer secret.jwt.token';
  const clean = sanitizeLogText(raw);
  assert.equal(clean.includes('AIzaSyAbCdEf'), false);
  assert.equal(clean.includes('secret.jwt.token'), false);
  assert.ok(clean.includes('[REDACTED_KEY]'));
  assert.ok(clean.includes('Bearer [REDACTED_TOKEN]'));
  assert.equal(clean.includes('\n'), false);
});

test('sanitizeLogText redacts inline GEMINI_API_KEY assignments', () => {
  const clean = sanitizeLogText('GEMINI_API_KEY=supersecretvalue123 failed');
  assert.equal(clean.includes('supersecretvalue123'), false);
  assert.equal(clean, 'GEMINI_API_KEY=[REDACTED_KEY] failed');
});

test('sanitizeLogMeta cleans nested strings and Error objects', () => {
  const meta = sanitizeLogMeta({
    status: 500,
    err: new Error('Bad key AIzaSyAbCdEf1234567890_XYZ'),
    tags: ['ok', 'Bearer mytoken123'],
  });
  assert.deepEqual(meta, {
    status: 500,
    err: 'Bad key [REDACTED_KEY]',
    tags: ['ok', 'Bearer [REDACTED_TOKEN]'],
  });
});

test('formatLogLine produces timestamped structured line', () => {
  const line = formatLogLine({
    timestamp: '2026-11-18T10:00:00.000Z',
    level: 'error',
    category: 'API',
    message: 'POST /api/chat failed',
    meta: { status: 503 },
  });
  assert.equal(
    line,
    '[2026-11-18T10:00:00.000Z] [ERROR] [API] POST /api/chat failed {"status":503}'
  );
});

test('trimLogLines keeps only the most recent maxLines entries', () => {
  const input = ['line-1', 'line-2', 'line-3', 'line-4', 'line-5'].join('\n');
  assert.equal(trimLogLines(input, 3), 'line-3\nline-4\nline-5\n');
  assert.equal(trimLogLines('', 3), '');
});

test('shouldIgnoreClientError filters noisy dev HMR WebSocket disconnects', () => {
  assert.equal(shouldIgnoreClientError('Error: WebSocket closed without opened.'), true);
  assert.equal(shouldIgnoreClientError('TypeError: Cannot read properties of null'), false);
});

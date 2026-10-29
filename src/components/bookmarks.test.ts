import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, generateSlug, normalizeUrl, parseBookmarks } from './bookmarks.ts';

test('URLs with and without https normalize to the same saved value', () => {
  assert.equal(normalizeUrl('www.example.com'), normalizeUrl('https://www.example.com'));
  assert.equal(normalizeUrl('  example.com/path?q=1#section  '), 'https://example.com/path?q=1#section');
  assert.equal(normalizeUrl('//example.com'), 'https://example.com/');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
  assert.equal(normalizeUrl('localhost:4321/path'), 'https://localhost:4321/path');
});

test('invalid and unsafe URLs are rejected', () => {
  for (const value of ['', 'not a url', 'javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', 'https://user:pass@example.com']) {
    assert.throws(() => normalizeUrl(value));
  }
});

test('missing, empty, corrupted, legacy and non-array storage recovers', () => {
  assert.deepEqual(parseBookmarks(null), { bookmarks: [], recovered: false });
  assert.deepEqual(parseBookmarks('[]'), { bookmarks: [], recovered: false });
  for (const raw of ['', '{broken', 'null', '{}', '42', '"legacy"', '{"bookmarks":[]}', '["https://example.com"]']) {
    assert.deepEqual(parseBookmarks(raw), { bookmarks: [], recovered: true });
  }
});

test('storage validation drops malformed entries and duplicate slugs', () => {
  const valid = { url: 'https://example.com/', slug: 'mona-7fk2' };
  const raw = JSON.stringify([
    null, false, 1, [], {}, { url: 12, slug: 'mona-abcd' },
    { url: valid.url }, { url: valid.url, slug: 'old-slug' },
    { url: 'javascript:alert(1)', slug: 'mona-0001' },
    valid, valid, { url: 'example.org', slug: 'mona-AB12', extra: 'discard' },
  ]);
  assert.deepEqual(parseBookmarks(raw), {
    bookmarks: [valid, { url: 'https://example.org/', slug: 'mona-AB12' }],
    recovered: true,
  });
});

test('validated storage round-trips and formatting uses the exact separator', () => {
  const bookmark = { url: 'https://www.example.com/', slug: 'mona-7fk2' };
  assert.deepEqual(parseBookmarks(JSON.stringify([bookmark])), { bookmarks: [bookmark], recovered: false });
  assert.equal(formatBookmark(bookmark), 'https://www.example.com/ :: mona-7fk2');
});

test('slugs are four base62 characters with collision resolution and wraparound', () => {
  assert.equal(generateSlug([], 0), 'mona-0000');
  assert.equal(generateSlug([], 61), 'mona-000Z');
  assert.equal(generateSlug([{ url: 'https://example.com/', slug: 'mona-ZZZZ' }], 62 ** 4 - 1), 'mona-0000');
  const bookmarks = [{ url: 'https://example.com/', slug: 'mona-0000' }];
  assert.equal(generateSlug(bookmarks, 0), 'mona-0001');
  assert.throws(() => generateSlug([], -1));
});

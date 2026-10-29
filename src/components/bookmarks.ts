export interface Bookmark {
  url: string;
  slug: string;
}

export const STORAGE_KEY = 'mona-bookmarks';
export const BOOKMARK_SEPARATOR = ' :: ';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_SPACE = 62 ** 4;

export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) throw new Error('Enter a URL to save.');

  const url = new URL(
    value.startsWith('//') ? `https:${value}` :
      /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`,
  );
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new Error('Use an HTTP or HTTPS URL without embedded credentials.');
  }
  return url.href;
}

export function parseBookmarks(raw: string | null): { bookmarks: Bookmark[]; recovered: boolean } {
  if (raw === null) return { bookmarks: [], recovered: false };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { bookmarks: [], recovered: true };
  }
  if (!Array.isArray(value)) return { bookmarks: [], recovered: true };

  const bookmarks: Bookmark[] = [];
  const slugs = new Set<string>();
  for (const entry of value) {
    if (
      typeof entry !== 'object' || entry === null ||
      typeof entry.url !== 'string' || typeof entry.slug !== 'string' ||
      !/^mona-[0-9a-zA-Z]{4}$/.test(entry.slug) || slugs.has(entry.slug)
    ) continue;
    try {
      const url = normalizeUrl(entry.url);
      bookmarks.push({ url, slug: entry.slug });
      slugs.add(entry.slug);
    } catch {
      // Discard invalid URLs from untrusted storage, preserving other entries.
    }
  }
  return { bookmarks, recovered: bookmarks.length !== value.length };
}

export function generateSlug(bookmarks: readonly Bookmark[], seed: number): string {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed >= SLUG_SPACE) {
    throw new Error('Invalid slug seed.');
  }
  const used = new Set(bookmarks.map(({ slug }) => slug));
  for (let offset = 0; offset < SLUG_SPACE; offset++) {
    let number = (seed + offset) % SLUG_SPACE;
    let suffix = '';
    for (let digit = 0; digit < 4; digit++) {
      suffix = BASE62[number % 62] + suffix;
      number = Math.floor(number / 62);
    }
    const slug = `mona-${suffix}`;
    if (!used.has(slug)) return slug;
  }
  throw new Error('No bookmark slugs remain. Clear some bookmarks before adding more.');
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url}${BOOKMARK_SEPARATOR}${bookmark.slug}`;
}

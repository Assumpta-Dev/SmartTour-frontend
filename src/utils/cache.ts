const PREFIX = 'st_cache_';

export function cacheSet(key: string, data: unknown) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch {}
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

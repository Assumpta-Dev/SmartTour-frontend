const PREFIX = 'st_cache_';
export function cacheSet(key, data) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(data));
    }
    catch { }
}
export function cacheGet(key) {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}

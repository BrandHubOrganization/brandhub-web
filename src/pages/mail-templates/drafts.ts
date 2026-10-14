/** Small localStorage draft helper. Every access is guarded: storage can be blocked or full. */
const TTL_MS = 7 * 24 * 3600 * 1000;

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: T };
    if (!parsed || Date.now() - parsed.at > TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* draft is a convenience only */
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

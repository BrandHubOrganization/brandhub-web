/**
 * Storage utility for recent images (logos/avatars and banners).
 * Persists up to 16 unique URLs in localStorage per category.
 */

const STORAGE_KEYS = {
  logo: "brandhub_recent_logos",
  banner: "brandhub_recent_banners",
} as const;

export type AssetCategory = keyof typeof STORAGE_KEYS;

const MAX_RECENT_ITEMS = 16;

export function getRecentAssets(category: AssetCategory): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[category]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only return valid non-empty string URLs
    return parsed.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export function saveRecentAsset(category: AssetCategory, url: string): void {
  if (!url || typeof url !== "string" || !url.trim()) return;
  // Ignore data URLs or blobs as they expire or bloat localStorage
  if (url.startsWith("blob:") || url.startsWith("data:")) return;

  try {
    const current = getRecentAssets(category);
    // Remove if already present (to move it to top)
    const filtered = current.filter((item) => item !== url);
    const updated = [url, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEYS[category], JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save recent asset to localStorage:", err);
  }
}

export function removeRecentAsset(category: AssetCategory, url: string): void {
  try {
    const current = getRecentAssets(category);
    const updated = current.filter((item) => item !== url);
    localStorage.setItem(STORAGE_KEYS[category], JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to remove recent asset from localStorage:", err);
  }
}

export function clearRecentAssets(category: AssetCategory): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[category]);
  } catch {
    // ignore
  }
}

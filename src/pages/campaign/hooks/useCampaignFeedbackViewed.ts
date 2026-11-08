import { useCallback, useSyncExternalStore } from "react";

const eventName = "campaign-feedback-viewed";
const fallback = new Map<string, number>();

function read(key: string) {
  try {
    const stored = Number(localStorage.getItem(key));
    return Math.max(
      Number.isFinite(stored) ? stored : 0,
      fallback.get(key) ?? 0,
    );
  } catch {
    return fallback.get(key) ?? 0;
  }
}

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(eventName, notify);
  };
}

export function useCampaignFeedbackViewed(key: string) {
  const snapshot = useCallback(() => read(key), [key]);
  const viewed = useSyncExternalStore(subscribe, snapshot, () => 0);
  const markViewed = useCallback(
    (timestamp: number) => {
      if (!Number.isFinite(timestamp) || timestamp <= read(key)) return;
      fallback.set(key, timestamp);
      try {
        localStorage.setItem(key, String(timestamp));
      } catch {
        // Keep read tracking available for this session when storage is blocked.
      }
      window.dispatchEvent(new Event(eventName));
    },
    [key],
  );
  return { viewed, markViewed };
}

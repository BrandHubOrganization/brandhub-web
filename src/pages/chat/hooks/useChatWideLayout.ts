import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1280px)";
const subscribe = (callback: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
export function useChatWideLayout() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

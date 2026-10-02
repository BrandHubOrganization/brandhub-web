import { useEffect, useState } from "react";
import { MonitoringAccessError } from "@/pages/admin/system-health/services/monitoringService";
import type {
  Feed,
  Snapshot,
} from "@/pages/admin/system-health/types/monitoring";

const POLL_MS = 5000;

/** Poll without overlapping requests; keep stale snapshots only for non-auth errors. */
export function useMonitoringFeed<T>(
  read: (signal: AbortSignal) => Promise<Snapshot<T>>,
  onDenied: (status: number) => void,
  enabled: boolean,
): Feed<T> {
  const [feed, setFeed] = useState<Feed<T>>({
    snapshot: null,
    loading: true,
    failed: false,
  });
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (wasEnabled !== enabled) {
    setWasEnabled(enabled);
    if (!enabled) setFeed({ snapshot: null, loading: false, failed: false });
  }
  useEffect(() => {
    if (!enabled) return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const snapshot = await read(abort.signal);
        if (!abort.signal.aborted)
          setFeed({ snapshot, loading: false, failed: false });
      } catch (error: unknown) {
        if (abort.signal.aborted) return;
        if (error instanceof MonitoringAccessError) {
          onDenied(error.status);
          return;
        }
        setFeed((previous) => ({ ...previous, loading: false, failed: true }));
      }
      if (!abort.signal.aborted) timer = setTimeout(poll, POLL_MS);
    }
    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [read, onDenied, enabled]);
  return enabled ? feed : { snapshot: null, loading: false, failed: false };
}

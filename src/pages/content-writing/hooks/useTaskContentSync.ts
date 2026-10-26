import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { requireApiData } from "@/lib/apiData";

/**
 * FR 3.6.10 real-time sync: loads the Yjs snapshot + operation tail over
 * REST, then streams further Yjs updates both ways over a STOMP WebSocket.
 * See plan.md §3/§4 and report4_sequence.drawio for the full flow.
 *
 * Client-reported snapshot: the server never decodes Yjs updates (opaque
 * blobs — see TaskContentServiceImpl), so once operationsSinceSnapshot
 * crosses a threshold, this hook (not the server) posts the current merged
 * Y.Doc state via POST .../content/snapshot — see plan.md's snapshot-gap
 * decision.
 *
 * Presence/multi-cursor: a standard y-protocols Awareness instance rides a
 * second, unpersisted STOMP topic (/app+/topic/tasks/{taskId}/awareness —
 * see TaskContentWebSocketController.handleAwareness). Unlike content,
 * awareness state is never queued while offline and never replayed from
 * REST on reconnect — it's inherently "right now" state (cursor position),
 * so a stale queued update would show a peer's cursor somewhere they no
 * longer are. Awareness's own built-in 30s outdated-state timeout (see
 * y-protocols/awareness's internal `outdatedTimeout` + check interval)
 * already clears a peer that goes silent, so no extra cleanup is needed here.
 */

export interface PeerCursor {
  clientId: number;
  userId: string;
  name: string;
  color: string;
  caretIndex: number;
  selection: { anchor: number; focus: number } | null;
}

const SNAPSHOT_THRESHOLD = 200;
// Short social posts never reach SNAPSHOT_THRESHOLD, so also snapshot once
// the document has been idle this long — otherwise Version History would
// stay empty for them.
const SNAPSHOT_IDLE_MS = 20_000;
const WS_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8080";

function toBase64(update: Uint8Array): string {
  let binary = "";
  update.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Edits made while the socket is down are kept here too, so closing the tab
// before reconnecting doesn't lose them. Yjs updates are idempotent, so
// replaying them on the next visit is safe even if some were already sent.
function pendingKey(taskId: string) {
  return `brandhub-content-pending:${taskId}`;
}

function loadPending(taskId: string): Uint8Array[] {
  try {
    const raw = window.localStorage.getItem(pendingKey(taskId));
    return raw ? (JSON.parse(raw) as string[]).map(fromBase64) : [];
  } catch {
    return [];
  }
}

function savePending(taskId: string, updates: Uint8Array[]) {
  try {
    if (updates.length === 0) {
      window.localStorage.removeItem(pendingKey(taskId));
    } else {
      window.localStorage.setItem(
        pendingKey(taskId),
        JSON.stringify(updates.map(toBase64)),
      );
    }
  } catch {
    // Storage unavailable (private mode, quota) — in-memory queue still works.
  }
}

interface TaskContentResponse {
  snapshot: string | null;
  operationsSinceSnapshot: string[];
  sequenceNumber: number;
}

// Deterministic per-user cursor color — same user always gets the same
// color across sessions/devices, Google-Docs-style, without a server roundtrip.
const CURSOR_COLORS = [
  "#e53935",
  "#8e24aa",
  "#3949ab",
  "#1e88e5",
  "#00897b",
  "#43a047",
  "#fb8c00",
  "#d81b60",
  "#6d4c41",
  "#546e7a",
];
function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++)
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function useTaskContentSync(workspaceId: string, taskId: string | null) {
  const yDoc = useMemo(() => new Y.Doc(), [taskId]);
  const awareness = useMemo(() => new Awareness(yDoc), [yDoc]);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  // Bumps each time a snapshot is reported, so the Version History list can refresh.
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [peers, setPeers] = useState<PeerCursor[]>([]);
  const sequenceRef = useRef(0);
  const operationsSinceSnapshotRef = useRef(0);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!taskId) return;
    let disposed = false;
    let cleanupUpdateHandler: (() => void) | null = null;
    let cleanupAwarenessHandler: (() => void) | null = null;
    let cleanupAwarenessChangeHandler: (() => void) | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    async function init() {
      const { data } = await api.get<{ data: TaskContentResponse }>(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content`,
      );
      if (disposed) return;
      const content = requireApiData<TaskContentResponse>(data);
      if (content.snapshot) {
        Y.applyUpdate(yDoc, fromBase64(content.snapshot));
      }
      content.operationsSinceSnapshot.forEach((update) => {
        Y.applyUpdate(yDoc, fromBase64(update));
      });
      sequenceRef.current = content.sequenceNumber;
      operationsSinceSnapshotRef.current =
        content.operationsSinceSnapshot.length;
      setIsReady(true);

      // Updates fired before the WS connects (the Creator can start typing
      // the instant isReady flips, well before onConnect resolves) must not
      // be silently dropped — a later Yjs struct whose `origin` points at a
      // never-sent earlier struct becomes a permanently unreachable orphan
      // (parent stays null) once it lands on another client. Queue instead.
      const pendingUpdates: Uint8Array[] = loadPending(taskId!);
      pendingUpdates.forEach((u) => Y.applyUpdate(yDoc, u, "remote"));

      const sendUpdate = (client: Client, update: Uint8Array) => {
        client.publish({
          destination: `/app/tasks/${taskId}/content`,
          body: JSON.stringify({ update: toBase64(update) }),
        });
      };

      const brokerUrl = () =>
        `${WS_BASE_URL}/ws/tasks?token=${encodeURIComponent(useAuthStore.getState().accessToken ?? "")}`;
      // After a drop the server may have broadcast updates we never saw
      // (the subscription only delivers new ones). Pull the log again and
      // merge it; Yjs makes re-applying known updates a no-op.
      const resync = async () => {
        const { data: fresh } = await api.get<{ data: TaskContentResponse }>(
          `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content`,
        );
        if (disposed) return;
        const c = fresh.data;
        if (c.snapshot) Y.applyUpdate(yDoc, fromBase64(c.snapshot), "remote");
        c.operationsSinceSnapshot.forEach((u) =>
          Y.applyUpdate(yDoc, fromBase64(u), "remote"),
        );
        sequenceRef.current = Math.max(sequenceRef.current, c.sequenceNumber);
      };
      let hasConnectedBefore = false;
      const client = new Client({
        brokerURL: brokerUrl(),
        reconnectDelay: 3000,
        // The access token is short-lived: a reconnect must not reuse the URL
        // built at mount time.
        beforeConnect: (c) => {
          c.brokerURL = brokerUrl();
        },
        onConnect: () => {
          setConnectionError(false);
          setIsConnected(true);
          if (hasConnectedBefore) void resync().catch(() => undefined);
          hasConnectedBefore = true;
          client.subscribe(`/topic/tasks/${taskId}/content`, (message) => {
            const body = JSON.parse(message.body) as {
              update: string;
              sequenceNumber: number;
            };
            Y.applyUpdate(yDoc, fromBase64(body.update), "remote");
            sequenceRef.current = body.sequenceNumber;
            operationsSinceSnapshotRef.current += 1;
            maybeReportSnapshot();
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(
              () => maybeReportSnapshot(true),
              SNAPSHOT_IDLE_MS,
            );
          });
          client.subscribe(`/topic/tasks/${taskId}/awareness`, (message) => {
            const body = JSON.parse(message.body) as { update: string };
            // "remote-ws" origin: distinguishes peers' updates from this
            // tab's own (origin "local"), so the broadcast loop below never
            // echoes a peer's cursor back out as if it were ours.
            applyAwarenessUpdate(
              awareness,
              fromBase64(body.update),
              "remote-ws",
            );
          });
          while (pendingUpdates.length > 0) {
            sendUpdate(client, pendingUpdates.shift()!);
          }
          savePending(taskId!, []);
        },
        onDisconnect: () => setIsConnected(false),
        onWebSocketClose: () => setIsConnected(false),
        onStompError: () => {
          if (!disposed) {
            setConnectionError(true);
            setIsConnected(false);
          }
          void client.deactivate();
        },
      });
      client.activate();
      clientRef.current = client;

      const currentUser = useAuthStore.getState().user;
      awareness.setLocalState({
        userId: currentUser?.id ?? "",
        name: currentUser?.name || currentUser?.email || "BrandHub Creator",
        color: colorForUser(currentUser?.id ?? taskId!),
        caretIndex: 0,
        selection: null,
      });

      // Only broadcast changes this tab originated — awareness.on("update")
      // also fires for changes applyAwarenessUpdate just applied from the
      // WS subscription above, which must not be re-sent (infinite echo,
      // same reasoning as updateHandler's origin check for content).
      const awarenessUpdateHandler = (
        {
          added,
          updated,
          removed,
        }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown,
      ) => {
        if (origin === "remote-ws") return;
        if (!client.connected) return;
        const changed = [...added, ...updated, ...removed];
        client.publish({
          destination: `/app/tasks/${taskId}/awareness`,
          body: JSON.stringify({
            update: toBase64(encodeAwarenessUpdate(awareness, changed)),
          }),
        });
      };
      awareness.on("update", awarenessUpdateHandler);
      cleanupAwarenessHandler = () =>
        awareness.off("update", awarenessUpdateHandler);

      const syncPeers = () => {
        const localId = awareness.clientID;
        const next: PeerCursor[] = [];
        awareness.getStates().forEach((state, clientId) => {
          if (clientId === localId) return;
          if (!state?.userId) return;
          next.push({
            clientId,
            userId: state.userId,
            name: state.name ?? "BrandHub Creator",
            color: state.color ?? "#546e7a",
            caretIndex: state.caretIndex ?? 0,
            selection: state.selection ?? null,
          });
        });
        setPeers(next);
      };
      awareness.on("change", syncPeers);
      cleanupAwarenessChangeHandler = () => awareness.off("change", syncPeers);

      // Local edits: forward to the server. "remote"-origin updates (applied
      // above from the WS subscription) must not be re-sent — infinite echo.
      //
      // Named handler + yDoc.off() in cleanup matters: without it, React
      // StrictMode's dev-mode double-invoke (mount -> cleanup -> mount) can
      // leave an earlier effect run's listener attached to the same yDoc
      // alongside the real one. Both then fire for every local edit, racing
      // to assign `sequenceNumber` server-side (TaskContentServiceImpl's
      // count-based numbering isn't safe against concurrent duplicate
      // sends), which corrupts the operation order every other client
      // replays — turning a later Yjs struct's `origin` into a reference
      // that was never actually broadcast, permanently orphaning it.
      const updateHandler = (update: Uint8Array, origin: unknown) => {
        if (origin === "remote") return;
        if (!client.connected) {
          pendingUpdates.push(update);
          savePending(taskId!, pendingUpdates);
          return;
        }
        sendUpdate(client, update);
      };
      yDoc.on("update", updateHandler);
      cleanupUpdateHandler = () => yDoc.off("update", updateHandler);
    }

    function maybeReportSnapshot(force = false) {
      const pending = operationsSinceSnapshotRef.current;
      if (pending === 0 || (!force && pending < SNAPSHOT_THRESHOLD)) return;
      operationsSinceSnapshotRef.current = 0;
      const state = toBase64(Y.encodeStateAsUpdate(yDoc));
      api
        .post(
          `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content/snapshot`,
          {
            yjsState: state,
            atSequenceNumber: sequenceRef.current,
          },
        )
        .then(() => setSnapshotCount((c) => c + 1))
        .catch(() => {
          // Best-effort — another client's report, or the next threshold
          // crossing, will eventually capture a snapshot.
        });
    }

    init().catch(() => {
      if (!disposed) setLoadError(true);
    });
    return () => {
      disposed = true;
      if (idleTimer) clearTimeout(idleTimer);
      maybeReportSnapshot(true); // best-effort flush so the last edits become a version
      cleanupUpdateHandler?.();
      cleanupAwarenessHandler?.();
      cleanupAwarenessChangeHandler?.();
      awareness.destroy(); // also broadcasts this client's removal, if still connected
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [workspaceId, taskId, yDoc, awareness, loadAttempt]);

  function retryLoad() {
    setLoadError(false);
    setLoadAttempt((attempt) => attempt + 1);
  }
  function retryConnection() {
    clientRef.current?.activate();
  }
  /** Called by CanvasTextEditor on every caret/selection change — merges into the existing local state (userId/name/color) rather than replacing it. */
  function updateLocalCursor(
    caretIndex: number,
    selection: { anchor: number; focus: number } | null,
  ) {
    const current = awareness.getLocalState();
    if (!current) return;
    awareness.setLocalState({ ...current, caretIndex, selection });
  }
  return {
    yDoc,
    isReady,
    isConnected,
    snapshotCount,
    loadError,
    retryLoad,
    connectionError,
    retryConnection,
    awareness,
    peers,
    updateLocalCursor,
  };
}

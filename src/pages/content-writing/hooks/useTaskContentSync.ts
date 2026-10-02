import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import * as Y from "yjs";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

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
 */

const SNAPSHOT_THRESHOLD = 200;
const WS_BASE_URL = (
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8081"
).replace(/^http/, "ws");

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

interface TaskContentResponse {
  snapshot: string | null;
  operationsSinceSnapshot: string[];
  sequenceNumber: number;
}

export function useTaskContentSync(workspaceId: string, taskId: string | null) {
  const yDoc = useMemo(() => new Y.Doc(), [taskId]);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const sequenceRef = useRef(0);
  const operationsSinceSnapshotRef = useRef(0);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!taskId) return;
    let disposed = false;
    let cleanupUpdateHandler: (() => void) | null = null;

    async function init() {
      const { data } = await api.get<{ data: TaskContentResponse }>(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content`,
      );
      if (disposed) return;
      const content = data.data;
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
      const pendingUpdates: Uint8Array[] = [];

      const sendUpdate = (client: Client, update: Uint8Array) => {
        client.publish({
          destination: `/app/tasks/${taskId}/content`,
          body: JSON.stringify({ update: toBase64(update) }),
        });
      };

      const token = useAuthStore.getState().accessToken;
      const client = new Client({
        brokerURL: `${WS_BASE_URL}/ws/tasks?token=${encodeURIComponent(token ?? "")}`,
        reconnectDelay: 3000,
        onConnect: () => {
          setIsConnected(true);
          client.subscribe(`/topic/tasks/${taskId}/content`, (message) => {
            const body = JSON.parse(message.body) as {
              update: string;
              sequenceNumber: number;
            };
            Y.applyUpdate(yDoc, fromBase64(body.update), "remote");
            sequenceRef.current = body.sequenceNumber;
            operationsSinceSnapshotRef.current += 1;
            maybeReportSnapshot();
          });
          while (pendingUpdates.length > 0) {
            sendUpdate(client, pendingUpdates.shift()!);
          }
        },
        onDisconnect: () => setIsConnected(false),
        onWebSocketClose: () => setIsConnected(false),
      });
      client.activate();
      clientRef.current = client;

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
          return;
        }
        sendUpdate(client, update);
      };
      yDoc.on("update", updateHandler);
      cleanupUpdateHandler = () => yDoc.off("update", updateHandler);
    }

    function maybeReportSnapshot() {
      if (operationsSinceSnapshotRef.current < SNAPSHOT_THRESHOLD) return;
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
        .catch(() => {
          // Best-effort — another client's report, or the next threshold
          // crossing, will eventually capture a snapshot.
        });
    }

    init();
    return () => {
      disposed = true;
      cleanupUpdateHandler?.();
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [workspaceId, taskId, yDoc]);

  return { yDoc, isReady, isConnected };
}

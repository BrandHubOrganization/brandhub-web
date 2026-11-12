import {
  VIDEO_SPACE_PROTOCOL_VERSION,
  getVideoSpaceProjectBase,
  isVideoSpaceRequest,
  type VideoSpaceContext,
  type VideoSpaceRequest,
  type VideoSpaceResponse,
  type VideoSpaceCommand,
  type VideoSpaceCommandResult,
} from "../../../../shared/video-space-protocol.ts";
import { initializeStorageScope } from "./storage-scope.ts";

let context: VideoSpaceContext | undefined;
const listeners = new Set<() => void>();
const pending = new Map<
  string,
  {
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
    cleanup: () => void;
  }
>();
let flushHandler: (() => Promise<void>) | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContext(value: unknown): value is VideoSpaceContext {
  return (
    isRecord(value) &&
    value.type === "brandhub-video-space:context" &&
    value.version === VIDEO_SPACE_PROTOCOL_VERSION &&
    [value.sessionId, value.userId, value.workspaceId].every(
      (id) => typeof id === "string" && id.length > 0 && id.length <= 128,
    ) &&
    (value.locale === "vi" || value.locale === "en") &&
    (value.theme === "light" || value.theme === "dark") &&
    (value.sourceJobId === undefined ||
      (typeof value.sourceJobId === "string" &&
        /^[a-z0-9_-]{1,128}$/i.test(value.sourceJobId))) &&
    (value.sourceProductionId === undefined ||
      (typeof value.sourceProductionId === "string" &&
        /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(
          value.sourceProductionId,
        ))) &&
    !(value.sourceJobId && value.sourceProductionId) &&
    (value.projectId === undefined ||
      (typeof value.projectId === "string" &&
        /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value.projectId)))
  );
}

export function getHostContext(): VideoSpaceContext {
  if (!context) throw new Error("BrandHub context is not ready");
  return context;
}

export function subscribeHostContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setFlushHandler(handler: () => Promise<void>): void {
  flushHandler = handler;
}

async function runCommand(command: VideoSpaceCommand) {
  const result: VideoSpaceCommandResult = {
    type: "brandhub-video-space:command-result",
    version: VIDEO_SPACE_PROTOCOL_VERSION,
    sessionId: command.sessionId,
    requestId: command.requestId,
    success: false,
  };
  try {
    // A renderer failure before registration cannot have created a draft to flush.
    if (flushHandler) await flushHandler();
    result.success = true;
  } catch (error) {
    result.error =
      error instanceof Error ? error.message : "Could not save the local draft";
  }
  window.parent.postMessage(result, window.location.origin);
}

export function connectHost(): Promise<VideoSpaceContext> {
  return new Promise((resolve, reject) => {
    if (window.parent === window) {
      reject(new Error("Open Video Space from your BrandHub workspace."));
      return;
    }
    const ready = () =>
      window.parent.postMessage(
        {
          type: "brandhub-video-space:ready",
          version: VIDEO_SPACE_PROTOCOL_VERSION,
        },
        window.location.origin,
      );
    const retry = window.setInterval(ready, 500);
    const timeout = window.setTimeout(() => {
      window.clearInterval(retry);
      reject(
        new Error(
          "BrandHub did not provide an editor session. Return and retry.",
        ),
      );
    }, 20_000);
    window.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      )
        return;
      const message = event.data;
      if (isContext(message)) {
        if (
          context &&
          (message.sessionId !== context.sessionId ||
            message.userId !== context.userId ||
            message.workspaceId !== context.workspaceId ||
            message.sourceJobId !== context.sourceJobId ||
            message.sourceProductionId !== context.sourceProductionId)
        )
          return;
        initializeStorageScope(message.userId, message.workspaceId);
        context = message;
        document.documentElement.lang = message.locale;
        window.clearInterval(retry);
        window.clearTimeout(timeout);
        listeners.forEach((listener) => listener());
        resolve(message);
        return;
      }
      if (
        !context ||
        !isRecord(message) ||
        message.version !== VIDEO_SPACE_PROTOCOL_VERSION ||
        message.sessionId !== context.sessionId ||
        typeof message.requestId !== "string"
      )
        return;
      if (
        message.type === "brandhub-video-space:command" &&
        message.command === "flush"
      ) {
        void runCommand(message as unknown as VideoSpaceCommand);
      } else if (
        message.type === "brandhub-video-space:response" &&
        Number.isInteger(message.status) &&
        Number(message.status) >= 200 &&
        Number(message.status) <= 599
      ) {
        const response = message as unknown as VideoSpaceResponse;
        const request = pending.get(response.requestId);
        if (!request) return;
        pending.delete(response.requestId);
        request.cleanup();
        const body =
          response.status === 204
            ? null
            : response.body instanceof Blob
              ? response.body
              : JSON.stringify(response.body);
        request.resolve(
          new Response(body, {
            status: response.status,
            headers: {
              "Content-Type":
                response.body instanceof Blob
                  ? response.body.type
                  : "application/json",
            },
          }),
        );
      }
    });
    window.addEventListener(
      "pagehide",
      () => {
        window.clearInterval(retry);
        window.clearTimeout(timeout);
        for (const request of pending.values()) {
          request.cleanup();
          request.reject(new Error("The editor session closed"));
        }
        pending.clear();
      },
      { once: true },
    );
    ready();
  });
}

export function getProjectApiBase(): string {
  return getVideoSpaceProjectBase(getHostContext());
}

export function hostFetch(
  path: string,
  options: RequestInit & { responseType?: "json" | "blob" } = {},
): Promise<Response> {
  const current = getHostContext();
  const method = options.method ?? "GET";
  if (method !== "GET" && method !== "PUT" && method !== "POST")
    return Promise.reject(new Error("Unsupported editor request"));
  const message: VideoSpaceRequest = {
    type: "brandhub-video-space:request",
    version: VIDEO_SPACE_PROTOCOL_VERSION,
    sessionId: current.sessionId,
    requestId: crypto.randomUUID(),
    method,
    path,
    responseType: options.responseType ?? "json",
  };
  if (options.body instanceof FormData) {
    const file = options.body.get("file");
    const metadata = options.body.get("metadata");
    if (!(file instanceof File) || typeof metadata !== "string")
      return Promise.reject(new Error("Invalid media upload"));
    message.body = { file, metadata };
  } else if (typeof options.body === "string") message.body = options.body;
  else if (options.body != null)
    return Promise.reject(new Error("Unsupported editor request body"));
  if (!isVideoSpaceRequest(message, current))
    return Promise.reject(new Error("Request is outside this editor session"));
  return new Promise((resolve, reject) => {
    const abort = () => {
      pending.delete(message.requestId);
      cleanup();
      reject(new DOMException("The request was cancelled", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      pending.delete(message.requestId);
      cleanup();
      reject(
        new Error(
          "The editor request timed out. Your local draft is retained.",
        ),
      );
    }, 10 * 60_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    };
    if (options.signal?.aborted) {
      abort();
      return;
    }
    options.signal?.addEventListener("abort", abort, { once: true });
    pending.set(message.requestId, { resolve, reject, cleanup });
    window.parent.postMessage(message, window.location.origin);
  });
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  VIDEO_SPACE_PROTOCOL_VERSION,
  isVideoSpaceReady,
  isVideoSpaceRequest,
  isVideoSpaceCommandResult,
  getVideoSpaceProjectBase,
  type VideoSpaceContext,
  type VideoSpaceRequest,
  type VideoSpaceResponse,
  type VideoSpaceCommand,
} from "@video-space/protocol";
import { executeVideoSpaceRequest } from "@/pages/video-space/services/videoSpaceService";
import { toVideoSpaceFailure } from "@/pages/video-space/services/videoSpaceErrors";

interface FlushWaiter {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export function useVideoSpaceBridge(context: VideoSpaceContext) {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentContext = useRef(context);
  const translate = useRef(t);
  const connected = useRef(false);
  const waiters = useRef(new Map<string, FlushWaiter>());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentContext.current = {
      ...context,
      projectId: currentContext.current.projectId,
    };
    translate.current = t;
    if (connected.current)
      iframeRef.current?.contentWindow?.postMessage(
        currentContext.current,
        window.location.origin,
      );
  }, [context, t]);

  useEffect(() => {
    let alive = true;
    const operations = new Map<string, AbortController>();
    const post = (message: VideoSpaceContext | VideoSpaceResponse) => {
      if (alive)
        iframeRef.current?.contentWindow?.postMessage(
          message,
          window.location.origin,
        );
    };
    const timer = setTimeout(
      () => setError(translate.current("videoSpace.loadError")),
      30_000,
    );

    const perform = async (request: VideoSpaceRequest) => {
      if (operations.has(request.requestId) || operations.size >= 16) return;
      const controller = new AbortController();
      operations.set(request.requestId, controller);
      try {
        const result = await executeVideoSpaceRequest(
          request,
          controller.signal,
        );
        const projectBase = `${getVideoSpaceProjectBase(currentContext.current)}/`;
        const projectId = request.path.slice(projectBase.length);
        if (
          !controller.signal.aborted &&
          result.status >= 200 &&
          result.status < 300 &&
          (request.method === "GET" || request.method === "PUT") &&
          request.path.startsWith(projectBase) &&
          /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(projectId)
        ) {
          currentContext.current = { ...currentContext.current, projectId };
          post(currentContext.current);
        }
        if (!controller.signal.aborted)
          post({
            ...result,
            type: "brandhub-video-space:response",
            version: VIDEO_SPACE_PROTOCOL_VERSION,
            sessionId: request.sessionId,
            requestId: request.requestId,
          });
      } catch (failure) {
        if (!alive || controller.signal.aborted) return;
        const result = await toVideoSpaceFailure(failure, request, (key) =>
          translate.current(key),
        );
        post({
          ...result,
          type: "brandhub-video-space:response",
          version: VIDEO_SPACE_PROTOCOL_VERSION,
          sessionId: request.sessionId,
          requestId: request.requestId,
        });
      } finally {
        operations.delete(request.requestId);
      }
    };

    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      )
        return;
      if (isVideoSpaceReady(event.data)) {
        connected.current = true;
        clearTimeout(timer);
        setReady(true);
        setError(null);
        post(currentContext.current);
      } else if (
        isVideoSpaceCommandResult(event.data, currentContext.current)
      ) {
        const waiter = waiters.current.get(event.data.requestId);
        if (!waiter) return;
        clearTimeout(waiter.timer);
        waiters.current.delete(event.data.requestId);
        if (event.data.success) waiter.resolve();
        else
          waiter.reject(
            new Error(translate.current("videoSpace.draftSaveFailed")),
          );
      } else if (isVideoSpaceRequest(event.data, currentContext.current)) {
        void perform(event.data);
      }
    };

    const pendingFlushes = waiters.current;
    window.addEventListener("message", receive);
    return () => {
      alive = false;
      connected.current = false;
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      operations.forEach((controller) => controller.abort());
      pendingFlushes.forEach((waiter) => {
        clearTimeout(waiter.timer);
        waiter.reject(new Error("VIDEO_SPACE_CLOSED"));
      });
      pendingFlushes.clear();
    };
  }, [context.sessionId]);

  const flushDraft = useCallback((): Promise<void> => {
    if (!connected.current) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const timer = setTimeout(() => {
        waiters.current.delete(requestId);
        reject(new Error(translate.current("videoSpace.draftSaveFailed")));
      }, 10_000);
      waiters.current.set(requestId, { resolve, reject, timer });
      const message: VideoSpaceCommand = {
        type: "brandhub-video-space:command",
        version: VIDEO_SPACE_PROTOCOL_VERSION,
        sessionId: currentContext.current.sessionId,
        requestId,
        command: "flush",
      };
      iframeRef.current?.contentWindow?.postMessage(
        message,
        window.location.origin,
      );
    });
  }, []);

  return { iframeRef, ready, error, flushDraft };
}

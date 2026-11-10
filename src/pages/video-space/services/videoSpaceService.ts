import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import { postAiWithCredit } from "@/services/aiCreditRequest";
import { parseVideoEditPlanBody } from "@video-space/protocol";
import type {
  VideoSpaceRequest,
  VideoSpaceUploadBody,
} from "@video-space/protocol";
import type {
  VideoSpaceResult,
  VideoUploadSession,
} from "@/pages/video-space/types/videoSpace";

export class VideoSpaceTransferError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function fileHash(file: File): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function uploadBody(request: VideoSpaceRequest): VideoSpaceUploadBody {
  const body = request.body;
  if (!body || typeof body === "string" || !(body.file instanceof File)) {
    throw new VideoSpaceTransferError(422, "VIDEO_MEDIA_UPLOAD_INVALID");
  }
  return body;
}

async function openUploadSession(
  request: VideoSpaceRequest,
  signal: AbortSignal,
): Promise<VideoUploadSession> {
  const { file, metadata } = uploadBody(request);
  const response = await api.post(
    `${request.path}/upload-session`,
    {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      sha256: await fileHash(file),
      metadata: JSON.parse(metadata),
    },
    { signal },
  );
  return requireApiData<VideoUploadSession>(response.data);
}

async function putProviderFile(
  session: VideoUploadSession,
  file: File,
  signal: AbortSignal,
): Promise<void> {
  const url = new URL(session.uploadUrl!);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new VideoSpaceTransferError(502, "VIDEO_MEDIA_UPLOAD_INVALID");
  }
  const response = await fetch(session.uploadUrl!, {
    method: "PUT",
    body: file,
    headers: session.headers,
    credentials: "omit",
    signal,
  });
  if (!response.ok)
    throw new VideoSpaceTransferError(502, "VIDEO_MEDIA_UPLOAD_FAILED");
}

async function uploadOriginal(
  request: VideoSpaceRequest,
  signal: AbortSignal,
): Promise<VideoSpaceResult> {
  const session = await openUploadSession(request, signal);
  if (session.uploadUrl) {
    try {
      await putProviderFile(session, uploadBody(request).file, signal);
    } catch (uploadError) {
      try {
        await api.post(
          `${request.path}/upload-abort`,
          { sessionId: session.sessionId },
          { signal: AbortSignal.timeout(10_000) },
        );
      } catch (abortError) {
        throw new AggregateError(
          [uploadError, abortError],
          "VIDEO_MEDIA_UPLOAD_FAILED",
          { cause: abortError },
        );
      }
      throw uploadError;
    }
  }
  // Confirmation can have copied bytes before a timeout; its recovery owns quota release.
  const response = await api.post(
    `${request.path}/upload-complete`,
    { sessionId: session.sessionId },
    { signal },
  );
  return { status: response.status, body: response.data };
}

export async function executeVideoSpaceRequest(
  request: VideoSpaceRequest,
  signal: AbortSignal,
): Promise<VideoSpaceResult> {
  if (request.method === "POST") {
    const match = request.path.match(
      /^\/api\/v1\/workspaces\/([a-f0-9-]{36})\/video-projects\/[a-f0-9-]{36}\/(?:edit-plans|auto-edits)$/i,
    );
    const body = parseVideoEditPlanBody(request.body);
    if (!match || !body || request.responseType !== "json")
      throw new VideoSpaceTransferError(422, "VIDEO_EDIT_PLAN_INVALID");
    const response = await postAiWithCredit(request.path, body, {
      signal,
      workspaceId: match[1],
    });
    return { status: response.status, body: response.data };
  }
  if (request.method === "PUT" && request.path.includes("/media/"))
    return uploadOriginal(request, signal);
  const response = await api.request({
    method: request.method,
    url: request.path,
    data: request.body,
    responseType: request.responseType,
    signal,
  });
  return { status: response.status, body: response.data };
}

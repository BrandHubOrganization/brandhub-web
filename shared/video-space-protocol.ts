export const VIDEO_SPACE_PROTOCOL_VERSION = 1 as const;
export const VIDEO_SPACE_MAX_FILE_BYTES = 128 * 1024 * 1024;
export const VIDEO_SPACE_MAX_METADATA_CHARS = 512 * 1024;

export interface VideoSpaceReady {
  type: "brandhub-video-space:ready";
  version: 1;
}

export interface VideoSpaceContext {
  type: "brandhub-video-space:context";
  version: 1;
  sessionId: string;
  workspaceId: string;
  userId: string;
  locale: "vi" | "en";
  theme: "light" | "dark";
  sourceJobId?: string;
  sourceProductionId?: string;
  projectId?: string;
}

export interface VideoSpaceUploadBody {
  file: File;
  metadata: string;
}

export interface VideoSpaceRequest {
  type: "brandhub-video-space:request";
  version: 1;
  sessionId: string;
  requestId: string;
  method: "GET" | "PUT" | "POST";
  path: string;
  responseType: "json" | "blob";
  body?: string | VideoSpaceUploadBody;
}

export interface VideoSpaceResponse {
  type: "brandhub-video-space:response";
  version: 1;
  sessionId: string;
  requestId: string;
  status: number;
  body: unknown;
}

export interface VideoSpaceCommand {
  type: "brandhub-video-space:command";
  version: 1;
  sessionId: string;
  requestId: string;
  command: "flush";
}

export interface VideoSpaceCommandResult {
  type: "brandhub-video-space:command-result";
  version: 1;
  sessionId: string;
  requestId: string;
  success: boolean;
  error?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUEST_ID_PATTERN = /^[a-z0-9_-]{1,80}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSessionMessage(
  value: unknown,
  context: VideoSpaceContext,
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    value.version === VIDEO_SPACE_PROTOCOL_VERSION &&
    value.sessionId === context.sessionId &&
    typeof value.requestId === "string" &&
    REQUEST_ID_PATTERN.test(value.requestId)
  );
}

export function getVideoSpaceProjectBase(
  context: Pick<VideoSpaceContext, "workspaceId">,
): string {
  return `/api/v1/workspaces/${context.workspaceId}/video-projects`;
}

export function isVideoSpaceReady(value: unknown): value is VideoSpaceReady {
  return (
    isRecord(value) &&
    value.type === "brandhub-video-space:ready" &&
    value.version === VIDEO_SPACE_PROTOCOL_VERSION
  );
}

function hasValidListQuery(query: string): boolean {
  if (!query) return true;
  const entries = [...new URLSearchParams(query).entries()];
  return (
    entries.length <= 2 &&
    new Set(entries.map(([key]) => key)).size === entries.length &&
    entries.every(
      ([key, value]) =>
        /^\d{1,7}$/.test(value) &&
        ((key === "page" && Number(value) <= 1_000_000) ||
          (key === "size" && Number(value) >= 1 && Number(value) <= 50)),
    )
  );
}

function hasValidUpload(value: unknown): value is VideoSpaceUploadBody {
  return (
    isRecord(value) &&
    value.file instanceof File &&
    value.file.size > 0 &&
    value.file.size <= VIDEO_SPACE_MAX_FILE_BYTES &&
    typeof value.metadata === "string" &&
    value.metadata.length <= VIDEO_SPACE_MAX_METADATA_CHARS
  );
}

export function parseVideoEditPlanBody(
  value: unknown,
): { expected_revision: number; instruction: string; render_mp4?: boolean } | null {
  if (typeof value !== "string" || value.length > 24_000) return null;
  try {
    const body: unknown = JSON.parse(value);
    if (
      !isRecord(body) ||
      Object.keys(body).some(
        (key) => !["expected_revision", "instruction", "render_mp4"].includes(key),
      ) ||
      (body.render_mp4 !== undefined && typeof body.render_mp4 !== "boolean") ||
      !Number.isSafeInteger(body.expected_revision) ||
      Number(body.expected_revision) < 1 ||
      typeof body.instruction !== "string" ||
      !body.instruction.trim() ||
      body.instruction.length > 4000
    )
      return null;
    return {
      expected_revision: Number(body.expected_revision),
      instruction: body.instruction,
      // Only the non-default choice is forwarded, so old clients keep the same replay identity.
      ...(body.render_mp4 === false && { render_mp4: false }),
    };
  } catch {
    return null;
  }
}

export function isVideoSpaceRequest(
  value: unknown,
  context: VideoSpaceContext,
): value is VideoSpaceRequest {
  if (
    !UUID_PATTERN.test(context.workspaceId) ||
    !UUID_PATTERN.test(context.userId)
  )
    return false;
  if (
    !isSessionMessage(value, context) ||
    value.type !== "brandhub-video-space:request"
  )
    return false;
  if (
    typeof value.path !== "string" ||
    value.path.length > 1024 ||
    /[%\\#]/.test(value.path)
  )
    return false;
  if (value.responseType !== "json" && value.responseType !== "blob")
    return false;
  if (
    value.method !== "GET" &&
    value.method !== "PUT" &&
    value.method !== "POST"
  )
    return false;
  if (value.method === "GET" && value.body !== undefined) return false;
  const [path, query, extraQuery] = value.path.split("?");
  if (extraQuery !== undefined) return false;
  const base = getVideoSpaceProjectBase(context);
  if (path === base)
    return (
      value.method === "GET" &&
      value.responseType === "json" &&
      hasValidListQuery(query ?? "")
    );
  if (query !== undefined) return false;
  if (
    context.sourceProductionId &&
    UUID_PATTERN.test(context.sourceProductionId)
  ) {
    const production = `/api/v1/workspaces/${context.workspaceId}/ai/video-productions/${context.sourceProductionId}`;
    if (path === `${production}/editing-bundle`)
      return value.method === "GET" && value.responseType === "json";
    if (path.startsWith(`${production}/scenes/`)) {
      const parts = path.slice(`${production}/scenes/`.length).split("/");
      return (
        parts.length === 2 &&
        UUID_PATTERN.test(parts[0]) &&
        parts[1] === "content" &&
        value.method === "GET" &&
        value.responseType === "blob"
      );
    }
  }
  const source = `/api/v1/workspaces/${context.workspaceId}/ai/videos/${context.sourceJobId}/content`;
  if (
    context.sourceJobId &&
    /^[a-z0-9_-]{1,128}$/i.test(context.sourceJobId) &&
    path === source
  ) {
    return value.method === "GET" && value.responseType === "blob";
  }
  if (!path.startsWith(`${base}/`)) return false;
  const parts = path.slice(base.length + 1).split("/");
  if (!UUID_PATTERN.test(parts[0])) return false;
  if (parts[1] === "auto-edit-memory") {
    // Owner-scoped remembered preferences: read, or replace with a subset (Business only allows deletion).
    return (
      parts.length === 2 &&
      parts[0] === context.projectId &&
      value.responseType === "json" &&
      (value.method === "GET" ||
        (value.method === "PUT" &&
          typeof value.body === "string" &&
          value.body.length <= 8_000))
    );
  }
  if (parts[1] === "auto-edits") {
    if (parts[0] !== context.projectId) return false;
    if (value.method === "POST")
      return (
        parts.length === 2 &&
        value.responseType === "json" &&
        parseVideoEditPlanBody(value.body) !== null
      );
    if (value.method !== "GET") return false;
    if (parts.length === 2) return value.responseType === "json";
    if (!UUID_PATTERN.test(parts[2] ?? "")) return false;
    return parts.length === 3
      ? value.responseType === "json"
      : parts.length === 4 &&
          parts[3] === "content" &&
          value.responseType === "blob";
  }
  if (value.method === "POST")
    return (
      parts.length === 2 &&
      parts[1] === "edit-plans" &&
      parts[0] === context.projectId &&
      value.responseType === "json" &&
      parseVideoEditPlanBody(value.body) !== null
    );
  if (parts.length === 1 && value.responseType === "json") {
    return (
      value.method === "GET" ||
      (value.method === "PUT" &&
        typeof value.body === "string" &&
        value.body.length <= 4 * 1024 * 1024)
    );
  }
  if (
    parts.length !== 3 ||
    parts[1] !== "media" ||
    !UUID_PATTERN.test(parts[2])
  )
    return false;
  return value.method === "GET"
    ? value.responseType === "blob"
    : value.responseType === "json" && hasValidUpload(value.body);
}

export function isVideoSpaceCommandResult(
  value: unknown,
  context: VideoSpaceContext,
): value is VideoSpaceCommandResult {
  return (
    isSessionMessage(value, context) &&
    value.type === "brandhub-video-space:command-result" &&
    typeof value.success === "boolean" &&
    (value.error === undefined || typeof value.error === "string")
  );
}

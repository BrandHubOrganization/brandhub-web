import axios from "axios";
import { aiCreditErrorMessage } from "@/services/aiCreditRequest";
import { VideoSpaceTransferError } from "@/pages/video-space/services/videoSpaceService";
import type { VideoSpaceRequest } from "@video-space/protocol";
import type { VideoSpaceResult } from "@/pages/video-space/types/videoSpace";

function errorKey(status: number, request: VideoSpaceRequest): string {
  if (status === 401) return "sessionExpired";
  if (status === 403) return "requestDenied";
  if (request.path.includes("/ai/videos/")) return "sourceUnavailable";
  if (status === 404) return "projectUnavailable";
  if (status === 409) return "conflict";
  if (status === 413) return "fileTooLarge";
  if (status === 415) return "invalidMedia";
  if (status === 422) return "snapshotInvalid";
  if (request.path.includes("/media/")) return "uploadFailed";
  return "requestFailed";
}

function responseCode(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || !("error" in value))
    return undefined;
  const error = value.error;
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : undefined;
}

export async function toVideoSpaceFailure(
  error: unknown,
  request: VideoSpaceRequest,
  translate: (key: string) => string,
): Promise<VideoSpaceResult> {
  let status = error instanceof VideoSpaceTransferError ? error.status : 502;
  let code =
    error instanceof VideoSpaceTransferError
      ? error.code
      : "VIDEO_SPACE_REQUEST_FAILED";
  if (axios.isAxiosError(error) && error.response) {
    status = error.response.status;
    let payload: unknown = error.response.data;
    if (payload instanceof Blob) {
      try {
        payload = JSON.parse(await payload.text());
      } catch {
        payload = null;
      }
    }
    code = responseCode(payload) ?? code;
  }
  const key = /STORAGE.*QUOTA|QUOTA.*EXCEEDED/.test(code)
    ? "quotaExceeded"
    : errorKey(status, request);
  const message =
    (request.method === "POST" ? aiCreditErrorMessage(error) : null) ??
    translate(`videoSpace.${key}`);
  return {
    status,
    body: {
      success: false,
      message,
      error: { code, message },
    },
  };
}

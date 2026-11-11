import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/services/api";
import { executeVideoSpaceRequest } from "@/pages/video-space/services/videoSpaceService";
import { toVideoSpaceFailure } from "@/pages/video-space/services/videoSpaceErrors";
import type { VideoSpaceRequest } from "../../shared/video-space-protocol";
import { postAiWithCredit } from "@/services/aiCreditRequest";

vi.mock("@/services/api", () => ({ api: { post: vi.fn(), request: vi.fn() } }));
vi.mock("@/services/aiCreditRequest", () => ({
  postAiWithCredit: vi.fn(),
  aiCreditErrorMessage: vi.fn(),
}));
const path =
  "/api/v1/workspaces/11111111-1111-4111-8111-111111111111/video-projects/22222222-2222-4222-8222-222222222222/media/33333333-3333-4333-8333-333333333333";
const upload: VideoSpaceRequest = {
  type: "brandhub-video-space:request",
  version: 1,
  sessionId: "session",
  requestId: "request",
  method: "PUT",
  path,
  responseType: "json",
  body: {
    file: new File(["fixture"], "clip.mp4", { type: "video/mp4" }),
    metadata: JSON.stringify({ duration: 2 }),
  },
};
const envelope = (data: unknown) => ({
  status: 200,
  data: { success: true, data },
});
const session = {
  sessionId: "upload-1",
  uploadUrl: "https://storage.example.test/signed",
  headers: { "Content-Type": "video/mp4" },
  expiresAt: "2026-11-01T00:00:00Z",
};
const descriptor = {
  id: "asset",
  name: "original.mp4",
  mime_type: "video/mp4",
  sha256: "hash",
  metadata: {},
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
  );
});
describe("Video Space uploads through existing auth and provider sessions", () => {
  it("admits automatic rendering through the existing credit wrapper with HTTP202", async () => {
    vi.mocked(postAiWithCredit).mockResolvedValue({
      status: 202,
      data: { success: true, data: { id: "job", status: "QUEUED" } },
    } as never);
    const endpoint = path.slice(0, path.indexOf("/media/")) + "/auto-edits";
    const body = { expected_revision: 2, instruction: "Edit this video" };
    const result = await executeVideoSpaceRequest(
      { ...upload, method: "POST", path: endpoint, body: JSON.stringify(body) },
      new AbortController().signal,
    );
    expect(result.status).toBe(202);
    expect(postAiWithCredit).toHaveBeenCalledWith(
      endpoint,
      body,
      expect.objectContaining({
        workspaceId: "11111111-1111-4111-8111-111111111111",
      }),
    );
  });
  it("uses the host credit wrapper and selected route workspace for edit plans", async () => {
    vi.mocked(postAiWithCredit).mockResolvedValue(
      envelope({ summary: "Done", actions: [], base_revision: 2 }) as never,
    );
    const signal = new AbortController().signal;
    const endpoint = path.slice(0, path.indexOf("/media/")) + "/edit-plans";
    const body = { expected_revision: 2, instruction: "Rename this project" };
    await executeVideoSpaceRequest(
      { ...upload, method: "POST", path: endpoint, body: JSON.stringify(body) },
      signal,
    );
    expect(postAiWithCredit).toHaveBeenCalledWith(endpoint, body, {
      signal,
      workspaceId: "11111111-1111-4111-8111-111111111111",
    });
    expect(api.request).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects arbitrary POST bodies and URLs before reaching the host API", async () => {
    for (const request of [
      { ...upload, method: "POST" as const, body: "{}" },
      {
        ...upload,
        method: "POST" as const,
        path: "https://external.test/edit-plans",
        body: JSON.stringify({ expected_revision: 1, instruction: "Edit" }),
      },
    ])
      await expect(
        executeVideoSpaceRequest(request, new AbortController().signal),
      ).rejects.toThrow("VIDEO_EDIT_PLAN_INVALID");
    expect(postAiWithCredit).not.toHaveBeenCalled();
  });
  it("returns translated API errors without forwarding axios credentials/debug data", async () => {
    const failure = await toVideoSpaceFailure(
      {
        isAxiosError: true,
        response: {
          status: 403,
          data: {
            error: { code: "FORBIDDEN", message: "server detail" },
            debug: { authorization: "private-token" },
          },
        },
      },
      upload,
      (key) => key,
    );
    expect(failure).toEqual({
      status: 403,
      body: {
        success: false,
        message: "videoSpace.requestDenied",
        error: { code: "FORBIDDEN", message: "videoSpace.requestDenied" },
      },
    });
    expect(JSON.stringify(failure)).not.toContain("private-token");
  });
  it("sends only JSON to Business and bytes to the issued provider without credentials", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce(envelope(session))
      .mockResolvedValueOnce(envelope(descriptor));
    const result = await executeVideoSpaceRequest(
      upload,
      new AbortController().signal,
    );
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      `${path}/upload-session`,
      expect.objectContaining({
        fileName: "clip.mp4",
        contentType: "video/mp4",
        sizeBytes: 7,
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        metadata: { duration: 2 },
      }),
      expect.anything(),
    );
    expect(fetch).toHaveBeenCalledWith(
      session.uploadUrl,
      expect.objectContaining({
        method: "PUT",
        credentials: "omit",
        body: expect.any(File),
        headers: session.headers,
      }),
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      `${path}/upload-complete`,
      { sessionId: "upload-1" },
      expect.anything(),
    );
    expect(result.body).toEqual({ success: true, data: descriptor });
  });
  it("does not reupload an immutable asset or replace its original metadata", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce(envelope({ ...session, uploadUrl: null }))
      .mockResolvedValueOnce(envelope(descriptor));
    const result = await executeVideoSpaceRequest(
      upload,
      new AbortController().signal,
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(result.body).toEqual({ success: true, data: descriptor });
  });
  it("aborts a known provider failure before confirmation", async () => {
    vi.mocked(api.post).mockResolvedValue(envelope(session));
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));
    await expect(
      executeVideoSpaceRequest(upload, new AbortController().signal),
    ).rejects.toThrow();
    expect(api.post).toHaveBeenLastCalledWith(
      `${path}/upload-abort`,
      { sessionId: "upload-1" },
      expect.anything(),
    );
    expect(
      vi
        .mocked(api.post)
        .mock.calls.some(([url]) => String(url).endsWith("upload-complete")),
    ).toBe(false);
  });
  it("leaves an ambiguous confirmation for server recovery rather than releasing quota", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce(envelope(session))
      .mockRejectedValueOnce(new Error("network timeout"));
    await expect(
      executeVideoSpaceRequest(upload, new AbortController().signal),
    ).rejects.toThrow("network timeout");
    expect(
      vi
        .mocked(api.post)
        .mock.calls.some(([url]) => String(url).endsWith("upload-abort")),
    ).toBe(false);
  });
});

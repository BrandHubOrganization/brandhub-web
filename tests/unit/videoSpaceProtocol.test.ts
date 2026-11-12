import { describe, expect, it } from "vitest";
import {
  isVideoSpaceReady,
  isVideoSpaceRequest,
  isVideoSpaceCommandResult,
  parseVideoEditPlanBody,
  type VideoSpaceContext,
} from "../../shared/video-space-protocol";

const workspace = "11111111-1111-4111-8111-111111111111";
const project = "22222222-2222-4222-8222-222222222222";
const asset = "33333333-3333-4333-8333-333333333333";
const context: VideoSpaceContext = {
  type: "brandhub-video-space:context",
  version: 1,
  sessionId: "frame-session",
  workspaceId: workspace,
  userId: "44444444-4444-4444-8444-444444444444",
  locale: "vi",
  theme: "dark",
  sourceJobId: "owned-job",
};
const request = (path: string) => ({
  type: "brandhub-video-space:request",
  version: 1,
  sessionId: context.sessionId,
  requestId: "request-1",
  method: "GET",
  path,
  responseType: "json",
});
const base = `/api/v1/workspaces/${workspace}/video-projects`;

describe("Video Space boundary", () => {
  it("scopes automatic render admission, resume and download to the selected project", () => {
    const selected = { ...context, projectId: project };
    const endpoint = `${base}/${project}/auto-edits`;
    const post = {
      ...request(endpoint),
      method: "POST",
      body: JSON.stringify({
        expected_revision: 1,
        instruction: "Edit this video",
      }),
    };
    expect(isVideoSpaceRequest(post, selected)).toBe(true);
    expect(isVideoSpaceRequest(request(endpoint), selected)).toBe(true);
    expect(isVideoSpaceRequest(request(`${endpoint}/${asset}`), selected)).toBe(
      true,
    );
    expect(
      isVideoSpaceRequest(
        { ...request(`${endpoint}/${asset}/content`), responseType: "blob" },
        selected,
      ),
    ).toBe(true);
    for (const invalid of [
      post,
      request(endpoint),
      request(`${endpoint}/${asset}`),
    ])
      expect(isVideoSpaceRequest(invalid, context)).toBe(false);
    for (const invalid of [
      {
        ...post,
        body: JSON.stringify({
          expected_revision: 1,
          instruction: "Edit",
          snapshot: {},
        }),
      },
      request(`${endpoint}?url=https://example.test`),
      request(`${endpoint}/${asset}/content`),
      { ...request(`${endpoint}/${asset}`), responseType: "blob" },
      request(`${endpoint}/${asset}/../../admin`),
    ])
      expect(isVideoSpaceRequest(invalid, selected)).toBe(false);
  });
  it("accepts the timeline-only choice and owner memory edits for the selected project only", () => {
    const selected = { ...context, projectId: project };
    const post = (body: unknown) => ({
      ...request(`${base}/${project}/auto-edits`),
      method: "POST",
      body: JSON.stringify(body),
    });
    expect(isVideoSpaceRequest(post({ expected_revision: 1, instruction: "Edit", render_mp4: false }), selected)).toBe(true);
    expect(isVideoSpaceRequest(post({ expected_revision: 1, instruction: "Edit", render_mp4: "no" }), selected)).toBe(false);
    expect(parseVideoEditPlanBody(JSON.stringify({ expected_revision: 1, instruction: "Edit", render_mp4: true }))).toEqual({
      expected_revision: 1,
      instruction: "Edit",
    });
    const memory = `${base}/${project}/auto-edit-memory`;
    const put = { ...request(memory), method: "PUT", body: JSON.stringify({ notes: [] }) };
    expect(isVideoSpaceRequest(request(memory), selected)).toBe(true);
    expect(isVideoSpaceRequest(put, selected)).toBe(true);
    expect(isVideoSpaceRequest({ ...put, body: "x".repeat(9000) }, selected)).toBe(false);
    expect(isVideoSpaceRequest({ ...put, method: "POST" }, selected)).toBe(false);
    expect(isVideoSpaceRequest(request(`${base}/${asset}/auto-edit-memory`), selected)).toBe(false);
  });
  it("permits only project operations scoped to the selected workspace", () => {
    expect(isVideoSpaceRequest(request(base), context)).toBe(true);
    expect(
      isVideoSpaceRequest(request(`${base}?page=2&size=50`), context),
    ).toBe(true);
    expect(isVideoSpaceRequest(request(`${base}/${project}`), context)).toBe(
      true,
    );
    for (const path of [
      "/api/v1/admin/users",
      base.replace(workspace, project),
      `${base}/${project}/edit-plans`,
      `${base}?size=1000`,
      `${base}?url=https://elsewhere.test`,
      `//elsewhere.test${base}`,
      `${base}/../ai/videos`,
    ]) {
      expect(isVideoSpaceRequest(request(path), context), path).toBe(false);
    }
  });
  it("rejects stale sessions, malformed messages and method/body mismatches", () => {
    expect(
      isVideoSpaceReady({ type: "brandhub-video-space:ready", version: 1 }),
    ).toBe(true);
    expect(
      isVideoSpaceReady({ type: "brandhub-video-space:ready", version: 2 }),
    ).toBe(false);
    expect(
      isVideoSpaceRequest(
        { ...request(base), sessionId: "other-session" },
        context,
      ),
    ).toBe(false);
    expect(
      isVideoSpaceRequest({ ...request(base), method: "DELETE" }, context),
    ).toBe(false);
    expect(
      isVideoSpaceRequest({ ...request(base), body: "unexpected" }, context),
    ).toBe(false);
    expect(
      isVideoSpaceRequest(
        {
          ...request(`${base}/${project}`),
          method: "PUT",
          body: JSON.stringify({ expected_revision: 0, snapshot: {} }),
        },
        context,
      ),
    ).toBe(true);
    expect(isVideoSpaceRequest(null, context)).toBe(false);
  });
  it("allows only a bounded edit-plan POST for the selected saved project", () => {
    const selected = { ...context, projectId: project };
    const plan = {
      ...request(`${base}/${project}/edit-plans`),
      method: "POST",
      body: JSON.stringify({
        expected_revision: 1,
        instruction: "Trim the clip",
      }),
    };
    expect(isVideoSpaceRequest(plan, selected)).toBe(true);
    expect(isVideoSpaceRequest(plan, context)).toBe(false);
    for (const invalid of [
      { ...plan, path: `${base}/${asset}/edit-plans` },
      { ...plan, path: `${base}/${project}/edit-plans?x=1` },
      { ...plan, path: `${base}/${project}` },
      { ...plan, responseType: "blob" },
      { ...plan, body: "invalid" },
      ...[
        { expected_revision: 1, instruction: "  " },
        { expected_revision: 1, instruction: "x".repeat(4001) },
        { expected_revision: 0, instruction: "Rename" },
        { expected_revision: 1.2, instruction: "Rename" },
        {
          expected_revision: 1,
          instruction: "Rename",
          url: "https://foreign.test",
        },
        {
          expected_revision: 1,
          instruction: "Rename",
          headers: { Authorization: "secret" },
        },
      ].map((body) => ({ ...plan, body: JSON.stringify(body) })),
    ])
      expect(isVideoSpaceRequest(invalid, selected)).toBe(false);
  });
  it("allows only the requested source job and blob media reads", () => {
    const path = `/api/v1/workspaces/${workspace}/ai/videos/owned-job/content`;
    expect(
      isVideoSpaceRequest({ ...request(path), responseType: "blob" }, context),
    ).toBe(true);
    expect(
      isVideoSpaceRequest(
        {
          ...request(path.replace("owned-job", "foreign-job")),
          responseType: "blob",
        },
        context,
      ),
    ).toBe(false);
    expect(
      isVideoSpaceRequest(
        {
          ...request(`${base}/${project}/media/${asset}`),
          responseType: "blob",
        },
        context,
      ),
    ).toBe(true);
    expect(
      isVideoSpaceRequest(
        request(`${base}/${project}/media/${asset}`),
        context,
      ),
    ).toBe(false);
    const malformed = { ...context, sourceJobId: "job/../../admin" };
    expect(
      isVideoSpaceRequest(
        {
          ...request(
            `/api/v1/workspaces/${workspace}/ai/videos/${malformed.sourceJobId}/content`,
          ),
          responseType: "blob",
        },
        malformed,
      ),
    ).toBe(false);
  });
  it("accepts bounded logical file uploads and session-bound flush results", () => {
    const upload = {
      ...request(`${base}/${project}/media/${asset}`),
      method: "PUT",
      body: {
        file: new File(["fixture"], "clip.mp4", { type: "video/mp4" }),
        metadata: "{}",
      },
    };
    expect(isVideoSpaceRequest(upload, context)).toBe(true);
    expect(
      isVideoSpaceRequest(
        { ...upload, body: { file: "not-a-file", metadata: "{}" } },
        context,
      ),
    ).toBe(false);
    const done = {
      type: "brandhub-video-space:command-result",
      version: 1,
      sessionId: context.sessionId,
      requestId: "flush-1",
      success: true,
    };
    expect(isVideoSpaceCommandResult(done, context)).toBe(true);
    expect(
      isVideoSpaceCommandResult({ ...done, sessionId: "old" }, context),
    ).toBe(false);
  });
  it("permits read-only bundle and scene content only for the selected production", () => {
    const production = "55555555-5555-4555-8555-555555555555";
    const selected = { ...context, sourceProductionId: production };
    const productionBase = `/api/v1/workspaces/${workspace}/ai/video-productions/${production}`;
    const bundle = request(`${productionBase}/editing-bundle`);
    const scene = {
      ...request(`${productionBase}/scenes/${asset}/content`),
      responseType: "blob",
    };
    expect(isVideoSpaceRequest(bundle, selected)).toBe(true);
    expect(isVideoSpaceRequest(scene, selected)).toBe(true);
    for (const invalid of [
      { ...bundle, responseType: "blob" },
      { ...scene, responseType: "json" },
      { ...bundle, method: "PUT", body: "{}" },
      { ...bundle, path: bundle.path.replace(production, project) },
      { ...bundle, path: `${productionBase}/content` },
      { ...bundle, path: `${productionBase}/editing-bundle?other=1` },
      { ...scene, path: `${productionBase}/scenes/foreign/content` },
      { ...bundle, sessionId: "old-session" },
    ])
      expect(isVideoSpaceRequest(invalid, selected)).toBe(false);
    expect(isVideoSpaceRequest(bundle, context)).toBe(false);
  });
});

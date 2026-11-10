import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { BrowserContext, Route } from "@playwright/test";

export const WORKSPACE = "11111111-1111-4111-8111-111111111111";
export const OTHER_WORKSPACE = "22222222-2222-4222-8222-222222222222";
export const USER = "33333333-3333-4333-8333-333333333333";
export const OTHER_USER = "44444444-4444-4444-8444-444444444444";
export const JOB = "completed-owned-video";
export const ARTIFACT_ROOT = path.resolve("../.tmp/video-space-e2e");
export const FIXTURE_VIDEO = readFileSync(
  path.resolve("tests/e2e/video-space/fixtures/red.mp4"),
);
export const FIXTURE_HASH = createHash("sha256")
  .update(FIXTURE_VIDEO)
  .digest("hex");
type Json = Record<string, unknown>;
export interface SavedProject {
  id: string;
  revision: number;
  updated_at: string;
  snapshot: Json;
  assets: Json[];
}
interface Session {
  projectId: string;
  assetId: string;
  body: Json;
  uploaded?: Buffer;
}

export class VideoSpaceApiFixture {
  readonly projects = new Map<string, SavedProject>();
  readonly sessions = new Map<string, Session>();
  readonly requests: {
    method: string;
    path: string;
    authorization?: string;
  }[] = [];
  sourceDenied = false;
  currentUserId = USER;

  async install(
    context: BrowserContext,
    userId = USER,
    locale = "en",
    theme = "dark",
  ) {
    await context.addInitScript(
      ({ userId, locale, theme }) => {
        localStorage.setItem("brandhub-lang", locale);
        localStorage.setItem("vite-ui-theme", theme);
        if (!localStorage.getItem("brandhub-auth"))
          localStorage.setItem(
            "brandhub-auth",
            JSON.stringify({
              state: {
                user: {
                  id: userId,
                  name: "Video Creator",
                  fullName: "Video Creator",
                },
                accessToken: "fixture-access-token",
                isAuthenticated: true,
                systemRole: "USER",
              },
              version: 0,
            }),
          );
      },
      { userId, locale, theme },
    );
    this.currentUserId = userId;
    await context.route("**/fixture-source.mp4", (route) =>
      route.fulfill({ contentType: "video/mp4", body: FIXTURE_VIDEO }),
    );
    await context.route("https://video-provider.fixture/**", (route) =>
      this.provider(route),
    );
    await context.route("**/api/v1/**", (route) =>
      this.api(route, this.currentUserId),
    );
  }

  private async respond(route: Route, data: unknown, status = 200) {
    await route.fulfill({
      status,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:3215",
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "authorization,content-type",
        "access-control-allow-methods": "GET,PUT,POST,OPTIONS",
      },
      json: {
        success: status < 400,
        data,
        ...(status >= 400
          ? {
              message: "This video is unavailable.",
              error: {
                code: "VIDEO_SOURCE_FORBIDDEN",
                message: "This video is unavailable.",
              },
            }
          : {}),
      },
    });
  }

  private async provider(route: Route) {
    const request = route.request();
    this.requests.push({
      method: request.method(),
      path: new URL(request.url()).pathname,
      authorization: request.headers().authorization,
    });
    if (request.method() === "OPTIONS") {
      await route.fulfill({
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "PUT",
          "access-control-allow-headers": "content-type",
        },
      });
      return;
    }
    const session = this.sessions.get(new URL(request.url()).pathname.slice(1));
    if (!session) throw new Error("Unexpected provider upload");
    session.uploaded = request.postDataBuffer() ?? undefined;
    await route.fulfill({
      headers: { "access-control-allow-origin": "*" },
      status: 200,
      body: "",
    });
  }

  private async api(route: Route, userId: string) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const pathname = url.pathname;
    this.requests.push({
      method,
      path: pathname,
      authorization: request.headers().authorization,
    });
    if (method === "OPTIONS") return this.respond(route, null);
    if (pathname.endsWith(`/ai/videos/${JOB}/content`)) {
      if (this.sourceDenied) return this.respond(route, null, 403);
      await route.fulfill({
        contentType: "video/mp4",
        body: FIXTURE_VIDEO,
        headers: {
          "access-control-allow-origin": "http://127.0.0.1:3215",
          "access-control-allow-credentials": "true",
        },
      });
      return;
    }
    const match = pathname.match(
      /\/workspaces\/([^/]+)\/video-projects(?:\/(.*))?$/,
    );
    if (match) {
      if (match[1] !== WORKSPACE || userId !== USER)
        return this.respond(route, []);
      return this.project(route, match[2] ?? "");
    }
    const workspace = (id: string) => ({
      id,
      name: id === WORKSPACE ? "Video Studio" : "Other Studio",
      agencyId: "agency-fixture",
      slug: "studio",
      ownerId: userId,
      logoUrl: null,
      settings: {},
      isActive: true,
      createdAt: "2026-10-01T00:00:00Z",
      myRole: "CREATOR",
      clientProfileId: null,
    });
    let data: unknown = [];
    if (pathname === "/api/v1/users/me")
      data = { id: userId, role: "USER", fullName: "Video Creator" };
    if (pathname === "/api/v1/workspaces")
      data = [workspace(WORKSPACE), workspace(OTHER_WORKSPACE)];
    if (pathname === `/api/v1/workspaces/${WORKSPACE}`)
      data = workspace(WORKSPACE);
    if (pathname === `/api/v1/workspaces/${OTHER_WORKSPACE}`)
      data = workspace(OTHER_WORKSPACE);
    if (pathname.endsWith("/ai/credits")) data = { remaining: 190 };
    if (pathname.endsWith("/ai/videos")) {
      if (method !== "GET")
        throw new Error("Video Space must never generate or charge credits");
      data = [
        {
          jobId: JOB,
          status: "COMPLETED",
          prompt: "Owned completed red video",
          styleKey: null,
          ambassadorId: null,
          aspectRatio: "16:9",
          videoUrl: "http://127.0.0.1:3215/fixture-source.mp4",
          s3Key: "private/owned-output.mp4",
          errorCode: null,
          refunded: false,
          createdAt: "2026-10-29T01:00:00Z",
          finishedAt: "2026-10-29T01:01:00Z",
        },
      ];
    }
    return this.respond(route, data);
  }

  private async project(route: Route, suffix: string) {
    const request = route.request();
    const method = request.method();
    if (!suffix)
      return this.respond(
        route,
        [...this.projects.values()].map((project) => ({
          id: project.id,
          revision: project.revision,
          updated_at: project.updated_at,
          name: (project.snapshot.metadata as Json).name,
        })),
      );
    const [projectId, media, assetId, action] = suffix.split("/");
    let project = this.projects.get(projectId);
    if (media === "media" && action === "upload-session") {
      const body = request.postDataJSON() as Json;
      if (!project) {
        project = {
          id: projectId,
          revision: 0,
          updated_at: new Date().toISOString(),
          snapshot: {},
          assets: [],
        };
        this.projects.set(projectId, project);
      }
      const sessionId = `session-${this.sessions.size + 1}`;
      this.sessions.set(sessionId, { projectId, assetId, body });
      const existing = project.assets.find((asset) => asset.id === assetId);
      return this.respond(route, {
        sessionId,
        uploadUrl: existing
          ? null
          : `https://video-provider.fixture/${sessionId}`,
        headers: { "Content-Type": body.contentType },
        expiresAt: "2026-11-01T00:00:00Z",
      });
    }
    if (media === "media" && action === "upload-complete") {
      const session = this.sessions.get(
        (request.postDataJSON() as { sessionId: string }).sessionId,
      )!;
      const existing = project!.assets.find((asset) => asset.id === assetId);
      if (existing) return this.respond(route, existing);
      if (
        !session.uploaded ||
        createHash("sha256").update(session.uploaded).digest("hex") !==
          session.body.sha256
      )
        throw new Error("Provider bytes/hash mismatch");
      const asset = {
        id: assetId,
        name: session.body.fileName,
        mime_type: session.body.contentType,
        sha256: session.body.sha256,
        metadata: session.body.metadata,
      };
      project!.assets.push(asset);
      return this.respond(route, asset);
    }
    if (media === "media" && method === "GET") {
      await route.fulfill({
        contentType: "video/mp4",
        body: FIXTURE_VIDEO,
        headers: {
          "access-control-allow-origin": "http://127.0.0.1:3215",
          "access-control-allow-credentials": "true",
        },
      });
      return;
    }
    if (method === "PUT") {
      const body = request.postDataJSON() as {
        expected_revision: number;
        snapshot: Json;
      };
      if (!project || body.expected_revision !== project.revision)
        return this.respond(route, null, 409);
      project.snapshot = body.snapshot;
      project.revision++;
      project.updated_at = new Date().toISOString();
    }
    // Business deliberately hides unaccepted revision0 drafts while their private READY media remain usable.
    if (method === "GET" && project?.revision === 0)
      return this.respond(route, null, 404);
    const manifest = project?.snapshot.mediaAssetIds;
    const visible =
      project && Array.isArray(manifest)
        ? {
            ...project,
            assets: project.assets.filter((asset) =>
              manifest.includes(asset.id),
            ),
          }
        : project;
    return this.respond(route, visible, project ? 200 : 404);
  }
}

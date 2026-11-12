import assert from "node:assert/strict";
import test from "node:test";
import { initializeStorageScope, scopeStorageName } from "../src/platform/storage-scope.ts";

test("storage requires a context and keeps user/workspace names distinct", () => {
  assert.throws(() => scopeStorageName("video-editor-projects"), /context/i);
  initializeStorageScope("user-a", "workspace-a");
  const name = scopeStorageName("video-editor-projects");
  assert.match(name, /^brandhub-video-space-v1-/);
  assert.notEqual(name, "video-editor-projects");
  assert.equal(scopeStorageName("video-editor-projects"), name);
  assert.doesNotThrow(() => initializeStorageScope("user-a", "workspace-a"));
  assert.throws(() => initializeStorageScope("user-b", "workspace-a"), /reload/i);
  assert.throws(() => initializeStorageScope("user-a", "workspace-b"), /reload/i);
  assert.notEqual(scopeStorageName("video-editor-meta"), "video-editor-meta");
  assert.doesNotMatch(scopeStorageName("media-files-project-a"), /[/\\]/);
});

test("fresh frames give another user or workspace different storage names", async () => {
  const otherUser = await import("../src/platform/storage-scope.ts?other-user");
  const otherWorkspace = await import("../src/platform/storage-scope.ts?other-workspace");
  otherUser.initializeStorageScope("user-b", "workspace-a");
  otherWorkspace.initializeStorageScope("user-a", "workspace-b");
  for (const name of ["video-editor-projects", "video-editor-meta", "video-editor-timelines-project-scene", "media-files-project"]) {
    assert.notEqual(scopeStorageName(name), otherUser.scopeStorageName(name));
    assert.notEqual(scopeStorageName(name), otherWorkspace.scopeStorageName(name));
  }
});

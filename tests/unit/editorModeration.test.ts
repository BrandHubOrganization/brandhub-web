import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorModeration } from "../../src/pages/editor/services/editorModeration";
import type { ModerationResult } from "../../src/types/moderation";

const passed: ModerationResult = { status: "PASSED", issues: [] };
function deferred() {
  let resolve!: (value: ModerationResult) => void;
  const promise = new Promise<ModerationResult>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("main editor moderation timing", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("sends exactly one request after 3 seconds and resets the delay on typing", async () => {
    const request = vi.fn().mockResolvedValue(passed);
    const controller = new EditorModeration(request);
    controller.update("workspace", "a");
    await vi.advanceTimersByTimeAsync(2000);
    expect(request).not.toHaveBeenCalled();
    controller.update("workspace", "ab");
    await vi.advanceTimersByTimeAsync(2999);
    expect(request).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0].slice(0, 2)).toEqual(["workspace", "ab"]);
    await vi.advanceTimersByTimeAsync(20000);
    expect(request).toHaveBeenCalledTimes(1);
    controller.dispose();
  });

  it("checks immediately before the debounce and reuses the exact-text verdict", async () => {
    const request = vi.fn().mockResolvedValue(passed);
    const controller = new EditorModeration(request);
    controller.update("workspace", "caption");
    await vi.advanceTimersByTimeAsync(2000);
    expect(await controller.ensure()).toEqual(passed);
    expect(await controller.ensure()).toEqual(passed);
    await vi.advanceTimersByTimeAsync(3000);
    expect(request).toHaveBeenCalledTimes(1);
    controller.dispose();
  });

  it("joins an in-flight check instead of making another request", async () => {
    const result = deferred();
    const request = vi.fn().mockReturnValue(result.promise);
    const controller = new EditorModeration(request);
    controller.update("workspace", "caption");
    await vi.advanceTimersByTimeAsync(3000);
    const first = controller.ensure();
    const second = controller.ensure();
    expect(first).toBe(second);
    expect(request).toHaveBeenCalledTimes(1);
    result.resolve(passed);
    expect(await first).toEqual(passed);
    controller.dispose();
  });

  it("aborts an obsolete request and never authorizes edited text from its late result", async () => {
    const old = deferred();
    const request = vi.fn().mockReturnValue(old.promise);
    const controller = new EditorModeration(request);
    controller.update("workspace", "old");
    const pending = controller.ensure();
    await Promise.resolve();
    controller.update("workspace", "new");
    expect(request.mock.calls[0][2].aborted).toBe(true);
    old.resolve(passed);
    expect(await pending).toBeUndefined();
    expect(controller.getSnapshot()).toMatchObject({
      text: "new",
      phase: "WAITING",
    });
    expect(controller.getSnapshot().result).toBeUndefined();
    controller.dispose();
  });

  it("invalidates results on hashtag or workspace changes", async () => {
    const request = vi.fn().mockResolvedValue(passed);
    const controller = new EditorModeration(request);
    controller.update("workspace", "caption\n#one");
    await controller.ensure();
    controller.update("workspace", "caption\n#two");
    expect(controller.getSnapshot().result).toBeUndefined();
    await controller.ensure();
    controller.update("other", "caption\n#two");
    expect(controller.getSnapshot().result).toBeUndefined();
    await controller.ensure();
    expect(request).toHaveBeenCalledTimes(3);
    controller.dispose();
  });

  it("does not request for empty text, missing workspace or text above the API limit", async () => {
    const request = vi.fn();
    const controller = new EditorModeration(request);
    controller.update("workspace", "   ");
    await vi.advanceTimersByTimeAsync(3000);
    controller.update(undefined, "caption");
    await vi.advanceTimersByTimeAsync(3000);
    controller.update("workspace", "x".repeat(8001));
    expect((await controller.ensure())?.status).toBe("NOT_CHECKED");
    expect(request).not.toHaveBeenCalled();
    controller.dispose();
  });

  it("keeps failures unchecked and allows an explicit retry", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValue(passed);
    const controller = new EditorModeration(request);
    controller.update("workspace", "caption");
    expect((await controller.ensure())?.status).toBe("NOT_CHECKED");
    expect(await controller.ensure()).toEqual(passed);
    controller.dispose();
  });

  it("cancels debounce and ignores outstanding work when disposed", async () => {
    const old = deferred();
    const request = vi.fn().mockReturnValue(old.promise);
    const controller = new EditorModeration(request);
    controller.update("workspace", "caption");
    controller.dispose();
    await vi.advanceTimersByTimeAsync(3000);
    expect(request).not.toHaveBeenCalled();
    controller.update("workspace", "caption");
    const pending = controller.ensure();
    await Promise.resolve();
    controller.dispose();
    old.resolve(passed);
    expect(await pending).toBeUndefined();
  });
});

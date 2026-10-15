import { describe, expect, it, vi } from "vitest";
import { TaskEditSession } from "./taskEditSession";

describe("Task autosave queue", () => {
  it("serializes a Task and uses the last acknowledged revision", async () => {
    const session = new TaskEditSession();
    const observed: number[] = [];
    let revision = 0;
    let release!: () => void;
    const first = session.run("task", async () => {
      observed.push(revision);
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      revision++;
    });
    const second = session.run("task", async () => {
      observed.push(revision);
      revision++;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(session.pending).toBe(2);
    expect(observed).toEqual([0]);
    release();
    await Promise.all([first, second]);
    expect(observed).toEqual([0, 1]);
    expect(session.pending).toBe(0);
  });
  it("blocks later writes on conflict, preserves dirty state until explicit retry/discard", async () => {
    const session = new TaskEditSession();
    const next = vi.fn(async () => 1);
    session.setDirty("field", true);
    await expect(
      session.run("task", async () => {
        throw new Error("409");
      }),
    ).rejects.toThrow("409");
    await expect(session.run("task", next)).rejects.toThrow("409");
    expect(next).not.toHaveBeenCalled();
    expect(session.hasUnsaved).toBe(true);
    session.retry("task");
    await expect(session.run("task", next)).resolves.toBe(1);
    session.discard();
    expect(session.hasUnsaved).toBe(false);
  });
  it("does not serialize unrelated Tasks", async () => {
    const session = new TaskEditSession();
    let release!: () => void;
    const first = session.run(
      "a",
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    await session.run("b", async () => 1);
    expect(session.pending).toBe(1);
    release();
    await first;
  });
});

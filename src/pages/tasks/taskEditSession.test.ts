import { describe, expect, it } from "vitest";
import { TaskEditSession } from "@/pages/tasks/taskEditSession";

describe("Task edit discard session", () => {
  it("clears dirty fields and notifies mounted editors of explicit discard", () => {
    const session = new TaskEditSession();
    session.setDirty("description", true);
    let seen = -1;
    const unsubscribe = session.subscribe(() => { seen = session.discardVersion; });
    session.discard();
    expect(session.hasUnsaved).toBe(false);
    expect(seen).toBe(1);
    unsubscribe();
  });

  it("does not mark normal dirty or save notifications as discard", async () => {
    const session = new TaskEditSession();
    session.setDirty("description", true);
    await session.run("task", async () => "saved");
    session.setDirty("description", false);
    expect(session.discardVersion).toBe(0);
    expect(session.hasUnsaved).toBe(false);
  });

  it("keeps unsaved protection while a write is pending", async () => {
    const session = new TaskEditSession();
    let finish!: () => void;
    const wait = new Promise<void>((resolve) => { finish = resolve; });
    const write = session.run("task", () => wait);
    expect(session.pending).toBe(1);
    expect(session.hasUnsaved).toBe(true);
    finish();
    await write;
    expect(session.hasUnsaved).toBe(false);
  });

  it("clears a failed queue only after an explicit discard", async () => {
    const session = new TaskEditSession();
    const failure = new Error("failed save");
    session.setDirty("description", true);
    await expect(session.run("task", async () => { throw failure; })).rejects.toBe(failure);
    await expect(session.run("task", async () => "blocked")).rejects.toBe(failure);
    session.discard();
    await expect(session.run("task", async () => "saved")).resolves.toBe("saved");
    expect(session.hasUnsaved).toBe(false);
  });
});

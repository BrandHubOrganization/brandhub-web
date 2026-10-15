import { describe, expect, it } from "vitest";
import { taskDeadline, deadlineColumn } from "./taskViewData";
import type { TaskListItem } from "@/types/task";
describe("real deadline visualisation", () => {
  const task = (dueDate?: string | null) => ({ dueDate }) as TaskListItem;
  it("never synthesizes a deadline", () => {
    expect(taskDeadline(task())).toBeNull();
    expect(taskDeadline(task(null))).toBeNull();
    expect(taskDeadline(task("invalid"))).toBeNull();
  });
  it("places a point only on the actual deadline day", () => {
    const days = [new Date(2026, 9, 15), new Date(2026, 9, 16)];
    expect(
      deadlineColumn(task(new Date(2026, 9, 16, 12).toISOString()), days),
    ).toBe(2);
    expect(
      deadlineColumn(task(new Date(2026, 9, 20).toISOString()), days),
    ).toBeNull();
    expect(deadlineColumn(task(), days)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { taskInstant, taskLocalMinute } from "@/pages/tasks/taskWorkflowDates";

describe("Task Workspace timezone conversion", () => {
  it("does not use browser timezone for Vietnamese Workspace input", () => {
    expect(taskInstant("2026-10-15T09:30", "Asia/Ho_Chi_Minh")).toBe(
      "2026-10-15T02:30:00.000Z",
    );
    expect(taskLocalMinute("2026-10-15T02:30:00Z", "Asia/Ho_Chi_Minh")).toBe(
      "2026-10-15T09:30",
    );
  });
  it("supports non-hour timezone offsets", () => {
    expect(taskInstant("2026-10-15T09:30", "Asia/Kathmandu")).toBe(
      "2026-10-15T03:45:00.000Z",
    );
  });
  it.each(["2026-03-08T02:30", "2026-11-01T01:30"])(
    "rejects nonexistent/ambiguous DST wall time %s",
    (local) => {
      expect(() => taskInstant(local, "America/New_York")).toThrow(
        "INVALID_LOCAL_TIME",
      );
    },
  );
  it.each(["bad", "2026-02-30T09:30", "2026-10-15T25:00"])(
    "rejects invalid input %s",
    (local) => {
      expect(() => taskInstant(local, "UTC")).toThrow("INVALID_LOCAL_TIME");
    },
  );
  it("keeps missing/invalid dates missing", () => {
    expect(taskLocalMinute(null, "UTC")).toBe("");
    expect(taskLocalMinute("invalid", "UTC")).toBe("");
    expect(taskLocalMinute("2026-10-15T02:30:00Z", "invalid")).toBe("");
  });
});

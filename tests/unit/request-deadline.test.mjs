import test from "node:test";
import assert from "node:assert/strict";
import { requestDeadlineWindow } from "../../src/pages/requests/lib/requestDeadline.ts";

// Test the real instant bounds under a deliberately different browser timezone.
process.env.TZ = "UTC";
const input = (startDate, endDate, timezone = "Asia/Ho_Chi_Minh", now = "2026-10-14T05:00:00Z") => ({
  timeline: JSON.stringify({ startDate, endDate }), timezone, now: Date.parse(now),
});

test("today is the lower bound, inclusive through the Campaign's final day", () => {
  const result = requestDeadlineWindow(input("2026-10-01", "2026-10-20"));
  assert.equal(result.min, "2026-10-13T17:00");
  assert.equal(result.max, "2026-10-20T16:59");
});
test("future Campaign start is later than today", () => {
  assert.equal(requestDeadlineWindow(input("2026-10-18", "2026-10-20")).min, "2026-10-17T17:00");
});
test("expired Campaign has no valid interval", () => {
  assert.equal(requestDeadlineWindow(input("2026-10-01", "2026-10-13")), null);
});
test("the whole current day remains allowed, not just hours after now", () => {
  const result = requestDeadlineWindow(input("2026-10-14", "2026-10-14"));
  assert.equal(result.min, "2026-10-13T17:00");
  assert.equal(result.max, "2026-10-14T16:59");
});
test("Workspace day rollover updates the lower bound", () => {
  const before = requestDeadlineWindow(input("2026-10-01", "2026-10-20", "Asia/Ho_Chi_Minh", "2026-10-14T16:59:59Z"));
  const after = requestDeadlineWindow(input("2026-10-01", "2026-10-20", "Asia/Ho_Chi_Minh", "2026-10-14T17:00:00Z"));
  assert.equal(before.min, "2026-10-13T17:00");
  assert.equal(after.min, "2026-10-14T17:00");
});
test("DST forward produces a 23-hour Workspace day", () => {
  const result = requestDeadlineWindow(input("2026-03-08", "2026-03-08", "America/New_York", "2026-03-01T12:00:00Z"));
  assert.equal(result.min, "2026-03-08T05:00");
  assert.equal(result.max, "2026-03-09T03:59");
});
test("DST backward produces a 25-hour Workspace day", () => {
  const result = requestDeadlineWindow(input("2026-11-01", "2026-11-01", "America/New_York"));
  assert.equal(result.min, "2026-11-01T04:00");
  assert.equal(result.max, "2026-11-02T04:59");
});
test("invalid calendar dates, missing dates, reversed timeline and timezone fail closed", () => {
  for (const value of [input("2026-02-30", "2026-03-10"), input("2026-10-20", "2026-10-01"),
    input("2026-10-01", "2026-10-20", "invalid-zone"), { timeline: "{}", timezone: "UTC" },
    { timeline: "null", timezone: "UTC" }, { timeline: "not-json", timezone: "UTC" }]) {
    assert.throws(() => requestDeadlineWindow(value));
  }
});
test("browser-local input values map to the same Workspace instants", () => {
  process.env.TZ = "Asia/Tokyo";
  try {
    const result = requestDeadlineWindow(input("2026-10-14", "2026-10-14"));
    assert.equal(result.min, "2026-10-14T02:00");
    assert.equal(result.max, "2026-10-15T01:59");
    assert.equal(new Date(result.min).toISOString(), "2026-10-13T17:00:00.000Z");
  } finally { process.env.TZ = "UTC"; }
});

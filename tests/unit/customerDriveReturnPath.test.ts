import { describe, expect, it } from "vitest";
import { customerDriveReturnPath } from "../../src/lib/customerDriveReturnPath";

describe("Drive OAuth return path", () => {
  it("only accepts dashboard or library paths in the initiating workspace", () => {
    expect(
      customerDriveReturnPath(
        "workspace-1",
        "/workspaces/workspace-1/dashboard",
      ),
    ).toBe("/workspaces/workspace-1/dashboard");
    expect(
      customerDriveReturnPath("workspace-1", "/workspaces/workspace-1/library"),
    ).toBe("/workspaces/workspace-1/library");
    expect(customerDriveReturnPath("workspace-1", "/library")).toBe("/library");
    for (const candidate of [
      "https://evil.test",
      "//evil.test",
      "/workspaces/other/dashboard",
      "/admin",
      "/workspaces/workspace-1/dashboard?redirect=evil",
    ]) {
      expect(customerDriveReturnPath("workspace-1", candidate)).toBe(
        "/workspaces/workspace-1/dashboard",
      );
    }
    expect(customerDriveReturnPath(null, "/library")).toBe("/workspace");
    expect(customerDriveReturnPath("../../admin", "/library")).toBe(
      "/workspace",
    );
  });
});

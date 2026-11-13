import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DRIVE_IMPORT_SCOPE,
  clearCachedDriveImportToken,
  requestDriveImportToken,
} from "../../src/pages/library/hooks/driveImportAuthorization";

beforeEach(() => {
  clearCachedDriveImportToken();
});
afterEach(() => {
  clearCachedDriveImportToken();
  vi.unstubAllGlobals();
});
function setup(result: Record<string, unknown>, popupError?: string) {
  const request = vi.fn();
  const init = vi.fn((options) => {
    request.mockImplementation(() =>
      popupError
        ? options.error_callback({ type: popupError })
        : options.callback(result),
    );
    return { requestAccessToken: request };
  });
  vi.stubGlobal("window", {
    google: { accounts: { oauth2: { initTokenClient: init } } },
  });
  return { request, init };
}
describe("one-time Drive import authorization", () => {
  it("opens read-only authorization immediately and returns the temporary token", async () => {
    const { init, request } = setup({
      access_token: "test-only",
      scope: DRIVE_IMPORT_SCOPE,
    });
    const pending = requestDriveImportToken("public-client");
    expect(request).toHaveBeenCalledWith({ prompt: "" });
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: DRIVE_IMPORT_SCOPE,
        include_granted_scopes: false,
      }),
    );
    await expect(pending).resolves.toBe("test-only");
  });
  it("rejects declined consent", async () => {
    setup({ error: "access_denied" });
    await expect(requestDriveImportToken("client")).rejects.toThrow(
      "DRIVE_IMPORT_AUTH_REQUIRED",
    );
  });
  it("rejects a token that lacks Drive read access", async () => {
    setup({ access_token: "test-only", scope: "openid email" });
    await expect(requestDriveImportToken("client")).rejects.toThrow(
      "DRIVE_IMPORT_AUTH_REQUIRED",
    );
  });
  it("treats a closed popup as cancellation", async () => {
    setup({}, "popup_closed");
    await expect(requestDriveImportToken("client")).rejects.toThrow(
      "DRIVE_IMPORT_CANCELLED",
    );
  });
  it("reports a blocked popup separately", async () => {
    setup({}, "popup_failed_to_open");
    await expect(requestDriveImportToken("client")).rejects.toThrow(
      "DRIVE_IMPORT_POPUP_FAILED",
    );
  });
  it("reports an unavailable Google SDK", async () => {
    vi.stubGlobal("window", {});
    await expect(requestDriveImportToken("client")).rejects.toThrow(
      "DRIVE_IMPORT_SDK_UNAVAILABLE",
    );
  });
});

import { describe, expect, it } from "vitest";
import { validateFbCookieJson } from "@/services/adminCrawlConfigService";

describe("validateFbCookieJson", () => {
  it("rejects empty input, malformed JSON, and cookies missing c_user or xs", () => {
    expect(validateFbCookieJson("   ")).toBe("empty");
    expect(validateFbCookieJson("{not-json")).toBe("invalidJson");
    expect(validateFbCookieJson('{"foo":"bar"}')).toBe("invalidJson");
    expect(
      validateFbCookieJson('[{"name":"c_user","value":"100012345"}]'),
    ).toBe("missingRequired");
  });

  it("accepts Cookie-Editor arrays and Playwright storage_state objects containing c_user and xs", () => {
    expect(
      validateFbCookieJson(
        '[{"name":"c_user","value":"100012345"},{"name":"xs","value":"secret"}]',
      ),
    ).toBeNull();
    expect(
      validateFbCookieJson(
        '{"cookies":[{"name":"c_user","value":"100012345"},{"name":"xs","value":"secret"}]}',
      ),
    ).toBeNull();
  });
});

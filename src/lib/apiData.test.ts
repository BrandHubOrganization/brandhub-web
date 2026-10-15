import { describe, expect, it } from "vitest";
import { requireApiData } from "./apiData";

describe("required API envelopes", () => {
  it("keeps valid empty results", () => {
    expect(requireApiData({ success: true, data: [] })).toEqual([]);
    expect(requireApiData({ success: true, data: { items: [] } })).toEqual({ items: [] });
  });
  it.each([undefined, null, "<html>", {}, { data: [] }, { success: true },
    { success: true, data: null }, { success: false, data: [] }])("rejects invalid response %j", envelope => {
    expect(() => requireApiData(envelope)).toThrow("INVALID_API_RESPONSE");
  });
});

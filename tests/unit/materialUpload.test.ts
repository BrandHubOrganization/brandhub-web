import { describe, expect, it } from "vitest";
import { materialUploadLimit } from "../../src/pages/library/hooks/materialUploadTransport";

describe("Repository upload file policy", () => {
  it("allows PDF up to 25 MiB and library MOV up to 200 MiB", () => {
    expect(materialUploadLimit("application/pdf")).toBe(26_214_400);
    expect(materialUploadLimit("video/quicktime")).toBe(209_715_200);
  });

  it("does not allow Office or CSV even if the file picker accepts a generic file", () => {
    expect(
      materialUploadLimit(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(0);
    expect(materialUploadLimit("text/csv")).toBe(0);
  });
});

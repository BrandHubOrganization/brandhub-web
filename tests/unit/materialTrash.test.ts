import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import {
  canMutateMaterial,
  retentionDays,
} from "../../src/pages/library/hooks/materialTrashPolicy";
import { resolveDownloadErrorKey } from "../../src/pages/library/hooks/useMaterialDownload";
import type { MaterialItem } from "../../src/types/material";
import en from "../../src/i18n/locales/en/library.json";
import vi from "../../src/i18n/locales/vi/library.json";

const material: MaterialItem = {
  id: "file",
  workspaceId: "workspace",
  name: "photo.png",
  type: "RAW",
  url: "",
  createdAt: "2026-10-01T00:00:00Z",
  createdBy: "creator",
  deletedAt: "2026-10-01T00:00:00Z",
  purgeAfter: "2026-12-01T00:00:00Z",
};

describe("material trash", () => {
  it("lets managers manage any file and creators/clients manage only their own", () => {
    expect(canMutateMaterial(material, "other", "MANAGER")).toBe(true);
    expect(canMutateMaterial(material, "creator", "CREATOR")).toBe(true);
    expect(canMutateMaterial(material, "creator", "CLIENT")).toBe(true);
    expect(canMutateMaterial(material, "other", "CREATOR")).toBe(false);
    expect(canMutateMaterial(material, "creator", "OWNER")).toBe(false);
  });
  it("uses original deletion date for restore regardless of purge backoff", () => {
    expect(retentionDays(material, Date.parse("2026-10-30T23:59:59Z"))).toBe(1);
    expect(retentionDays(material, Date.parse("2026-10-31T00:00:00Z"))).toBe(0);
  });
  it("keeps all trash and repository translation keys parallel", () => {
    expect(Object.keys(en.trash).sort()).toEqual(Object.keys(vi.trash).sort());
    expect(Object.keys(en.repository).sort()).toEqual(
      Object.keys(vi.repository).sort(),
    );
  });
  it("maps download error codes and statuses to i18n keys", () => {
    const axiosErr = (status: number, code?: string) => {
      const err = new AxiosError("failed");
      err.response = {
        status,
        data: code ? { error: { code } } : {},
      } as AxiosResponse;
      return err;
    };
    expect(resolveDownloadErrorKey(axiosErr(409, "MATERIAL_STORAGE_MISSING"))).toBe("storageMissing");
    expect(resolveDownloadErrorKey(axiosErr(503, "MATERIAL_STORAGE_UNAVAILABLE"))).toBe("storageUnavailable");
    expect(resolveDownloadErrorKey(axiosErr(409, "MATERIAL_NOT_READY"))).toBe("materialNotReady");
    expect(resolveDownloadErrorKey(axiosErr(409, "MATERIAL_UNAVAILABLE"))).toBe("unavailable");
    expect(resolveDownloadErrorKey(axiosErr(404, "MATERIAL_NOT_FOUND"))).toBe("unavailable");
    expect(resolveDownloadErrorKey(axiosErr(403, "WORKSPACE_ACCESS_DENIED"))).toBe("forbidden");
    expect(resolveDownloadErrorKey(new Error("generic"))).toBe("downloadFailed");
  });
});

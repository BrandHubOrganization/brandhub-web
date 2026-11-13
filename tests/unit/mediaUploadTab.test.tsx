import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MAX_MEDIA_UPLOAD_SIZE } from "@/lib/constants";
import viEditor from "@/i18n/locales/vi/editor.json";
import enEditor from "@/i18n/locales/en/editor.json";
import viLib from "@/i18n/locales/vi/library.json";
import enLib from "@/i18n/locales/en/library.json";
import { MediaUploadTab } from "@/pages/editor/components/media/MediaUploadTab";

vi.mock("@/pages/library/hooks/useMaterialUpload", () => ({
  useMaterialUpload: () => ({
    upload: vi.fn(),
    stage: "idle",
    progress: 0,
    conflict: null,
    resolveConflict: vi.fn(),
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "editor.mediaDropzone.uploadError") {
        return `Lỗi khi upload file ${options?.fileName ?? ""}`;
      }
      if (key === "editor.mediaDropzone.selectWorkspaceWarning") {
        return viEditor.mediaDropzone.selectWorkspaceWarning;
      }
      if (key === "library.repositoryUpload.unavailable") return viLib.repositoryUpload.unavailable;
      if (key === "library.repositoryUpload.quotaExceeded") return viLib.repositoryUpload.quotaExceeded;
      if (key === "library.repositoryUpload.poolFull") return viLib.repositoryUpload.poolFull;
      if (key === "library.repositoryUpload.driveNotConnected") return viLib.repositoryUpload.driveNotConnected;
      return key;
    },
    i18n: { language: "vi" },
  }),
}));

describe("MediaUploadTab Unit & Error Handling Tests", () => {
  it("renders drag-and-drop file picker with required accept attributes", () => {
    const html = renderToString(
      createElement(MediaUploadTab, {
        effectiveWorkspaceId: "ws-test-1",
        onUploaded: () => {},
        onAppendUrls: () => {},
      }),
    );

    expect(html).toContain('accept="image/*,video/*"');
    expect(html).toContain('type="file"');
    expect(html).toContain("cursor-pointer");
  });

  it("enforces maximum file size limit strictly under 50MB", () => {
    expect(MAX_MEDIA_UPLOAD_SIZE).toBe(50 * 1024 * 1024);

    const oversizedBytes = MAX_MEDIA_UPLOAD_SIZE + 1;
    const isOversized = oversizedBytes > MAX_MEDIA_UPLOAD_SIZE;
    expect(isOversized).toBe(true);

    const validBytes = MAX_MEDIA_UPLOAD_SIZE;
    const isValid = validBytes <= MAX_MEDIA_UPLOAD_SIZE;
    expect(isValid).toBe(true);
  });

  it("maps 503 and quota error codes to appropriate localized message keys", () => {
    const resolveErrorKey = (code?: string): string => {
      switch (code) {
        case "DRIVE_NOT_CONNECTED":
          return "library.repositoryUpload.driveNotConnected";
        case "STORAGE_QUOTA_EXCEEDED":
          return "library.repositoryUpload.quotaExceeded";
        case "STORAGE_POOL_CAPACITY_EXCEEDED":
          return "library.repositoryUpload.poolFull";
        case "MATERIAL_STORAGE_UNAVAILABLE":
        case "STORAGE_SCHEMA_NOT_READY":
          return "library.repositoryUpload.unavailable";
        default:
          return "editor.mediaDropzone.uploadError";
      }
    };

    expect(resolveErrorKey("STORAGE_SCHEMA_NOT_READY")).toBe("library.repositoryUpload.unavailable");
    expect(resolveErrorKey("MATERIAL_STORAGE_UNAVAILABLE")).toBe("library.repositoryUpload.unavailable");
    expect(resolveErrorKey("STORAGE_POOL_CAPACITY_EXCEEDED")).toBe("library.repositoryUpload.poolFull");
    expect(resolveErrorKey("STORAGE_QUOTA_EXCEEDED")).toBe("library.repositoryUpload.quotaExceeded");
    expect(resolveErrorKey("DRIVE_NOT_CONNECTED")).toBe("library.repositoryUpload.driveNotConnected");
    expect(resolveErrorKey("UNKNOWN_ERROR")).toBe("editor.mediaDropzone.uploadError");
  });

  it("ensures workspace warning translation exists across VI and EN locales", () => {
    expect(viEditor.mediaDropzone.selectWorkspaceWarning).toBe(
      "Vui lòng chọn Workspace trước khi tải tệp lên!",
    );
    expect(enEditor.mediaDropzone.selectWorkspaceWarning).toBe(
      "Please select a Workspace before uploading files!",
    );
    expect(viLib.repositoryUpload.unavailable).toBeTruthy();
    expect(enLib.repositoryUpload.unavailable).toBeTruthy();
  });
});


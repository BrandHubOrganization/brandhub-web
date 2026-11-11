import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { MediaDetailPanel } from "@/pages/library/components/MediaDetailPanel";
import { MaterialPreview } from "@/pages/library/components/MaterialPreview";
import { MaterialBadges } from "@/pages/library/components/MaterialBadges";
import { MaterialDetailFacts } from "@/pages/library/components/MaterialDetailFacts";
import { MaterialDetailActions } from "@/pages/library/components/MaterialDetailActions";
import viLib from "@/i18n/locales/vi/library.json";
import enLib from "@/i18n/locales/en/library.json";
import type { MaterialItem } from "@/types/material";

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetContent: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetHeader: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetTitle: ({ children }: { children: ReactNode }) => createElement("h2", null, children),
  SheetDescription: ({ children }: { children: ReactNode }) => createElement("p", null, children),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        "library.repository.storageS3Badge": viLib.repository.storageS3Badge,
        "library.repository.typeRAW": viLib.repository.typeRAW,
        "library.repository.rawWarning": viLib.repository.rawWarning,
        "library.repository.rawWarningBadge": viLib.repository.rawWarningBadge,
        "library.repository.audienceInternal": viLib.repository.audienceInternal,
        "library.repository.refreshPreview": viLib.repository.refreshPreview,
        "library.repository.preview": viLib.repository.preview,
        "library.repository.nameLabel": viLib.repository.nameLabel,
        "library.repository.createdByLabel": viLib.repository.createdByLabel,
        "library.repository.fileDetails": viLib.repository.fileDetails,
        "library.repository.createdAtLabel": viLib.repository.createdAtLabel,
      };
      return map[key] ?? (typeof fallback === "string" ? fallback : key);
    },
    i18n: { language: "vi", changeLanguage: vi.fn() },
  }),
}));

const sampleMaterial: MaterialItem = {
  id: "mat-1",
  workspaceId: "ws-1",
  name: "images.jpg",
  type: "RAW",
  mimeType: "image/jpeg",
  mediaKind: "IMAGE",
  fileSize: 191385,
  url: "https://cdn.brandhub.id.vn/images.jpg",
  previewUrl: "https://cdn.brandhub.id.vn/preview/images.jpg",
  previewExpiresAt: "2099-01-01T00:00:00Z",
  status: "READY",
  storageProvider: "SYSTEM_S3",
  visibility: "INTERNAL",
  rawWarning: true,
  currentVersionNumber: 1,
  version: 1,
  createdByName: "Quản lý Workspace",
  createdAt: "2026-11-11T05:00:00Z",
  capabilities: {
    canPreview: true,
    canDownload: true,
    canRename: true,
    canUpdateType: true,
    canChangeAudience: true,
    canWatermark: true,
    canDelete: true,
    canRestore: false,
  },
};

describe("MediaDetailPanel Web Design Alignment", () => {
  it("updates stale S3 (2GB Free) badge label in both VI and EN locales", () => {
    expect(viLib.repository.storageS3Badge).not.toContain("2GB");
    expect(enLib.repository.storageS3Badge).not.toContain("2GB");
  });

  it("renders MaterialPreview as a framed rounded-2xl stage with compact icon refresh control", () => {
    const html = renderToString(
      createElement(MaterialPreview, {
        material: sampleMaterial,
        onUnavailable: () => {},
      }),
    );
    expect(html).toContain("rounded-2xl");
    expect(html).toContain('aria-label="Làm mới bản xem trước"');
    expect(html).toContain('data-slot="preview-toolbar"');
  });

  it("renders MaterialBadges and MediaDetailPanel without RAW warning banner or RAW text", () => {
    expect(viLib.repository.typeRAW).toBe("Ảnh gốc");
    expect(viLib.repository.typeRaw).toBe("Ảnh gốc");
    expect(enLib.repository.typeRAW.toUpperCase()).not.toContain("RAW");
    expect(enLib.repository.typeRaw.toUpperCase()).not.toContain("RAW");

    const badgesHtml = renderToString(
      createElement(MaterialBadges, { material: sampleMaterial }),
    );
    expect(badgesHtml).toContain(viLib.repository.storageS3Badge);
    expect(badgesHtml).toContain("Ảnh gốc");
    expect(badgesHtml).not.toContain("RAW");

    const compactBadgesHtml = renderToString(
      createElement(MaterialBadges, { material: sampleMaterial, compact: true }),
    );
    expect(compactBadgesHtml).not.toContain(viLib.repository.rawWarningBadge);
    expect(compactBadgesHtml).not.toContain("RAW");

    const queryClient = new QueryClient();
    const panelHtml = renderToString(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(MediaDetailPanel, {
          material: sampleMaterial,
          onClose: () => {},
          onDelete: () => {},
        }),
      ),
    );
    expect(panelHtml).not.toContain('role="note"');
    expect(panelHtml).not.toContain("RAW");
    expect(panelHtml).not.toContain(viLib.repository.rawWarning);
  });

  it("renders MaterialDetailFacts inside a structured bordered card with version metadata", () => {
    const html = renderToString(
      createElement(MaterialDetailFacts, { material: sampleMaterial }),
    );
    expect(html).toContain('data-slot="material-facts-card"');
    expect(html).toContain("rounded-2xl");
    expect(html).toContain("images.jpg");
    expect(html).toContain("Quản lý Workspace");
    expect(html).toContain("v1");
  });

  it("renders MaterialDetailActions with primary orange download button in sticky footer style", () => {
    const html = renderToString(
      createElement(MaterialDetailActions, {
        material: sampleMaterial,
        previewUrl: sampleMaterial.url,
        canDelete: true,
        canRestore: false,
        busy: false,
        onDownload: () => {},
        onWatermark: () => {},
        onDelete: () => {},
        onRestore: () => {},
      }),
    );
    expect(html).toContain('data-slot="material-detail-footer"');
    expect(html).toContain("bg-brand-orange");
  });
});

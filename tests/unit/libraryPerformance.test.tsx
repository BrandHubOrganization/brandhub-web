import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MaterialRepositoryCard } from "@/pages/library/components/MaterialRepositoryCard";
import type { MaterialItem } from "@/types/material";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) =>
      typeof fallback === "string" ? fallback : _key,
    i18n: { language: "vi", changeLanguage: vi.fn() },
  }),
}));

const baseImage: MaterialItem = {
  id: "img-1",
  workspaceId: "bb996948-4b50-4761-a682-07a3e7a43eba",
  name: "campaign-banner.jpg",
  type: "RAW",
  mimeType: "image/jpeg",
  mediaKind: "IMAGE",
  fileSize: 8_500_000,
  url: "http://localhost:8080/api/v1/repository-media?capability=v1.testtoken",
  previewUrl:
    "http://localhost:8080/api/v1/repository-media?capability=v1.testtoken",
  status: "READY",
  storageProvider: "SYSTEM_S3",
  visibility: "INTERNAL",
  createdAt: "2026-11-11T06:00:00Z",
};

const baseVideo: MaterialItem = {
  ...baseImage,
  id: "vid-1",
  name: "promo-reel.mp4",
  mimeType: "video/mp4",
  mediaKind: "VIDEO",
  fileSize: 120_000_000,
};

describe("Content Library Media Loading Performance", () => {
  it("requests lightweight WebP thumbnail URL and async decoding on image cards", () => {
    const gridHtml = renderToString(
      createElement(MaterialRepositoryCard, {
        material: baseImage,
        viewMode: "grid",
        canDelete: true,
        canRestore: false,
        onSelect: () => {},
        onDownload: () => {},
        onWatermark: () => {},
        onDelete: () => {},
        onRestore: () => {},
      }),
    );

    expect(gridHtml).toContain("thumbnail=true");
    expect(gridHtml).toContain('decoding="async"');
    expect(gridHtml).toContain('loading="lazy"');

    const listHtml = renderToString(
      createElement(MaterialRepositoryCard, {
        material: baseImage,
        viewMode: "list",
        canDelete: true,
        canRestore: false,
        onSelect: () => {},
        onDownload: () => {},
        onWatermark: () => {},
        onDelete: () => {},
        onRestore: () => {},
      }),
    );
    expect(listHtml).toContain("thumbnail=true");
    expect(listHtml).toContain('decoding="async"');
  });

  it("does not eagerly preload multi-megabyte video streams in grid cards", () => {
    const videoCardHtml = renderToString(
      createElement(MaterialRepositoryCard, {
        material: baseVideo,
        viewMode: "grid",
        canDelete: true,
        canRestore: false,
        onSelect: () => {},
        onDownload: () => {},
        onWatermark: () => {},
        onDelete: () => {},
        onRestore: () => {},
      }),
    );

    expect(videoCardHtml).not.toContain('preload="metadata"');
    expect(videoCardHtml).not.toContain('preload="auto"');
  });
});

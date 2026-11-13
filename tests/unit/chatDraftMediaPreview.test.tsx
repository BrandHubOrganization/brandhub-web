import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatAttachmentDrafts } from "@/pages/chat/components/ChatAttachmentComposer";
import { useChatMediaLightbox } from "@/pages/chat/hooks/useChatMediaLightbox";
import type { ChatAttachmentDraft } from "@/pages/chat/types/chatAttachment";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi", changeLanguage: vi.fn() },
  }),
}));

describe("Chat Draft Media Preview & Lightbox Integration", () => {
  beforeEach(() => {
    useChatMediaLightbox.setState({ isOpen: false, item: null });
  });

  it("renders previewable media thumbnail with hover maximize cue for images and videos", () => {
    const drafts: ChatAttachmentDraft[] = [
      {
        key: "draft-img-1",
        filename: "test-banner.png",
        status: "ready",
        previewUrl: "blob:http://localhost/test-banner.png",
      },
      {
        key: "draft-vid-1",
        filename: "demo-clip.mp4",
        status: "ready",
        previewUrl: "blob:http://localhost/demo-clip.mp4",
      },
    ];

    const mockDraft = {
      items: drafts,
      error: "",
      addFiles: vi.fn(),
      addMaterial: vi.fn(),
      retry: vi.fn(),
      ids: [],
      busy: false,
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const html = renderToString(
      createElement(ChatAttachmentDrafts, {
        draft: mockDraft,
        disabled: false,
      }),
    );

    // Verify hover border and pointer classes are present
    expect(html).toContain("cursor-pointer");
    expect(html).toContain("hover:border-brand-orange/60");
    // Verify image and video elements rendered with previewUrl
    expect(html).toContain("blob:http://localhost/test-banner.png");
    expect(html).toContain("blob:http://localhost/demo-clip.mp4");
  });

  it("renders PDF document card with preview capabilities and PDF styling", () => {
    const drafts: ChatAttachmentDraft[] = [
      {
        key: "draft-pdf-1",
        filename: "project-spec.pdf",
        status: "ready",
        previewUrl: "blob:http://localhost/project-spec.pdf",
      },
      {
        key: "draft-doc-1",
        filename: "notes.docx",
        status: "ready",
      },
    ];

    const mockDraft = {
      items: drafts,
      error: "",
      addFiles: vi.fn(),
      addMaterial: vi.fn(),
      retry: vi.fn(),
      ids: [],
      busy: false,
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const html = renderToString(
      createElement(ChatAttachmentDrafts, {
        draft: mockDraft,
        disabled: false,
      }),
    );

    // PDF should have PDF indicator & hover preview capability
    expect(html).toContain("project-spec.pdf");
    expect(html).toContain("bg-[#e01e5a]");
    expect(html).toContain("notes.docx");
  });

  it("allows openLightbox to store draft items with 'Bản nháp' as senderName", () => {
    const openLightbox = useChatMediaLightbox.getState().openLightbox;
    openLightbox({
      url: "blob:http://localhost/test-banner.png",
      filename: "test-banner.png",
      mimeType: "image/png",
      byteSize: 1024,
      senderName: "Bản nháp",
      sentAt: "Chưa gửi",
    });

    const state = useChatMediaLightbox.getState();
    expect(state.isOpen).toBe(true);
    expect(state.item?.filename).toBe("test-banner.png");
    expect(state.item?.senderName).toBe("Bản nháp");
    expect(state.item?.sentAt).toBe("Chưa gửi");
  });
});

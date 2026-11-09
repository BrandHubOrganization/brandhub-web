import { useState } from "react";
import {
  AtSign,
  Camera,
  Check,
  ClipboardPaste,
  Copy,
  Globe2,
  Music2,
  PanelRightClose,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/types/editor";
import { copyTextToClipboard } from "@/pages/content-writing/contentUtils";
import { PlatformMockup } from "./PlatformMockups";

interface StudioPreviewPanelProps {
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  targetPlatforms: SocialPlatform[];
  onCollapse?: () => void;
}

const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  FACEBOOK: Globe2,
  INSTAGRAM: Camera,
  TIKTOK: Music2,
  THREADS: AtSign,
};

export function StudioPreviewPanel({
  title,
  caption,
  hashtags,
  mediaUrls,
  targetPlatforms,
  onCollapse,
}: StudioPreviewPanelProps) {
  const { t } = useTranslation();
  const platforms =
    targetPlatforms.length > 0
      ? targetPlatforms
      : (["FACEBOOK"] as SocialPlatform[]);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>(
    platforms.includes("INSTAGRAM") ? "INSTAGRAM" : platforms[0],
  );
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [showPasteSandbox, setShowPasteSandbox] = useState(false);
  const [pastedFacebookText, setPastedFacebookText] = useState("");
  const [lastCopiedBuffer, setLastCopiedBuffer] = useState("");

  const combinedCaption = [caption, hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;

  const handleCopyForSocial = async () => {
    const payload = combinedCaption.trim();
    if (!payload) return;
    await copyTextToClipboard(payload);
    setLastCopiedBuffer(payload);
    setCopiedPreview(true);
    toast.success(
      "Đã copy toàn bộ bài viết + hashtag chuẩn Font Unicode! Dán (Ctrl+V) trực tiếp lên Facebook / MXH.",
      { id: "brandhub-editor-toast" },
    );
    setTimeout(() => setCopiedPreview(false), 1800);
  };

  const handlePasteIntoFacebookSandbox = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const clip = await navigator.clipboard.readText();
        if (clip) {
          setPastedFacebookText(clip);
          return;
        }
      }
    } catch {
      // Fallback to lastCopiedBuffer or combinedCaption
    }
    setPastedFacebookText(lastCopiedBuffer || combinedCaption);
  };

  return (
    <section className="border-border bg-card flex max-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden rounded-xl border">
      <div className="border-border flex items-start justify-between gap-2 border-b p-4">
        <div className="flex min-w-0 items-start gap-2">
          <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
            <Smartphone className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-semibold">
              {t("editor.studio.preview.title")}
            </h2>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t("editor.studio.preview.subtitle")}
            </p>
          </div>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Thu gọn Live Preview"
            title="Thu gọn Live Preview"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <PanelRightClose className="size-4" />
          </button>
        )}
      </div>

      <div className="border-border overflow-x-auto border-b p-2">
        <div className="flex min-w-max gap-1">
          {platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => setActivePlatform(platform)}
                className={cn(
                  "text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                  activePlatform === platform &&
                    "bg-brand-orange-soft text-brand-orange",
                )}
              >
                <Icon className="size-3.5" />
                {t(`editor.studio.preview.platforms.${platform}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-muted/50 min-h-0 flex-1 space-y-3 overflow-y-auto p-3 xl:p-4">
        <PlatformMockup
          platform={activePlatform}
          data={{
            title,
            caption: combinedCaption,
            mediaUrls,
            targetPlatforms: platforms,
            authorName: "BrandHub Creator",
          }}
        />

        {/* Quick Copy for Manual Facebook / Social Post (Zantext-style workflow) */}
        <div className="border-border bg-card space-y-2 rounded-xl border p-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              data-testid="studio-preview-copy-btn"
              disabled={!combinedCaption.trim()}
              onClick={handleCopyForSocial}
              className="bg-brand-orange hover:bg-brand-orange/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
              title="Copy toàn bộ bài viết + hashtag đã chuyển đổi Font Unicode (kiểu Zantext) để dán trực tiếp lên Facebook"
            >
              {copiedPreview ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copiedPreview
                  ? "Đã copy chuẩn Font!"
                  : "Copy dán Facebook (Giữ Font)"}
              </span>
            </button>

            <button
              type="button"
              data-testid="studio-facebook-paste-sandbox-toggle"
              onClick={() => setShowPasteSandbox((v) => !v)}
              className="border-border bg-muted/40 hover:bg-muted text-foreground rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors"
              title="Mở ô thử nghiệm dán (Ctrl+V) lên bài đăng Facebook thông thường"
            >
              Thử dán FB
            </button>
          </div>

          {showPasteSandbox && (
            <div className="border-border bg-muted/20 space-y-1.5 rounded-lg border p-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] font-semibold">
                  Ô đăng Facebook thường (Plain-Text):
                </span>
                <button
                  type="button"
                  data-testid="studio-facebook-paste-from-clipboard-btn"
                  onClick={handlePasteIntoFacebookSandbox}
                  className="text-brand-orange flex items-center gap-1 text-[10px] font-bold hover:underline"
                >
                  <ClipboardPaste className="size-3" />
                  Dán từ Clipboard
                </button>
              </div>
              <textarea
                data-testid="studio-facebook-paste-sandbox-input"
                rows={4}
                value={pastedFacebookText}
                onChange={(e) => setPastedFacebookText(e.target.value)}
                placeholder="Nhấn Ctrl+V hoặc bấm 'Dán từ Clipboard' để kiểm chứng font chữ + hashtag giữ nguyên 100% khi dán lên Facebook…"
                className="border-border bg-card text-foreground w-full rounded-lg border p-2 text-xs leading-relaxed focus:outline-hidden"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Segoe UI Symbol", "Noto Sans Math", "Apple Symbols", sans-serif',
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-border text-muted-foreground text-2xs flex items-center justify-between border-t px-4 py-3 font-mono">
        <span>{t("editor.studio.preview.liveBadge")}</span>
        <span>
          {t("editor.studio.preview.stats", {
            words: wordCount,
            characters: caption.length,
          })}
        </span>
      </div>
    </section>
  );
}

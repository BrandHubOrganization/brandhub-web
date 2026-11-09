import { useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Heart,
  Send,
  MoreHorizontal,
  Repeat2,
  Music2,
  AtSign,
  Copy,
  Check,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";
import { copyTextToClipboard } from "../contentUtils";

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "threads";

export interface SocialPreviewProps {
  text: string;
  images: string[];
  authorName?: string;
  authorAvatar?: string | null;
  platform?: SocialPlatform;
}

/** Generic avatar placeholder */
function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/** Truncate text for preview */
function PostText({ text, limit = 300 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) {
    return (
      <p className="text-muted-foreground/50 text-sm italic">
        Nội dung bài viết sẽ hiển thị ở đây…
      </p>
    );
  }
  const trimmed = text.trim();
  const codePoints = Array.from(trimmed);
  const needsTruncation = codePoints.length > limit;
  const display =
    expanded || !needsTruncation
      ? trimmed
      : codePoints.slice(0, limit).join("") + "…";
  return (
    <p
      data-testid="social-preview-text"
      className="text-sm leading-relaxed whitespace-pre-wrap"
      style={{
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Segoe UI Symbol", "Noto Sans Math", "Apple Symbols", sans-serif',
      }}
    >
      {display}
      {needsTruncation && (
        <button
          type="button"
          className="ml-1 font-semibold hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </p>
  );
}

/** Image grid (1-4 images) */
function ImageGrid({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-lg">
        <img
          src={images[0]}
          alt="post"
          className="w-full object-cover"
          style={{ maxHeight: 320 }}
        />
      </div>
    );
  }
  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
        {images.slice(0, 2).map((src, i) => (
          <img
            key={i}
            src={src}
            alt="post"
            className="h-40 w-full object-cover"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
      <img
        src={images[0]}
        alt="post"
        className="row-span-2 h-full w-full object-cover"
        style={{ maxHeight: 200 }}
      />
      {images.slice(1, 3).map((src, i) => (
        <img
          key={i}
          src={src}
          alt="post"
          className="h-24 w-full object-cover"
        />
      ))}
      {images.length > 3 && (
        <div className="relative h-24">
          <img
            src={images[3]}
            alt="post"
            className="h-full w-full object-cover brightness-50"
          />
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
            +{images.length - 3}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Facebook Preview ─────────────────────────────────────────────────── */
function FacebookPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: SocialPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white text-[#1c1e21] shadow-sm dark:border-[#3a3b3c] dark:bg-[#242526] dark:text-[#e4e6eb]">
      {/* Header */}
      <div className="flex items-start gap-2 p-3">
        <Avatar name={authorName ?? "BrandHub"} src={authorAvatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-semibold">
            {authorName ?? "BrandHub Creator"}
          </p>
          <p className="text-[11px] text-[#65676b] dark:text-[#b0b3b8]">
            Vừa xong · 🌐
          </p>
        </div>
        <MoreHorizontal className="size-5 flex-shrink-0 text-[#65676b]" />
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        <PostText text={text} />
      </div>
      {images.length > 0 && <ImageGrid images={images} />}

      {/* Reactions bar */}
      <div className="mt-2 flex items-center justify-between border-t px-3 py-1 text-[12px] text-[#65676b] dark:border-[#3a3b3c] dark:text-[#b0b3b8]">
        <span className="flex items-center gap-1">
          <span className="text-base">👍❤️😮</span> 247
        </span>
        <span>38 bình luận · 12 lượt chia sẻ</span>
      </div>

      {/* Action buttons */}
      <div className="flex border-t dark:border-[#3a3b3c]">
        {[
          { icon: ThumbsUp, label: "Thích" },
          { icon: MessageCircle, label: "Bình luận" },
          { icon: Share2, label: "Chia sẻ" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#65676b] transition-colors hover:bg-[#f2f2f2] dark:text-[#b0b3b8] dark:hover:bg-[#3a3b3c]"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Instagram Preview ────────────────────────────────────────────────── */
function InstagramPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: SocialPreviewProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-white font-[system-ui] text-[#262626] shadow-sm dark:border-[#262626] dark:bg-black dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
          <div className="rounded-full bg-white p-0.5 dark:bg-black">
            <Avatar
              name={authorName ?? "BrandHub"}
              src={authorAvatar}
              size={32}
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[13px] leading-tight font-semibold">
            {authorName?.toLowerCase().replace(/\s/g, "_") ??
              "brandhub_creator"}
          </p>
          <p className="text-[11px] text-[#8e8e8e]">Được tài trợ</p>
        </div>
        <MoreHorizontal className="size-5 flex-shrink-0 text-[#262626] dark:text-white" />
      </div>

      {/* Image */}
      {images.length > 0 ? (
        <div className="aspect-square overflow-hidden bg-black">
          <img
            src={images[0]}
            alt="post"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="from-muted/30 to-muted/60 flex aspect-square items-center justify-center bg-gradient-to-br">
          <p className="text-muted-foreground text-xs">Ảnh bài viết</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center p-3">
        <div className="flex flex-1 items-center gap-3">
          <button type="button" onClick={() => setLiked((v) => !v)}>
            <Heart
              className={`size-6 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
          <MessageCircle className="size-6" />
          <Send className="size-6" />
        </div>
        <button type="button" onClick={() => setSaved((v) => !v)}>
          <Bookmark
            className={`size-6 transition-colors ${saved ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1 text-[13px] font-semibold">
        {liked ? "Bạn và 1.247 người khác" : "1.246 lượt thích"}
      </div>

      {/* Caption */}
      <div className="px-3 pb-3 text-[13px]">
        <span className="mr-1 font-semibold">
          {authorName?.toLowerCase().replace(/\s/g, "_") ?? "brandhub_creator"}
        </span>
        <PostText text={text} limit={150} />
      </div>
    </div>
  );
}

/* ─── TikTok Preview ───────────────────────────────────────────────────── */
function TikTokPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: SocialPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Avatar
            name={authorName ?? "BrandHub"}
            src={authorAvatar}
            size={32}
          />
          <div>
            <p className="text-xs font-semibold">
              @{authorName?.toLowerCase().replace(/\s+/g, "") ?? "brandhub"}
            </p>
            <p className="flex items-center gap-1 text-[10px] text-slate-400">
              <Music2 className="size-3" /> Âm thanh gốc - BrandHub
            </p>
          </div>
        </div>
        <span className="rounded bg-[#FE2C55] px-2 py-0.5 text-[10px] font-bold text-white">
          Follow
        </span>
      </div>

      {images.length > 0 && (
        <div className="aspect-video overflow-hidden bg-black">
          <img
            src={images[0]}
            alt="TikTok"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-3 text-slate-100">
        <PostText text={text} limit={220} />
      </div>

      <div className="flex items-center justify-around border-t border-slate-800 py-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Heart className="size-4 text-[#FE2C55]" /> 12.4K
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="size-4" /> 342
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="size-4" /> 1.2K
        </span>
        <span className="flex items-center gap-1">
          <Share2 className="size-4" /> 89
        </span>
      </div>
    </div>
  );
}

/* ─── Threads Preview ──────────────────────────────────────────────────── */
function ThreadsPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: SocialPreviewProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-white p-3 text-[#0f1419] shadow-sm dark:border-[#2f3336] dark:bg-black dark:text-white">
      <div className="flex gap-3">
        <Avatar name={authorName ?? "BrandHub"} src={authorAvatar} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[14px] font-bold">
              {authorName?.toLowerCase().replace(/\s/g, "_") ?? "brandhub"}
            </span>
            <AtSign className="size-3.5 text-[#536471]" />
            <span className="text-[12px] text-[#536471]">· 1m</span>
          </div>

          <div className="mt-1 text-[14px] leading-5">
            <PostText text={text} limit={500} />
          </div>

          {images.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl">
              <ImageGrid images={images} />
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-[#536471]">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? "fill-pink-500 text-pink-500" : ""
              }`}
            >
              <Heart className="size-4" />
            </button>
            <MessageCircle className="size-4" />
            <Repeat2 className="size-4" />
            <Send className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main SocialPreview (4 Canonical BrandHub Platforms) ──────────────── */
const PLATFORMS: { id: SocialPlatform; label: string; color: string }[] = [
  { id: "facebook", label: "Facebook", color: "bg-[#1877F2] text-white" },
  {
    id: "instagram",
    label: "Instagram",
    color:
      "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white",
  },
  { id: "tiktok", label: "TikTok", color: "bg-slate-950 text-white" },
  { id: "threads", label: "Threads", color: "bg-zinc-900 text-white" },
];

export function SocialPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: Omit<SocialPreviewProps, "platform">) {
  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [showPasteSandbox, setShowPasteSandbox] = useState(false);
  const [pastedFacebookText, setPastedFacebookText] = useState("");
  const [lastCopiedBuffer, setLastCopiedBuffer] = useState("");

  const handleCopyForSocial = async () => {
    if (!text) return;
    await copyTextToClipboard(text);
    setLastCopiedBuffer(text);
    setCopiedPreview(true);
    toast.success(
      "Đã copy toàn bộ bài viết chuẩn Font Unicode! Dán (Ctrl+V) trực tiếp lên Facebook / MXH.",
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
      // Fallback to lastCopiedBuffer or current text
    }
    setPastedFacebookText(lastCopiedBuffer || text);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Platform tabs */}
      <div className="flex gap-1">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
              platform === p.id
                ? p.color + " shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Preview card */}
      <div className="min-h-40">
        {platform === "facebook" && (
          <FacebookPreview
            text={text}
            images={images}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        )}
        {platform === "instagram" && (
          <InstagramPreview
            text={text}
            images={images}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        )}
        {platform === "tiktok" && (
          <TikTokPreview
            text={text}
            images={images}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        )}
        {platform === "threads" && (
          <ThreadsPreview
            text={text}
            images={images}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        )}
      </div>

      {/* Character count for Threads */}
      {platform === "threads" && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <span
            className={
              text.length > 500
                ? "font-semibold text-red-500"
                : "text-muted-foreground"
            }
          >
            {text.length} / 500
          </span>
          {text.length > 500 && (
            <span className="text-[11px] text-red-500">
              Vượt quá giới hạn Threads
            </span>
          )}
        </div>
      )}

      {/* Quick Copy for Manual Facebook / Social Post (Zantext-style workflow) */}
      <div className="border-border bg-card space-y-2 rounded-xl border p-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            data-testid="social-preview-copy-btn"
            disabled={!text.trim()}
            onClick={handleCopyForSocial}
            className="bg-brand-orange hover:bg-brand-orange/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
            title="Copy toàn bộ văn bản đã chuyển đổi Font Unicode (kiểu Zantext) để dán trực tiếp lên Facebook"
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
            data-testid="facebook-paste-sandbox-toggle"
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
                data-testid="facebook-paste-from-clipboard-btn"
                onClick={handlePasteIntoFacebookSandbox}
                className="text-brand-orange flex items-center gap-1 text-[10px] font-bold hover:underline"
              >
                <ClipboardPaste className="size-3" />
                Dán từ Clipboard
              </button>
            </div>
            <textarea
              data-testid="facebook-paste-sandbox-input"
              rows={4}
              value={pastedFacebookText}
              onChange={(e) => setPastedFacebookText(e.target.value)}
              placeholder="Nhấn Ctrl+V hoặc bấm 'Dán từ Clipboard' để kiểm chứng font chữ giữ nguyên 100% khi dán lên Facebook…"
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
  );
}

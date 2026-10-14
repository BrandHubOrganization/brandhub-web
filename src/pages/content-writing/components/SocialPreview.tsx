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
  BarChart2,
} from "lucide-react";

export type SocialPlatform = "facebook" | "instagram" | "twitter";

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
  const needsTruncation = trimmed.length > limit;
  const display = expanded || !needsTruncation ? trimmed : trimmed.slice(0, limit) + "…";
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
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
        <img key={i} src={src} alt="post" className="h-24 w-full object-cover" />
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
    <div className="rounded-xl border bg-white dark:bg-[#242526] dark:border-[#3a3b3c] shadow-sm overflow-hidden text-[#1c1e21] dark:text-[#e4e6eb]">
      {/* Header */}
      <div className="flex items-start gap-2 p-3">
        <Avatar name={authorName ?? "BrandHub"} src={authorAvatar} size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{authorName ?? "BrandHub Creator"}</p>
          <p className="text-[11px] text-[#65676b] dark:text-[#b0b3b8]">
            Vừa xong · 🌐
          </p>
        </div>
        <MoreHorizontal className="size-5 text-[#65676b] flex-shrink-0" />
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        <PostText text={text} />
      </div>
      {images.length > 0 && <ImageGrid images={images} />}

      {/* Reactions bar */}
      <div className="flex items-center justify-between px-3 py-1 text-[12px] text-[#65676b] dark:text-[#b0b3b8] border-t dark:border-[#3a3b3c] mt-2">
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
            className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#65676b] dark:text-[#b0b3b8] hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] transition-colors"
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
    <div className="rounded-xl border bg-white dark:bg-black dark:border-[#262626] shadow-sm overflow-hidden text-[#262626] dark:text-white font-[system-ui]">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <div className="rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
          <div className="rounded-full bg-white dark:bg-black p-0.5">
            <Avatar name={authorName ?? "BrandHub"} src={authorAvatar} size={32} />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[13px] leading-tight">{authorName?.toLowerCase().replace(/\s/g, "_") ?? "brandhub_creator"}</p>
          <p className="text-[11px] text-[#8e8e8e]">Được tài trợ</p>
        </div>
        <MoreHorizontal className="size-5 text-[#262626] dark:text-white flex-shrink-0" />
      </div>

      {/* Image */}
      {images.length > 0 ? (
        <div className="aspect-square overflow-hidden bg-black">
          <img src={images[0]} alt="post" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
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
        <span className="font-semibold mr-1">
          {authorName?.toLowerCase().replace(/\s/g, "_") ?? "brandhub_creator"}
        </span>
        <PostText text={text} limit={150} />
      </div>
    </div>
  );
}

/* ─── Twitter / X Preview ─────────────────────────────────────────────── */
function TwitterPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: SocialPreviewProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="rounded-xl border bg-white dark:bg-black dark:border-[#2f3336] shadow-sm overflow-hidden text-[#0f1419] dark:text-white p-3">
      <div className="flex gap-3">
        <Avatar name={authorName ?? "BrandHub"} src={authorAvatar} size={40} />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[15px]">{authorName ?? "BrandHub Creator"}</span>
            <span className="text-[#536471] text-[14px]">
              @{authorName?.toLowerCase().replace(/\s/g, "") ?? "brandhub"} · 1s
            </span>
          </div>

          {/* Text */}
          <div className="mt-0.5 text-[15px] leading-5">
            <PostText text={text} limit={280} />
          </div>

          {/* Image */}
          {images.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden">
              <ImageGrid images={images} />
            </div>
          )}

          {/* Action bar */}
          <div className="mt-3 flex items-center justify-between text-[#536471]">
            {[
              { icon: MessageCircle, count: "24" },
              { icon: Repeat2, count: "8" },
              {
                icon: Heart,
                count: liked ? "1.3K" : "1.2K",
                onClick: () => setLiked((v) => !v),
                active: liked,
                activeColor: "text-pink-500 fill-pink-500",
              },
              { icon: BarChart2, count: "12K" },
              { icon: Bookmark, count: "" },
              { icon: Share2, count: "" },
            ].map(({ icon: Icon, count, onClick, active, activeColor }, i) => (
              <button
                key={i}
                type="button"
                className={`flex items-center gap-1 text-xs hover:text-blue-500 transition-colors ${active ? (activeColor ?? "") : ""}`}
                onClick={onClick}
              >
                <Icon className="size-4" />
                {count && <span>{count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main SocialPreview ────────────────────────────────────────────────── */
const PLATFORMS: { id: SocialPlatform; label: string; color: string }[] = [
  { id: "facebook", label: "Facebook", color: "bg-[#1877F2] text-white" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white" },
  { id: "twitter", label: "X / Twitter", color: "bg-black text-white" },
];

export function SocialPreview({
  text,
  images,
  authorName,
  authorAvatar,
}: Omit<SocialPreviewProps, "platform">) {
  const [platform, setPlatform] = useState<SocialPlatform>("facebook");

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Platform tabs */}
      <div className="flex gap-1.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
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
          <FacebookPreview text={text} images={images} authorName={authorName} authorAvatar={authorAvatar} />
        )}
        {platform === "instagram" && (
          <InstagramPreview text={text} images={images} authorName={authorName} authorAvatar={authorAvatar} />
        )}
        {platform === "twitter" && (
          <TwitterPreview text={text} images={images} authorName={authorName} authorAvatar={authorAvatar} />
        )}
      </div>

      {/* Character count for Twitter */}
      {platform === "twitter" && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <span className={text.length > 280 ? "text-red-500 font-semibold" : "text-muted-foreground"}>
            {text.length} / 280
          </span>
          {text.length > 280 && (
            <span className="text-red-500 text-[11px]">Vượt quá giới hạn X/Twitter</span>
          )}
        </div>
      )}
    </div>
  );
}

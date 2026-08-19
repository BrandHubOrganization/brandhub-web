import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Globe,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reaction } from "../ReactionPicker";

interface FacebookPostProps {
  className?: string;
  authorName?: string;
  authorRole?: string;
  content?: string;
  likes?: ReactNode;
  comments?: ReactNode;
  shares?: ReactNode;
  /** Ảnh link preview card — nếu có sẽ thay thế placeholder gradient. */
  imageUrl?: string;
  /** Reaction đã chọn (like/love/haha/wow/sad/angry) — đổi icon+màu nút Thích, persist sau khi picker đóng. */
  activeReaction?: Reaction | null;
  /** Đã chia sẻ chưa — true thì icon+label nút Chia sẻ đổi màu xanh, persist. */
  shared?: boolean;
}

/**
 * Mockup màn hình Facebook post.
 * Layout: avatar + name/role, globe time, text content, link preview card, like bar.
 */
export function FacebookPost({
  className,
  authorName,
  authorRole,
  content,
  likes = "2.3K",
  comments = "342",
  shares = "89",
  imageUrl,
  activeReaction,
  shared,
}: FacebookPostProps) {
  const { t } = useTranslation();
  const resolvedAuthorName =
    authorName ?? t("landing.heroFeed.facebook.0.authorName");
  const resolvedAuthorRole =
    authorRole ?? t("landing.heroFeed.facebook.0.authorRole");
  const resolvedContent = content ?? t("landing.heroFeed.facebook.0.content");
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-55 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60 sm:max-w-107.5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/70",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-4 pt-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
          MN
        </div>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {resolvedAuthorName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {resolvedAuthorRole}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>{t("landing.heroFeed.ui.timeAgoHours2")}</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <Globe className="size-2.5" />
          </div>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* Text content */}
      <div className="px-4 pt-2.5">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {resolvedContent}
        </p>
      </div>

      {/* Link preview card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="from-brand-orange relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br via-orange-600 to-blue-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="BrandHub"
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="relative text-center">
              <div className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="relative mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/30 backdrop-blur">
                <span className="text-xl font-black text-white">B</span>
              </div>
              <p className="relative text-sm font-bold text-white">
                {t("landing.heroFeed.ui.sourceSite")}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {t("landing.heroFeed.ui.linkPreviewTitle")}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {t("landing.heroFeed.ui.linkPreviewDesc")}
          </p>
        </div>
      </div>

      {/* Like bar */}
      <div className="mx-4 mt-2.5 flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-700/50">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-900">
              <ThumbsUp className="size-2.5 fill-white text-white" />
            </span>
            <span className="flex size-5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900">
              <Heart className="size-2.5 fill-white text-white" />
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {likes}
          </span>
        </div>
        <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {comments} {t("landing.heroFeed.ui.commentsSuffix")}
          </span>
          <span>
            {shares} {t("landing.heroFeed.ui.sharesSuffix")}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between px-2 py-1.5">
        {activeReaction ? (
          <button
            data-cursor-target="like"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            style={{ color: activeReaction.color }}
          >
            <activeReaction.icon
              className="size-[15px]"
              fill={activeReaction.color}
            />
            {activeReaction.label}
          </button>
        ) : (
          <FBActionBtn
            dataTarget="like"
            icon={ThumbsUp}
            label={t("landing.heroFeed.ui.like")}
          />
        )}
        <FBActionBtn
          dataTarget="comment"
          icon={MessageCircle}
          label={t("landing.heroFeed.ui.comment")}
        />
        <FBActionBtn
          dataTarget="share"
          icon={Share2}
          label={t("landing.heroFeed.ui.share")}
          active={shared}
        />
      </div>
    </div>
  );
}

function FBActionBtn({
  icon: Icon,
  label,
  dataTarget,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dataTarget?: string;
  active?: boolean;
}) {
  return (
    <button
      data-cursor-target={dataTarget}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        active
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-zinc-500 dark:text-zinc-400"
      }`}
    >
      <Icon
        className={`size-[18px] ${active ? "fill-emerald-100 dark:fill-emerald-900/40" : ""}`}
      />
      {label}
    </button>
  );
}

export default FacebookPost;

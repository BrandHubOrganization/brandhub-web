import type { ReactNode } from "react";
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
  authorName = "Minh Nguyễn",
  authorRole = "Content Director, VCorp Media",
  content = "Dùng BrandHub team tôi cắt thời gian tạo content từ 3 ngày xuống còn 2 giờ. Game changer cho mọi agency! Tự động publish đa kênh, AI hỗ trợ viết bài, calendar kéo thả trực quan.",
  likes = "2.3K",
  comments = "342",
  shares = "89",
  imageUrl,
  activeReaction,
  shared,
}: FacebookPostProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[430px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/70",
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
            {authorName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {authorRole}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>2 giờ</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <Globe className="size-2.5" />
          </div>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* Text content */}
      <div className="px-4 pt-2.5">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {content}
        </p>
      </div>

      {/* Link preview card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex h-44 items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-orange-50 to-blue-100 dark:from-blue-950/20 dark:via-orange-950/20 dark:to-blue-950/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="BrandHub"
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-white/70 shadow-sm backdrop-blur dark:bg-zinc-800/70">
                <ThumbsUp className="size-5 text-blue-500" />
              </div>
              <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                brandhub.vn
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            BrandHub — Nền tảng quản lý nội dung thương hiệu toàn diện
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Lên kế hoạch, sáng tạo, lên lịch và xuất bản nội dung đa kênh trên
            một nền tảng duy nhất.
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
          <span>{comments} bình luận</span>
          <span>{shares} chia sẻ</span>
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
          <FBActionBtn dataTarget="like" icon={ThumbsUp} label="Thích" />
        )}
        <FBActionBtn
          dataTarget="comment"
          icon={MessageCircle}
          label="Bình luận"
        />
        <FBActionBtn
          dataTarget="share"
          icon={Share2}
          label="Chia sẻ"
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

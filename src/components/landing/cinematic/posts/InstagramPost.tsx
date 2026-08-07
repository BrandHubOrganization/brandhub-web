import type { ReactNode } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramPostProps {
  className?: string;
  caption?: string;
  likes?: ReactNode;
  comments?: ReactNode;
  /** Ảnh bài đăng — nếu có sẽ thay thế placeholder gradient. */
  imageUrl?: string;
  /** Đã like chưa — true thì icon tim đổi màu đỏ + fill, persist. */
  liked?: boolean;
  /** Đã lưu chưa — true thì icon bookmark đổi màu đen + fill, persist. */
  saved?: boolean;
}

/**
 * Mockup màn hình Instagram post.
 * Layout: avatar tròn gradient, ảnh 1:1, action bar, caption.
 * Dùng trong CinematicHero — GSAP animate scroll sequence.
 */
export function InstagramPost({
  className,
  caption = "Nền tảng quản lý content đa kênh số 1 cho agency & brand. Tự động hóa toàn bộ workflow sáng tạo → xuất bản.",
  likes = "2,384",
  comments = "156",
  imageUrl,
  liked,
  saved,
}: InstagramPostProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-700/50 dark:bg-zinc-900 dark:shadow-zinc-950/60",
        className,
      )}
    >
      {/* Header: avatar + username */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 via-orange-500 to-pink-500 p-[2px]">
          <div className="flex size-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            BH
          </div>
        </div>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            brandhub_vn
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            2 giờ trước
          </p>
        </div>
        <MoreHorizontal className="size-4 text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* Image 1:1 */}
      {imageUrl ? (
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt="BrandHub Campaign"
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative flex aspect-square items-center justify-center bg-linear-to-br from-orange-500 via-pink-500 to-purple-600">
          <div className="absolute top-1/4 left-1/4 size-32 rounded-full bg-yellow-300/30 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 size-24 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 size-28 rounded-full bg-white/20 blur-3xl" />
          <div className="relative text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/30 backdrop-blur">
              <span className="text-2xl font-black text-white">B</span>
            </div>
            <p className="text-sm font-bold tracking-wide text-white">
              BrandHub Campaign
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-white/70">
              Multi-channel content
            </p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex gap-3.5">
          <Heart
            data-cursor-target="like"
            className={`size-[22px] cursor-pointer transition-colors ${
              liked
                ? "fill-red-500 text-red-500"
                : "text-zinc-800 hover:text-red-500 dark:text-zinc-200"
            }`}
          />
          <MessageCircle
            data-cursor-target="comment"
            className="size-[22px] cursor-pointer text-zinc-800 dark:text-zinc-200"
          />
          <Send
            data-cursor-target="share"
            className="size-[20px] cursor-pointer text-zinc-800 dark:text-zinc-200"
          />
        </div>
        <Bookmark
          data-cursor-target="save"
          className={`size-[20px] cursor-pointer transition-colors ${
            saved
              ? "fill-zinc-900 text-zinc-900 dark:fill-zinc-100 dark:text-zinc-100"
              : "text-zinc-800 dark:text-zinc-200"
          }`}
        />
      </div>

      {/* Likes */}
      <p className="px-3.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {likes} lượt thích
      </p>

      {/* Caption */}
      <div className="px-3.5 pt-1 pb-3.5">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <span className="mr-1 font-semibold text-zinc-900 dark:text-zinc-100">
            brandhub_vn
          </span>
          {caption}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
          Xem tất cả {comments} bình luận
        </p>
      </div>
    </div>
  );
}

export default InstagramPost;

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music4,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TikTokPostProps {
  className?: string;
  caption?: string;
  likes?: string;
  comments?: string;
  shares?: string;
}

/**
 * Mockup màn hình TikTok video post.
 * Layout dọc 9:16, right sidebar icons, overlay caption + music bottom-left.
 * Tông đen + cyan/đỏ neon đặc trưng.
 */
export function TikTokPost({
  className,
  caption = "Lên lịch content tự động với BrandHub AI #contentcreator #brandhub",
  likes = "45.2K",
  comments = "1.2K",
  shares = "8.4K",
}: TikTokPostProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl bg-black shadow-2xl shadow-zinc-800/30 dark:shadow-black/60",
        className,
      )}
      style={{ aspectRatio: "9/16" }}
    >
      {/* Video background */}
      <div className="absolute inset-0 bg-linear-to-b from-zinc-900 via-zinc-950 to-black">
        <div className="absolute top-1/3 left-1/2 size-40 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-1/3 size-32 rounded-full bg-red-500/10 blur-3xl" />

        {/* Center play */}
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Play className="ml-0.5 size-6 text-white" fill="white" />
          </div>
          <p className="text-[10px] font-medium text-white/50">@brandhub_vn</p>
        </div>

        {/* Bottom-left: user + caption + music */}
        <div className="absolute right-16 bottom-0 left-0 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-500 text-[10px] font-bold text-white">
              BH
            </div>
            <p className="text-sm font-semibold text-white">@brandhub_vn</p>
          </div>
          <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-white/90">
            {caption}
          </p>
          <div className="flex items-center gap-1.5">
            <Music4 className="size-3 text-white/60" />
            <p className="text-[11px] text-white/60">
              original sound - BrandHub
            </p>
          </div>
        </div>

        {/* Right sidebar actions */}
        <div className="absolute right-2 bottom-4 flex flex-col items-center gap-5">
          <div className="relative flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-500 ring-2 ring-white/20">
            <span className="text-xs font-bold text-white">BH</span>
            <div className="absolute -bottom-1 left-1/2 flex size-4 -translate-x-1/2 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-black">
              +
            </div>
          </div>
          <TikTokAction icon={Heart} label={likes} />
          <TikTokAction icon={MessageCircle} label={comments} />
          <TikTokAction icon={Share2} label={shares} />
          <TikTokAction icon={Bookmark} label="Lưu" />
        </div>

        {/* Top tabs */}
        <div className="absolute top-0 right-0 left-0 flex items-center gap-2 px-3 pt-3">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur">
            Đang follow
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur">
            Dành cho bạn
          </span>
        </div>
      </div>
    </div>
  );
}

function TikTokAction({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
        <Icon className="size-[18px] text-white" />
      </div>
      <span className="text-[10px] font-medium text-white/80">{label}</span>
    </div>
  );
}

export default TikTokPost;

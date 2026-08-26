import { PlayCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { PLATFORM_LIMITS } from "@/types/preview";
import type { PostPreviewData } from "@/types/preview";

interface MockupProps {
  data: PostPreviewData;
}

export function YouTubeMockup({ data }: MockupProps) {
  const {
    caption,
    mediaUrls = [],
    authorName = "BrandHub Official",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  } = data;
  const defaultMedia =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const mediaSrc = mediaUrls[0] || defaultMedia;
  const config = PLATFORM_LIMITS.YOUTUBE;

  return (
    <div className="mx-auto max-w-md space-y-2">
      <div
        className={`bg-muted relative w-full overflow-hidden rounded-xl ${config.aspectRatioClass}`}
      >
        <img
          src={mediaSrc}
          alt="Video thumbnail"
          className="h-full w-full object-cover"
        />
        <PlayCircle className="absolute inset-0 m-auto size-12 text-white drop-shadow-lg" />
      </div>
      <div className="flex items-start gap-2.5">
        <img
          src={authorAvatar}
          alt="avatar"
          className="size-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-foreground line-clamp-2 text-sm font-semibold">
            {data.title || caption.slice(0, 60)}
          </p>
          <p className="text-muted-foreground text-xs">{authorName}</p>
          <p className="text-foreground mt-1 line-clamp-2 text-xs whitespace-pre-wrap">
            {caption}
          </p>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center gap-4 pl-11 text-xs">
        <span className="flex items-center gap-1">
          <ThumbsUp className="size-3.5" /> 1.2K
        </span>
        <span className="flex items-center gap-1">
          <ThumbsDown className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

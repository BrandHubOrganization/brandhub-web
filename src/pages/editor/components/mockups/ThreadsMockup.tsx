import { Heart, MessageCircle, Repeat2, Send, AtSign } from "lucide-react";
import { PLATFORM_LIMITS } from "@/types/preview";
import type { PostPreviewData } from "@/types/preview";

interface MockupProps {
  data: PostPreviewData;
}

export function ThreadsMockup({ data }: MockupProps) {
  const {
    caption,
    mediaUrls = [],
    authorName = "BrandHub Official",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  } = data;
  const defaultMedia =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const mediaSrc = mediaUrls[0] || defaultMedia;
  const config = PLATFORM_LIMITS.THREADS;

  return (
    <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
      <div className="flex items-start gap-2.5">
        <img
          src={authorAvatar}
          alt="avatar"
          className="size-8 rounded-full object-cover"
        />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground text-xs font-semibold">
              {authorName.toLowerCase().replace(/\s+/g, "")}
            </span>
            <AtSign className="text-muted-foreground size-3" />
          </div>
          <p className="text-foreground text-xs whitespace-pre-wrap">
            {caption}
          </p>
          {mediaUrls.length > 0 && (
            <div
              className={`bg-muted w-full overflow-hidden rounded-xl ${config.aspectRatioClass}`}
            >
              <img
                src={mediaSrc}
                alt="Post content"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-4 pt-1">
            <Heart className="size-4 cursor-pointer hover:text-rose-500" />
            <MessageCircle className="hover:text-foreground size-4 cursor-pointer" />
            <Repeat2 className="hover:text-foreground size-4 cursor-pointer" />
            <Send className="hover:text-foreground size-4 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}

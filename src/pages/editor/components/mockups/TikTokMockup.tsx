import { Heart, MessageCircle, Bookmark } from "lucide-react";
import type { PostPreviewData } from "@/types/preview";

interface MockupProps {
  data: PostPreviewData;
}

export function TikTokMockup({ data }: MockupProps) {
  const {
    caption,
    mediaUrls = [],
    authorName = "BrandHub Official",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  } = data;
  const defaultMedia =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const mediaSrc = mediaUrls[0] || defaultMedia;

  return (
    <div className="relative mx-auto aspect-[9/16] max-w-[280px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
      <img
        src={mediaSrc}
        alt="TikTok"
        className="h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      <div className="absolute right-3 bottom-12 flex flex-col items-center gap-4 text-xs">
        <div className="size-10 overflow-hidden rounded-full border-2 border-white">
          <img
            src={authorAvatar}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center">
          <Heart className="size-6 fill-white" />
          <span>12.4K</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="size-6 fill-white" />
          <span>342</span>
        </div>
        <div className="flex flex-col items-center">
          <Bookmark className="size-6 fill-white" />
          <span>1.2K</span>
        </div>
      </div>

      <div className="absolute right-14 bottom-4 left-3 space-y-1">
        <h5 className="text-xs font-semibold text-white">
          @{authorName.toLowerCase().replace(/\s+/g, "")}
        </h5>
        <p className="text-2xs line-clamp-2 text-slate-200">{caption}</p>
      </div>
    </div>
  );
}

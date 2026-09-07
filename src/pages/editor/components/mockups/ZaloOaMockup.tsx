import { MessageCircle } from "lucide-react";
import { PLATFORM_LIMITS } from "@/types/preview";
import type { PostPreviewData } from "@/types/preview";

interface MockupProps {
  data: PostPreviewData;
}

export function ZaloOaMockup({ data }: MockupProps) {
  const { caption, mediaUrls = [], authorName = "BrandHub Official" } = data;
  const defaultMedia =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const mediaSrc = mediaUrls[0] || defaultMedia;
  const config = PLATFORM_LIMITS.ZALO_OA;

  return (
    <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
          <MessageCircle className="size-4" />
        </div>
        <div>
          <span className="text-foreground block text-xs font-semibold">
            {authorName}
          </span>
          <span className="text-muted-foreground text-2xs">Zalo OA</span>
        </div>
      </div>
      <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3">
        {mediaUrls.length > 0 && (
          <div
            className={`bg-muted w-full overflow-hidden rounded-lg ${config.aspectRatioClass}`}
          >
            <img
              src={mediaSrc}
              alt="Zalo OA content"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-foreground text-xs whitespace-pre-wrap">{caption}</p>
      </div>
    </div>
  );
}

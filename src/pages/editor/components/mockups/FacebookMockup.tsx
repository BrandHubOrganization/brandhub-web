import {
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PLATFORM_LIMITS } from "@/types/preview";
import type { PostPreviewData } from "@/types/preview";

interface MockupProps {
  data: PostPreviewData;
}

export function FacebookMockup({ data }: MockupProps) {
  const { t } = useTranslation();
  const {
    caption,
    mediaUrls = [],
    authorName = "BrandHub Official",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  } = data;
  const mediaSrc = mediaUrls[0];
  const config = PLATFORM_LIMITS.FACEBOOK;

  return (
    <div className="border-border bg-card mx-auto max-w-md overflow-hidden rounded-xl border shadow-xs">
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2.5">
          <img
            src={authorAvatar}
            alt="avatar"
            className="border-border size-10 rounded-full border object-cover"
          />
          <div>
            <h4 className="text-foreground text-sm font-semibold">
              {authorName}
            </h4>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              {t("editor.mockup.justNow")} · <Globe className="size-3" />
            </p>
          </div>
        </div>
        <MoreHorizontal className="text-muted-foreground size-5" />
      </div>

      <p className="text-foreground px-3.5 pb-3 text-sm whitespace-pre-wrap">
        {caption}
      </p>

      {mediaUrls.length === 1 && (
        <div
          className={`bg-muted w-full overflow-hidden ${config.aspectRatioClass}`}
        >
          <img
            src={mediaSrc}
            alt="Post content"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {mediaUrls.length > 1 && (
        <div className="grid grid-cols-2 gap-0.5 bg-muted">
          {mediaUrls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={`overflow-hidden ${
                mediaUrls.length === 3 && idx === 0 ? "col-span-2 h-44" : "h-36"
              }`}
            >
              <img
                src={url}
                alt={`Post content ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="border-border text-muted-foreground flex items-center justify-between border-t p-3 text-xs font-medium">
        <button className="flex items-center gap-1.5 hover:text-blue-600">
          <ThumbsUp className="size-4" /> {t("editor.mockup.like")}
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-600">
          <MessageCircle className="size-4" /> {t("editor.mockup.comment")}
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-600">
          <Share2 className="size-4" /> {t("editor.mockup.share")}
        </button>
      </div>
    </div>
  );
}

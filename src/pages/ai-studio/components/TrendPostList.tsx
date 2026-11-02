import { useTranslation } from "react-i18next";
import { ExternalLink, Heart, MessageCircle, Share2 } from "lucide-react";
import { PLATFORM_LABEL, type TrendPost } from "@/services/trendService";

/** FR 3.7.1 hover popup & detail post list: the posts behind a trend, most-liked first. */
export function TrendPostList({
  keyword,
  posts,
  samplePosts = [],
}: {
  keyword: string;
  posts: TrendPost[];
  samplePosts?: string[];
}) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language, { notation: "compact" });
  const formatPostedAt = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  };

  const displayCount = posts.length > 0 ? posts.length : samplePosts.length;
  if (displayCount === 0) return null;

  return (
    <div>
      <div className="border-border bg-muted/20 flex items-center justify-between border-b px-4 py-2.5">
        <p className="text-foreground text-sm font-semibold">
          {t("aiStudio.trends.posts.title", { count: displayCount, keyword })}
        </p>
      </div>
      {posts.length > 0 ? (
        <ol className="divide-border max-h-96 divide-y overflow-y-auto">
          {posts.map((post, i) => {
            const postedDate = formatPostedAt(post.postedAt);
            const platformLabel = post.source
              ? (PLATFORM_LABEL[post.source.toLowerCase()] ??
                PLATFORM_LABEL[post.source] ??
                post.source)
              : null;

            return (
              <li
                key={post.url ?? i}
                className="hover:bg-muted/20 space-y-2 px-4 py-3 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-foreground max-w-[200px] truncate font-semibold sm:max-w-xs">
                    {post.author ?? t("aiStudio.trends.posts.unknownAuthor")}
                  </span>
                  {platformLabel && (
                    <span className="border-border bg-muted/60 text-muted-foreground rounded-full border px-2 py-0.5 text-[11px] font-medium">
                      {platformLabel}
                    </span>
                  )}
                  {postedDate && (
                    <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                      · {postedDate}
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 line-clamp-3 text-xs leading-relaxed sm:text-[13px]">
                  {post.text}
                </p>
                <div className="text-muted-foreground flex items-center gap-3.5 pt-0.5 font-mono text-xs tabular-nums">
                  <span
                    className="flex items-center gap-1"
                    title={t("aiStudio.trends.posts.likes")}
                  >
                    <Heart className="size-3.5" /> {number.format(post.likes)}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("aiStudio.trends.posts.comments")}
                  >
                    <MessageCircle className="size-3.5" />{" "}
                    {number.format(post.comments)}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("aiStudio.trends.posts.shares")}
                  >
                    <Share2 className="size-3.5" /> {number.format(post.shares)}
                  </span>
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange ml-auto inline-flex items-center gap-1 font-sans text-xs font-medium underline-offset-2 hover:underline"
                    >
                      {t("aiStudio.trends.posts.open")}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="divide-border max-h-80 divide-y overflow-y-auto">
          {samplePosts.map((text, i) => (
            <li key={i} className="px-4 py-3">
              <p className="text-foreground/90 text-xs leading-relaxed sm:text-[13px]">
                {text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

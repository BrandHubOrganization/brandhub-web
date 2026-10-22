import { useTranslation } from "react-i18next";
import { ExternalLink, Heart, MessageCircle, Share2 } from "lucide-react";
import type { TrendPost } from "@/services/trendService";

/** FR 3.7.1 hover popup: the posts behind a trend, most-liked first. */
export function TrendPostList({
  keyword,
  posts,
}: {
  keyword: string;
  posts: TrendPost[];
}) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language, { notation: "compact" });
  const date = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(iso))
      : null;

  return (
    <div>
      <p className="border-border border-b px-4 py-3 text-sm font-semibold">
        {t("aiStudio.trends.posts.title", { count: posts.length, keyword })}
      </p>
      <ol className="max-h-96 divide-y overflow-y-auto">
        {posts.map((post, i) => (
          <li key={post.url ?? i} className="space-y-1.5 px-4 py-3">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="text-foreground truncate font-medium">
                {post.author ?? t("aiStudio.trends.posts.unknownAuthor")}
              </span>
              {date(post.postedAt) && <span>· {date(post.postedAt)}</span>}
            </div>
            <p className="line-clamp-3 text-xs leading-5">{post.text}</p>
            <div className="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
              <span
                className="flex items-center gap-1"
                title={t("aiStudio.trends.posts.likes")}
              >
                <Heart className="size-3" /> {number.format(post.likes)}
              </span>
              <span
                className="flex items-center gap-1"
                title={t("aiStudio.trends.posts.comments")}
              >
                <MessageCircle className="size-3" />{" "}
                {number.format(post.comments)}
              </span>
              <span
                className="flex items-center gap-1"
                title={t("aiStudio.trends.posts.shares")}
              >
                <Share2 className="size-3" /> {number.format(post.shares)}
              </span>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-orange ml-auto flex items-center gap-1 font-medium hover:underline"
                >
                  {t("aiStudio.trends.posts.open")}
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchTrendBoard,
  type GoogleBoardItem,
  type TiktokBoardItem,
  type TrendBoardSource,
} from "@/services/trendService";

interface TrendBoardDialogProps {
  source: TrendBoardSource | null;
  onClose: () => void;
}

/** FR 3.7.1: the latest Google Trends / TikTok Creative Center board the crawler stored, as each platform ranks it. */
export function TrendBoardDialog({ source, onClose }: TrendBoardDialogProps) {
  const { t, i18n } = useTranslation();
  const board = useQuery({
    queryKey: ["ai-trend-board", source],
    queryFn: () => fetchTrendBoard(source!),
    enabled: source !== null,
    staleTime: 5 * 60_000,
  });
  const compact = new Intl.NumberFormat(i18n.language, { notation: "compact" });
  const fmt = (n: number | null) => (n == null ? "–" : compact.format(n));
  const notFound =
    (board.error as { response?: { status?: number } } | null)?.response?.status === 404;
  const fetched = board.data?.fetched_at
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(
        new Date(board.data.fetched_at),
      )
    : null;

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl md:max-w-4xl">
        <DialogHeader className="text-left">
          <DialogTitle>{source && t(`aiStudio.trends.board.title.${source}`)}</DialogTitle>
          <DialogDescription>
            {fetched
              ? t("aiStudio.trends.board.updated", { date: fetched, count: board.data?.items.length })
              : t("aiStudio.trends.board.hint")}
          </DialogDescription>
        </DialogHeader>

        {board.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
        {board.isError && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {t(notFound ? "aiStudio.trends.board.empty" : "aiStudio.trends.board.error")}
          </p>
        )}
        {board.data && source === "tiktok" && (
          <TiktokTable items={board.data.items as TiktokBoardItem[]} fmt={fmt} />
        )}
        {board.data && source === "google" && (
          <GoogleTable items={board.data.items as GoogleBoardItem[]} fmt={fmt} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Curve({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values) || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 60},${20 - (v / max) * 18}`)
    .join(" ");
  return (
    <svg viewBox="0 0 60 22" className="h-5 w-16 text-rose-500" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const th = "text-muted-foreground px-2 py-2 text-left text-xs font-medium";
const td = "px-2 py-2 align-top text-sm";

function TiktokTable({ items, fmt }: { items: TiktokBoardItem[]; fmt: (n: number | null) => string }) {
  const { t } = useTranslation();
  return (
    <table className="w-full border-collapse">
      <thead className="border-b">
        <tr>
          <th className={th}>{t("aiStudio.trends.board.rank")}</th>
          <th className={th}>{t("aiStudio.trends.board.hashtag")}</th>
          <th className={`${th} text-right`}>{t("aiStudio.trends.board.posts")}</th>
          <th className={`${th} text-right`}>{t("aiStudio.trends.board.views")}</th>
          <th className={th}>{t("aiStudio.trends.board.curve")}</th>
          <th className={th}>{t("aiStudio.trends.board.creators")}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.hashtag} className="border-b last:border-0">
            <td className={`${td} text-muted-foreground tabular-nums`}>{item.rank ?? "–"}</td>
            <td className={td}>
              <a
                href={`https://www.tiktok.com/tag/${encodeURIComponent(item.hashtag)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium hover:underline"
              >
                #{item.hashtag}
                <ExternalLink className="size-3" />
              </a>
            </td>
            <td className={`${td} text-right tabular-nums`}>{fmt(item.posts)}</td>
            <td className={`${td} text-right tabular-nums`}>{fmt(item.views)}</td>
            <td className={td}>
              <Curve values={item.curve} />
            </td>
            <td className={`${td} text-muted-foreground text-xs`}>
              {item.creators.map((c) => c.nickname || c.handle).filter(Boolean).join(", ")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GoogleTable({ items, fmt }: { items: GoogleBoardItem[]; fmt: (n: number | null) => string }) {
  const { t } = useTranslation();
  return (
    <table className="w-full border-collapse">
      <thead className="border-b">
        <tr>
          <th className={th}>{t("aiStudio.trends.board.keyword")}</th>
          <th className={`${th} text-right`}>{t("aiStudio.trends.board.searches")}</th>
          <th className={`${th} text-right`}>{t("aiStudio.trends.board.growth")}</th>
          <th className={th}>{t("aiStudio.trends.board.related")}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.keyword} className="border-b last:border-0">
            <td className={td}>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium hover:underline"
              >
                {item.keyword}
                <ExternalLink className="size-3" />
              </a>
              {item.active && (
                <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                  {t("aiStudio.trends.board.active")}
                </span>
              )}
              {item.news[0]?.url && (
                <a
                  href={item.news[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground mt-0.5 block text-xs hover:underline"
                >
                  {item.news[0].title} · {item.news[0].source}
                </a>
              )}
            </td>
            <td className={`${td} text-right tabular-nums`}>{fmt(item.search_volume)}+</td>
            <td className={`${td} text-right tabular-nums`}>
              {item.growth_pct == null ? "–" : `+${item.growth_pct}%`}
            </td>
            <td className={`${td} text-muted-foreground text-xs`}>{item.related_queries.slice(0, 3).join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

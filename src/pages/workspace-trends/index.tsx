import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { listWorkspaceTrends } from "@/pages/workspace-trends/services/trends";
import { TrendSkeleton } from "@/pages/workspace-trends/components/TrendSkeleton";
import { TrendRankBadge } from "@/pages/workspace-trends/components/TrendRankBadge";
import { TrendHistoryPanel } from "@/pages/workspace-trends/components/TrendHistoryPanel";

export function WorkspaceTrendsPage() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Dashboard />
    </QueryClientProvider>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const date = params.get("date") ?? "";
  const q = params.get("q") ?? "";
  const keyword = params.get("keyword") ?? "";
  const [search, setSearch] = useState(q);
  useEffect(() => {
    setSearch(q);
  }, [q]);
  useEffect(() => {
    if (search === q) return;
    const timer = setTimeout(
      () =>
        setParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            next.set("q", search);
            return next;
          },
          { replace: true },
        ),
      350,
    );
    return () => clearTimeout(timer);
  }, [search, q, setParams]);
  const update = (key: string, value: string) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  return (
    <PageWrapper
      compact
      title={t("aiStudio.workspaceTrends.title")}
      description={t("aiStudio.workspaceTrends.description")}
    >
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1 space-y-1 text-sm">
          <span>{t("aiStudio.workspaceTrends.search")}</span>
          <Input
            value={search}
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("aiStudio.workspaceTrends.searchPlaceholder")}
          />
        </label>
        <div className="w-48">
          <DatePicker
            label={t("aiStudio.workspaceTrends.date")}
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(val) => update("date", val)}
          />
        </div>
        <Button
          variant={date ? "outline" : "default"}
          onClick={() => update("date", "")}
        >
          {t("aiStudio.workspaceTrends.current")}
        </Button>
      </div>
      <div className={cn("grid min-w-0 gap-5", keyword && "xl:grid-cols-2")}>
        <TrendList
          key={`${id}:${date}:${q}`}
          workspaceId={id}
          date={date}
          q={q}
          selected={keyword}
          select={(value) => update("keyword", value)}
        />
        {keyword && (
          <TrendHistoryPanel
            key={`${id}:${keyword}`}
            workspaceId={id}
            keyword={keyword}
            date={date}
            close={() => update("keyword", "")}
          />
        )}
      </div>
    </PageWrapper>
  );
}

function TrendList({
  workspaceId,
  date,
  q,
  selected,
  select,
}: {
  workspaceId: string;
  date: string;
  q: string;
  selected: string;
  select: (value: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursors.at(-1);
  const query = useQuery({
    queryKey: ["workspace-trends", workspaceId, date, q, cursor],
    queryFn: ({ signal }) =>
      listWorkspaceTrends(workspaceId, date, q, cursor, signal),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
  const page = query.data;
  return (
    <section
      className="border-border bg-card min-w-0 self-start rounded-xl border"
      aria-busy={query.isFetching}
      aria-label={t("aiStudio.workspaceTrends.title")}
    >
      <div className="border-border flex items-center justify-between gap-3 border-b p-4">
        <div className="text-muted-foreground text-xs">
          {page && (
            <>
              <span>
                {t(`aiStudio.workspaceTrends.${page.source}`)} · {page.date}{" "}
                (UTC)
              </span>
              {page.asOf && (
                <span className="mt-1 block">
                  {t("aiStudio.workspaceTrends.updated", {
                    date: new Date(page.asOf).toLocaleString(i18n.language),
                  })}
                </span>
              )}
              {page.fallbackReason && (
                <p className="mt-1">{t("aiStudio.workspaceTrends.fallback")}</p>
              )}
              {page.source === "neo4j" && (
                <p className="mt-1">{t("aiStudio.workspaceTrends.legacy")}</p>
              )}
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={query.isFetching}
          aria-label={t("aiStudio.workspaceTrends.refresh")}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
      {query.isPending || query.isFetching ? (
        <>
          <span className="sr-only" role="status">
            {t("aiStudio.workspaceTrends.loading")}
          </span>
          <TrendSkeleton />
        </>
      ) : query.isError ? (
        <div role="alert" className="space-y-3 p-6">
          <p>{t("aiStudio.workspaceTrends.error")}</p>
          <Button
            variant="outline"
            onClick={() => {
              if (cursors.length > 1) setCursors([undefined]);
              else void query.refetch();
            }}
          >
            {t("aiStudio.workspaceTrends.retry")}
          </Button>
        </div>
      ) : !page?.items.length ? (
        <p className="text-muted-foreground p-8 text-center">
          {t("aiStudio.workspaceTrends.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-border border-b text-xs">
              <tr>
                <th className="p-3">{t("aiStudio.workspaceTrends.rank")}</th>
                <th className="p-4">{t("aiStudio.workspaceTrends.topic")}</th>
                <th className="p-3 text-right">
                  {t("aiStudio.workspaceTrends.score")}
                </th>
                <th className="p-3 text-right">
                  {t("aiStudio.workspaceTrends.postCount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-border border-b last:border-0",
                    selected === row.keyword && "bg-brand-orange/10",
                  )}
                >
                  <td className="w-14 p-3">
                    <TrendRankBadge rank={row.rank ?? null} />
                  </td>
                  <td className="max-w-56 p-4">
                    <button
                      type="button"
                      onClick={() => select(row.keyword)}
                      aria-pressed={selected === row.keyword}
                      className="hover:text-brand-orange focus-visible:ring-ring w-full rounded text-left font-medium break-words focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {row.keyword}
                    </button>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {row.date}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {row.score?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {row.postCount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-border flex items-center justify-between border-t p-3">
        <Button
          variant="outline"
          size="sm"
          disabled={cursors.length === 1 || query.isFetching}
          onClick={() => setCursors((values) => values.slice(0, -1))}
        >
          {t("aiStudio.workspaceTrends.previous")}
        </Button>
        <span className="text-muted-foreground text-xs">
          {t("aiStudio.workspaceTrends.page", { count: cursors.length })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!page?.nextCursor || query.isFetching || query.isError}
          onClick={() =>
            setCursors((values) => [...values, page?.nextCursor ?? undefined])
          }
        >
          {t("aiStudio.workspaceTrends.next")}
        </Button>
      </div>
    </section>
  );
}

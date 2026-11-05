import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { trendViewService } from "@/pages/admin/services/trendViewService";
import { TREND_PLATFORMS, type TrendViewSelection } from "@/pages/admin/types/trendView";

export const TREND_LIMITS = [20, 50, 100];

export function useTrendView() {
  const [params, setParams] = useSearchParams();
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const requestedDate = params.get("date");
  const selectedDate =
    requestedDate &&
    z.iso.date().safeParse(requestedDate).success &&
    requestedDate >= "0001-01-07" &&
    requestedDate <= today
      ? requestedDate
      : undefined;
  const date = selectedDate ?? today;
  const source = params.get("source") === "neo4j" ? "neo4j" : "redis";
  const platform = TREND_PLATFORMS.find((value) => value === params.get("platform"));
  const requestedPeriod = params.get("period");
  const period =
    requestedPeriod === "7d" || (requestedPeriod === "6h" && source === "redis")
      ? requestedPeriod
      : "24h";
  const dateMode = period === "24h" && !selectedDate ? "today" : period;
  const requestedLimit = Number(params.get("limit"));
  const limit = TREND_LIMITS.includes(requestedLimit)
    ? requestedLimit
    : TREND_LIMITS[0];
  const selection: TrendViewSelection = {
    period,
    source,
    limit,
    ...(platform && { platform }),
    ...(period !== "6h" && { date }),
  };
  const trends = useQuery({
    queryKey: ["admin-trends", selection],
    queryFn: ({ signal }) => trendViewService.list(selection, signal),
    staleTime: 30000,
  });
  const summary = useQuery({
    queryKey: ["admin-trend-summary"],
    queryFn: ({ signal }) => trendViewService.summary(signal),
    staleTime: 30000,
    enabled: source === "redis",
  });
  const change = (key: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("view", "trends");
        if (key === "window") {
          next.set("period", value === "today" ? "24h" : value);
          if (value === "24h") next.set("date", date);
          else next.delete("date");
        } else {
          if (value) next.set(key, value);
          else next.delete(key);
          if (key === "source" && value === "neo4j" && period === "6h") {
            next.set("period", "24h");
            next.delete("date");
          }
        }
        return next;
      },
      { replace: key === "q" },
    );
  };
  const clearFilters = () =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("q");
      next.delete("topic");
      return next;
    });
  const refresh = () => {
    void trends.refetch();
    if (source === "redis") void summary.refetch();
  };
  return {
    trends,
    summary,
    dateMode,
    source,
    platform,
    date,
    today,
    limit,
    change,
    clearFilters,
    refresh,
    search: params.get("q") || "",
    topic: params.get("topic") || "",
  };
}

import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { trendViewService } from "@/pages/admin/services/trendViewService";
import type { TrendViewSelection } from "@/pages/admin/types/trendView";

export const TREND_LIMITS = [20, 50, 100];

export function useTrendView() {
  const [params, setParams] = useSearchParams();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const selectedDate = params.get("date") || today;
  const date =
    z.iso.date().safeParse(selectedDate).success && selectedDate <= today
      ? selectedDate
      : today;
  const requestedPeriod = params.get("period");
  const period =
    requestedPeriod === "6h" || requestedPeriod === "7d"
      ? requestedPeriod
      : "24h";
  const requestedLimit = Number(params.get("limit"));
  const limit = TREND_LIMITS.includes(requestedLimit)
    ? requestedLimit
    : TREND_LIMITS[0];
  const selection: TrendViewSelection = {
    period,
    limit,
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
  });
  const change = (key: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("view", "trends");
        if (value) next.set(key, value);
        else next.delete(key);
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
    void summary.refetch();
  };
  return {
    trends,
    summary,
    period,
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

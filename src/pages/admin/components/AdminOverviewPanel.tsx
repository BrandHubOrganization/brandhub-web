import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, RefreshCw, Users } from "lucide-react";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { adminStatisticsService } from "@/services/adminStatisticsService";
import { adminAccountService } from "@/services/adminAccountService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AdminMetrics,
  AdminAttention,
} from "@/pages/admin/components/AdminOverviewSummary";
import {
  AdminRegistrationChart,
  AdminAccountDistribution,
} from "@/pages/admin/components/AdminOverviewCharts";
import { AdminRecentUsers } from "@/pages/admin/components/AdminRecentUsers";

export function AdminOverviewActions({
  timezone,
  onTimezoneChange,
}: {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const refreshing =
    useIsFetching({ queryKey: ["admin-statistics"] }) +
      useIsFetching({ queryKey: ["admin-accounts"] }) >
    0;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={t("admin.overview.timezone")}
        value={timezone}
        onChange={(e) => onTimezoneChange(e.target.value)}
        className="border-input bg-card text-foreground focus-visible:outline-ring h-9 max-w-full rounded-lg border px-3 text-xs focus-visible:outline-2"
      >
        <option value="Asia/Ho_Chi_Minh">
          {t("admin.overview.vietnamTime")}
        </option>
        <option value="UTC">UTC</option>
      </select>
      <Button
        variant="outline"
        className="h-9"
        disabled={refreshing}
        onClick={() => {
          void client.refetchQueries({ queryKey: ["admin-statistics"] });
          void client.refetchQueries({ queryKey: ["admin-accounts"] });
        }}
      >
        <RefreshCw
          className={cn("size-3.5", refreshing && "motion-safe:animate-spin")}
        />
        {t("admin.overview.refresh")}
      </Button>
      <Button
        asChild
        className="bg-brand-orange hover:bg-brand-orange/90 h-9 text-white"
      >
        <Link to="/admin?view=users">
          <Users className="size-3.5" />
          {t("admin.overview.openUsers")}
        </Link>
      </Button>
    </div>
  );
}

export function AdminOverviewPanel({ timezone }: { timezone: string }) {
  const { t, i18n } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const [days, setDays] = useState(30);
  const result = useQuery({
    queryKey: ["admin-statistics", actor, days, timezone],
    queryFn: () => adminStatisticsService.overview(days, timezone),
    retry: false,
  });
  const recent = useQuery({
    queryKey: ["admin-accounts", actor, "recent"],
    queryFn: () =>
      adminAccountService.list({
        page: 1,
        size: 5,
        search: "",
        role: "",
        status: "",
      }),
    retry: false,
  });
  const forbidden =
    isAxiosError(result.error) && result.error.response?.status === 403;
  const data = forbidden ? undefined : result.data;
  return (
    <div className="space-y-5">
      {result.isError && (
        <div
          role="alert"
          className="border-destructive/25 bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm"
        >
          <p>
            {t(
              forbidden
                ? "admin.overview.forbidden"
                : data
                  ? "admin.overview.stale"
                  : "admin.overview.error",
            )}
          </p>
          {!forbidden && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => result.refetch()}
            >
              {t("admin.overview.retry")}
            </Button>
          )}
        </div>
      )}
      {result.isPending && (
        <div
          aria-label={t("admin.loading")}
          role="status"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-40 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}
      {data && (
        <>
          <AdminMetrics data={data} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <AdminRegistrationChart
              data={data}
              days={days}
              onDaysChange={setDays}
            />
            <AdminAttention data={data} />
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
            <AdminRecentUsers result={recent} timezone={data.timezone} />
            <AdminAccountDistribution data={data} />
          </div>
          <div className="text-muted-foreground border-border flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              {t("admin.overview.updated", {
                time: new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: data.timezone,
                }).format(new Date(data.generatedAt)),
              })}
            </span>
            <span className="text-2xs font-mono">
              {data.timezone === "UTC"
                ? "UTC"
                : t("admin.overview.vietnamTime")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { SelectMenu } from "@/components/ui/select-menu";
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
import { SystemHealthPanel } from "@/pages/admin/components/SystemHealthPanel";
import { getSystemHealth } from "@/services/mock/mockAdminService";
import type { SystemHealthMetric } from "@/pages/admin/types/admin";

const DEFAULT_SYSTEM_HEALTH_METRICS: SystemHealthMetric[] = [
  {
    service: "API Gateway",
    status: "UP",
    latencyMs: 18,
    uptime: 99.98,
  },
  {
    service: "Business Service",
    status: "UP",
    latencyMs: 42,
    uptime: 99.95,
  },
  {
    service: "AI Generation Service",
    status: "DEGRADED",
    latencyMs: 640,
    uptime: 98.4,
  },
  {
    service: "Publisher Service",
    status: "UP",
    latencyMs: 55,
    uptime: 99.91,
  },
];

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
      <SelectMenu
        ariaLabel={t("admin.overview.timezone")}
        value={timezone}
        onChange={onTimezoneChange}
        options={[
          { value: "Asia/Ho_Chi_Minh", label: t("admin.overview.vietnamTime") },
          { value: "UTC", label: "UTC" },
        ]}
      />
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
        variant="orange"
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
  const health = useQuery({
    queryKey: ["admin-overview-system-health"],
    queryFn: getSystemHealth,
    initialData: DEFAULT_SYSTEM_HEALTH_METRICS,
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
            <span className="text-xs font-sans">
              {data.timezone === "UTC"
                ? "UTC"
                : t("admin.overview.vietnamTime")}
            </span>
          </div>
        </>
      )}
      <section className="space-y-3" data-testid="admin-overview-system-health">
        <h2 className="text-foreground text-sm font-semibold">
          {t("dashboard.admin.tabs.health")}
        </h2>
        <SystemHealthPanel metrics={health.data ?? DEFAULT_SYSTEM_HEALTH_METRICS} />
      </section>
    </div>
  );
}

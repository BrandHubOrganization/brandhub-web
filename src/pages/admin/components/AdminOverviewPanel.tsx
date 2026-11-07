import { useState } from "react";
import { SelectMenu } from "@/components/ui/select-menu";
import { Link } from "react-router-dom";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, FileDown, RefreshCw, Users } from "lucide-react";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { adminStatisticsService } from "@/services/adminStatisticsService";
import { adminAccountService } from "@/services/adminAccountService";
import { presetRange } from "@/services/adminRevenueService";
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
import {
  AdminReportDialog,
  AdminReportForm,
} from "@/pages/admin/components/AdminReportExport";
import { readTargets } from "@/pages/admin/system-health/services/monitoringService";
import type { SystemHealthMetric } from "@/pages/admin/types/admin";

export function AdminOverviewActions({
  timezone,
  onTimezoneChange,
}: {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const refreshing =
    useIsFetching({ queryKey: ["admin-statistics"] }) +
      useIsFetching({ queryKey: ["admin-accounts"] }) >
    0;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SelectMenu
          ariaLabel={t("admin.overview.timezone")}
          value={timezone}
          onChange={onTimezoneChange}
          className="w-auto min-w-[170px]"
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
          variant="outline"
          className="h-9"
          onClick={() => setExporting(true)}
        >
          <FileDown className="text-brand-orange size-3.5" />
          {t("admin.overview.exportReport")}
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
      {exporting && (
        <AdminReportDialog
          defaults={{
            type: "PLATFORM",
            ...presetRange("month", timezone),
            timezone,
          }}
          onClose={() => setExporting(false)}
        />
      )}
    </>
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
    queryKey: ["admin-overview-system-health", actor],
    queryFn: async ({ signal }): Promise<SystemHealthMetric[]> => {
      const snapshot = await readTargets(signal);
      return snapshot.rows.map((target) => ({
        service: target.name,
        status:
          target.status === "UP"
            ? "UP"
            : target.status === "DOWN"
              ? "DOWN"
              : "DEGRADED",
        latencyMs: target.latencyMs ?? 0,
        uptime: target.status === "UP" ? 100 : 0,
      }));
    },
    retry: false,
  });
  const forbidden =
    isAxiosError(result.error) && result.error.response?.status === 403;
  const data = forbidden ? undefined : result.data;
  return (
    <div className="w-full min-w-0 space-y-5">
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
          <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <AdminRegistrationChart
              data={data}
              days={days}
              onDaysChange={setDays}
            />
            <AdminAttention data={data} />
          </div>
          <div className="grid w-full min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
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
      <section
        className="bg-card border-border w-full min-w-0 rounded-xl border p-5 shadow-xs"
        data-testid="admin-overview-reports-section"
      >
        <div className="mb-5 flex items-start gap-3">
          <span className="bg-brand-orange-soft text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-lg">
            <FileDown className="size-5" />
          </span>
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              {t("admin.reports.title")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("admin.reports.description")}
            </p>
          </div>
        </div>
        <AdminReportForm
          key={timezone}
          defaults={{
            type: "PLATFORM",
            ...presetRange("month", timezone),
            timezone,
          }}
        />
      </section>
      {health.data && health.data.length > 0 && (
        <section className="w-full min-w-0 space-y-3" data-testid="admin-overview-system-health">
          <h2 className="text-foreground text-sm font-semibold">
            {t("dashboard.admin.tabs.health")}
          </h2>
          <SystemHealthPanel metrics={health.data} />
        </section>
      )}
    </div>
  );
}

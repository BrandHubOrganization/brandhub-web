import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createScheduledReport,
  deleteScheduledReport,
  getScheduledReports,
  getTeamProductivity,
  toggleScheduledReport,
} from "@/services/mock/mockReportService";
import type {
  ReportFrequency,
  ScheduledReport,
  TeamProductivityRow,
} from "./types/report";
import { TeamProductivityTable } from "./components/TeamProductivityTable";
import { ExportButtons } from "./components/ExportButtons";
import { ScheduledReportsPanel } from "./components/ScheduledReportsPanel";
import { ReportsErrorBanner } from "./components/ReportsErrorBanner";

export function ReportsPage() {
  const { t } = useTranslation();
  const [productivity, setProductivity] = useState<TeamProductivityRow[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const [productivityData, scheduledData] = await Promise.all([
          getTeamProductivity(),
          getScheduledReports(),
        ]);
        if (!cancelled) {
          setProductivity(productivityData);
          setScheduled(scheduledData);
        }
      } catch (err) {
        console.error("Failed to load reports data:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateScheduled(input: {
    name: string;
    frequency: ReportFrequency;
    recipients: string[];
  }) {
    try {
      const created = await createScheduledReport(input);
      setScheduled((prev) => [...prev, created]);
      toast.success(t("reports.scheduled.createSuccess"));
    } catch (err) {
      console.error("Failed to create scheduled report:", err);
      toast.error(t("reports.scheduled.createError"));
    }
  }

  async function handleToggleScheduled(id: string) {
    try {
      const updated = await toggleScheduledReport(id);
      setScheduled((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(t("reports.scheduled.toggleSuccess"));
    } catch (err) {
      console.error("Failed to toggle scheduled report:", err);
      toast.error(t("reports.scheduled.toggleError"));
    }
  }

  async function handleDeleteScheduled(id: string) {
    if (!window.confirm(t("reports.scheduled.deleteConfirm"))) return;
    try {
      await deleteScheduledReport(id);
      setScheduled((prev) => prev.filter((r) => r.id !== id));
      toast.success(t("reports.scheduled.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete scheduled report:", err);
      toast.error(t("reports.scheduled.deleteError"));
    }
  }

  return (
    <PageWrapper
      title={t("reports.title")}
      description={t("reports.description")}
    >
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {isError && !isLoading && <ReportsErrorBanner />}

      {!isLoading && !isError && (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-foreground text-lg font-bold">
                {t("reports.team.title")}
              </h2>
              <ExportButtons />
            </div>
            <TeamProductivityTable rows={productivity} />
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-lg font-bold">
              {t("reports.scheduled.title")}
            </h2>
            <ScheduledReportsPanel
              reports={scheduled}
              onCreate={handleCreateScheduled}
              onToggle={handleToggleScheduled}
              onDelete={handleDeleteScheduled}
            />
          </section>
        </div>
      )}
    </PageWrapper>
  );
}

export default ReportsPage;

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agencyService } from "@/services/agencyService";
import { useAgencyStore } from "@/store/agencyStore";
import type { Agency, AgencyStatsResponse } from "@/types/agency";
import {
  BarStatChart,
  LineStatChart,
  PieStatChart,
} from "@/components/charts/StatCharts";
import {
  createScheduledReport,
  deleteScheduledReport,
  getScheduledReports,
  toggleScheduledReport,
} from "@/services/mock/mockReportService";
import type { ReportFrequency, ScheduledReport } from "./types/report";
import { ScheduledReportsPanel } from "./components/ScheduledReportsPanel";
import { ReportsErrorBanner } from "./components/ReportsErrorBanner";

// Báo cáo agency thật (không mock) — nguồn dữ liệu là AgencyStatsResponse
// (agencyService.getStats), cùng endpoint /agency/:id/stats đã dùng, nhưng
// gọi thêm from/to để lọc theo khoảng thời gian chọn ở toolbar. In/export
// dùng window.print() + CSS print riêng (không thêm lib PDF mới — dự án
// chưa có jsPDF/html2canvas, ponytail: browser print dialog là đủ).
type SectionKey =
  | "overview"
  | "membersByRole"
  | "workspacesByIndustry"
  | "contentByStatus"
  | "memberGrowth"
  | "postsPublished";

const SECTION_KEYS: SectionKey[] = [
  "overview",
  "membersByRole",
  "workspacesByIndustry",
  "contentByStatus",
  "memberGrowth",
  "postsPublished",
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function ReportsPage() {
  const { t } = useTranslation();
  const agencyId = useAgencyStore((s) => s.currentAgencyId);

  const [agency, setAgency] = useState<Agency | null>(null);
  const [stats, setStats] = useState<AgencyStatsResponse | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visible, setVisible] = useState<Record<SectionKey, boolean>>({
    overview: true,
    membersByRole: true,
    workspacesByIndustry: true,
    contentByStatus: true,
    memberGrowth: true,
    postsPublished: true,
  });

  useEffect(() => {
    if (!agencyId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    Promise.all([
      agencyService.getById(agencyId),
      agencyService.getStats(agencyId, {
        from: from || undefined,
        to: to || undefined,
      }),
      getScheduledReports(),
    ])
      .then(([agencyRes, statsRes, scheduledData]) => {
        if (cancelled) return;
        setAgency(agencyRes.data.data);
        setStats(statsRes.data.data);
        setScheduled(scheduledData);
      })
      .catch((err: unknown) => {
        console.error("Failed to load report data:", err);
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, from, to]);

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

  const toggleSection = (key: SectionKey) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageWrapper
      title={t("reports.title")}
      description={t("reports.description")}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #report-content {
            width: 100% !important;
          }
          #report-content .border { border-color: #ddd !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {isError && !isLoading && <ReportsErrorBanner />}

      {!isLoading && !isError && !agencyId && (
        <p className="text-muted-foreground text-sm">
          {t("reports.noAgencySelected")}
        </p>
      )}

      {!isLoading && !isError && agencyId && stats && (
        <div className="space-y-8">
          {/* Toolbar — filter thời gian, ẩn/hiện section, in/export. Không in. */}
          <div className="no-print border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("reports.filters.from")}
                </label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("reports.filters.to")}
                </label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="ml-auto gap-1.5"
              >
                <Printer className="size-4" />
                {t("reports.print")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {SECTION_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={visible[key]}
                    onChange={() => toggleSection(key)}
                  />
                  {t(`reports.sections.${key}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Nội dung báo cáo — phần này được in. */}
          <div id="report-content" className="space-y-6">
            <div className="border-border border-b pb-4">
              <h2 className="text-foreground text-xl font-bold">
                {agency?.name ?? t("reports.title")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {from || to
                  ? `${from || "…"} → ${to || "…"}`
                  : t("reports.allTime")}
                {" · "}
                {t("reports.generatedAt")} {new Date().toLocaleDateString()}
              </p>
            </div>

            {visible.overview && (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  label={t("reports.overview.memberCount")}
                  value={stats.memberCount}
                />
                <StatCard
                  label={t("reports.overview.workspaceCount")}
                  value={stats.workspaceCount}
                />
                <StatCard
                  label={t("reports.overview.contentCount")}
                  value={Object.values(stats.contentByStatus).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                />
              </section>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visible.membersByRole && (
                <PieStatChart
                  title={t("reports.sections.membersByRole")}
                  data={stats.membersByRole}
                />
              )}
              {visible.workspacesByIndustry && (
                <PieStatChart
                  title={t("reports.sections.workspacesByIndustry")}
                  data={stats.workspacesByIndustry}
                />
              )}
              {visible.contentByStatus && (
                <BarStatChart
                  title={t("reports.sections.contentByStatus")}
                  data={stats.contentByStatus}
                />
              )}
              {visible.memberGrowth && (
                <LineStatChart
                  title={t("reports.sections.memberGrowth")}
                  data={stats.memberGrowthByMonth}
                />
              )}
              {visible.postsPublished && (
                <LineStatChart
                  title={t("reports.sections.postsPublished")}
                  data={stats.postsPublishedByMonth}
                />
              )}
            </div>
          </div>

          <section className="no-print space-y-3">
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

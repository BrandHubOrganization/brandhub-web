import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, CalendarClock, CheckCircle2 } from "lucide-react";
import { LineStatChart, PieStatChart } from "@/components/charts/StatCharts";
import { taskService } from "@/services/taskService";
import type { TaskListItem } from "@/types/task";

export function WorkspaceVisualAnalytics({ workspaceId }: { workspaceId?: string }) {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    let disposed = false;
    taskService
      .getWorkspaceTasks(workspaceId, { size: 100 })
      .then((res) => {
        if (!disposed) setTasks(res.content || []);
      })
      .catch((err) => console.warn("Failed to load workspace analytics:", err));
    return () => {
      disposed = true;
    };
  }, [workspaceId]);

  const { dueByMonth, byStatus, upcoming, recent } = useMemo(() => {
    const live = tasks.filter((task) => task.status !== "CANCELLED");
    const now = new Date();
    return {
      dueByMonth: Array.from({ length: 6 }, (_, i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return {
          month: start.toLocaleDateString(i18n.language, { month: "short" }),
          count: live.filter((task) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            return due !== null && due >= start && due < end;
          }).length,
        };
      }),
      byStatus: live.reduce<Record<string, number>>((counts, task) => {
        const label = t(`tasks.status.${task.status}`, task.status);
        counts[label] = (counts[label] ?? 0) + 1;
        return counts;
      }, {}),
      upcoming: live
        .filter((task) => task.status !== "FINISHED" && task.dueDate && new Date(task.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 3),
      recent: [...live]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3),
    };
  }, [tasks, t, i18n.language]);

  return (
    <>
      {/* ── Visual Analytics Section ── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-brand-orange size-5" />
          <h3 className="text-foreground text-lg font-bold">{t("nav.analytics")}</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineStatChart title={t("workspace.dashboard.tasksDueTrend")} data={dueByMonth} />
          <PieStatChart title={t("workspace.dashboard.tasksByStatusChart")} data={byStatus} />
        </div>
      </div>

      {/* ── Upcoming Tasks & Recently Changed ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.upcomingTasks")}
          </p>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.upcomingTasksEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((task) => (
                <li key={task.id} className="flex items-start gap-2.5 text-sm">
                  <CalendarClock className="text-brand-orange mt-0.5 size-4.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-medium">{task.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {t(`tasks.types.${task.type}`, task.type)} ·{" "}
                      {new Date(task.dueDate!).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.recentlyChanged")}
          </p>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.recentActivityEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((task) => (
                <li key={task.id} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-semibold">{task.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {t(`tasks.status.${task.status}`, task.status)} ·{" "}
                      {new Date(task.updatedAt).toLocaleString(i18n.language)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

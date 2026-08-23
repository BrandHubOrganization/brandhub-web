import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  userName: string;
  userRole?: string;
}

export function QuickTasksCard({ userName, userRole }: Props) {
  const { t } = useTranslation();
  const PRIORITY_TASKS = [
    t("dashboard.quickTasks.task1"),
    t("dashboard.quickTasks.task2"),
    t("dashboard.quickTasks.task3"),
  ];
  return (
    <div className="space-y-6">
      <div className="border-border from-card via-card to-muted/30 relative overflow-hidden rounded-xl border bg-gradient-to-r p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-lg font-bold">
                {t("dashboard.quickTasks.greeting", {
                  name: userName || t("dashboard.quickTasks.defaultUser"),
                })}
              </h2>
              <span className="bg-brand-orange/10 text-2xs text-brand-orange inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold">
                <Sparkles className="size-3" /> {userRole}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("dashboard.quickTasks.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border bg-card space-y-3 rounded-xl border p-5">
        <h3 className="text-foreground text-sm font-bold">
          {t("dashboard.quickTasks.priorityTitle")}
        </h3>
        <div className="space-y-2.5">
          {PRIORITY_TASKS.map((taskText, idx) => (
            <label
              key={idx}
              className="text-foreground/90 hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs transition-colors"
            >
              <input
                type="checkbox"
                className="border-border text-brand-orange focus:ring-brand-orange size-3.5 rounded"
              />
              <span>{taskText}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

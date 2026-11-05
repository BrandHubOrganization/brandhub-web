import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  userName: string;
  userRole?: string;
}

export function QuickTasksCard({ userName, userRole }: Props) {
  const { t } = useTranslation();
  return (
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
  );
}

import { FileText, UserCheck } from "lucide-react";
import type { ActiveTab } from "../hooks/useContentRequests";
import { useTranslation } from "react-i18next";

interface Props {
  activeTab: ActiveTab;
  totalCount: number;
  onTabChange: (tab: ActiveTab) => void;
}

export function RequestTabs({ activeTab, totalCount, onTabChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex gap-6 border-b text-sm font-medium">
      <button
        onClick={() => onTabChange("all")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          activeTab === "all"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "text-muted-foreground hover:text-foreground border-transparent"
        }`}
      >
        <FileText className="size-4" />
        <span>{t("requests.tabs.all", { count: totalCount })}</span>
      </button>

      <button
        onClick={() => onTabChange("my-tasks")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          activeTab === "my-tasks"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "text-muted-foreground hover:text-foreground border-transparent"
        }`}
      >
        <UserCheck className="size-4" />
        <span>{t("requests.tabs.myTasks")}</span>
      </button>
    </div>
  );
}

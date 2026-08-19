import { FileText, UserCheck } from "lucide-react";
import type { ActiveTab } from "../hooks/useContentRequests";

interface Props {
  activeTab: ActiveTab;
  totalCount: number;
  onTabChange: (tab: ActiveTab) => void;
}

export function RequestTabs({ activeTab, totalCount, onTabChange }: Props) {
  return (
    <div className="flex gap-6 border-b border-zinc-200 text-sm font-medium dark:border-zinc-800">
      <button
        onClick={() => onTabChange("all")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          activeTab === "all"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>Tất Cả Yêu Cầu ({totalCount})</span>
      </button>

      <button
        onClick={() => onTabChange("my-tasks")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          activeTab === "my-tasks"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <UserCheck className="h-4 w-4" />
        <span>Nhiệm Vụ Của Tôi</span>
      </button>
    </div>
  );
}

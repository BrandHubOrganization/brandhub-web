import { useTranslation } from "react-i18next";
import { UserCog } from "lucide-react";
import type { ApprovalStage } from "@/types/portal";

interface ViewerStageSwitcherProps {
  value: ApprovalStage;
  onChange: (stage: ApprovalStage) => void;
}

const STAGES: ApprovalStage[] = ["CREATOR", "MANAGER", "CLIENT"];

export function ViewerStageSwitcher({
  value,
  onChange,
}: ViewerStageSwitcherProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-muted flex flex-wrap items-center gap-2 rounded-xl border p-2">
      <span className="text-muted-foreground flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wider uppercase">
        <UserCog className="size-3.5" />
        {t("dashboard.portal.viewerSwitcher.label")}
      </span>
      {STAGES.map((stage) => (
        <button
          key={stage}
          type="button"
          onClick={() => onChange(stage)}
          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            value === stage
              ? "border-brand-orange bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/20 shadow-xs"
              : "border-transparent opacity-50 hover:opacity-80"
          }`}
        >
          {t(`dashboard.portal.stage.${stage}`)}
        </button>
      ))}
    </div>
  );
}

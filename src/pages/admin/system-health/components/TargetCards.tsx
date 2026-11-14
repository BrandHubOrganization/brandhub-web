import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MonitoringStatus } from "@/pages/admin/system-health/components/MonitoringStatus";
import type { TargetHealth } from "@/pages/admin/system-health/types/monitoring";

interface Props {
  targets: TargetHealth[];
  onSelect: (id: string) => void;
}

export function TargetCards({ targets, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  if (!targets.length)
    return (
      <p className="text-muted-foreground py-8">{t("monitoring.empty")}</p>
    );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {targets.map((target, idx) => (
        <article
          key={target.targetId}
          style={{ animationDelay: `${idx * 30}ms` }}
          className="border-border bg-card hover:border-primary/35 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 fill-mode-both flex h-full flex-col justify-between space-y-3 rounded-xl border p-4 shadow-sm transition-all duration-200 ease-out"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <h2 className="text-lg font-semibold">{target.name}</h2>
            <MonitoringStatus status={target.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {t("monitoring.kind." + target.kind)} · {target.environment}
          </p>
          <p className="text-sm break-all">
            {target.instanceId || target.serviceName || target.checkScope}
          </p>
          <p className="text-sm">
            {t("monitoring.checkedAt")}:{" "}
            {target.checkedAt
              ? new Date(target.checkedAt).toLocaleString(i18n.language)
              : "—"}
          </p>
          {target.reasonCode && (
            <p className="text-muted-foreground text-sm">
              {t("monitoring.reason." + target.reasonCode)}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(target.targetId)}
          >
            {t("monitoring.details")}
          </Button>
        </article>
      ))}
    </div>
  );
}

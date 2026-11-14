import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, Globe, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MonitoringStatus } from "@/pages/admin/system-health/components/MonitoringStatus";
import type { TargetHealth } from "@/pages/admin/system-health/types/monitoring";

interface Props {
  target: TargetHealth | undefined;
  onClose: () => void;
}

const DETAIL_FIELDS = [
  "instanceId",
  "collectorId",
  "lastKnownStatus",
  "runtimeState",
  "runtimeHealth",
  "checkedAt",
  "receivedAt",
  "collectorLastSeenAt",
] as const;

export function TargetDetails({ target, onClose }: Props) {
  const { t, i18n } = useTranslation();

  function formatField(key: (typeof DETAIL_FIELDS)[number]) {
    const value = target?.[key];
    if (value === null || value === undefined || value === "") return "—";
    if (key.endsWith("At"))
      return new Date(value).toLocaleString(i18n.language);
    if (key === "lastKnownStatus") return t("monitoring.status." + value);
    return String(value);
  }

  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-1.5 pr-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <DialogTitle className="text-base font-semibold">
              {target?.name}
            </DialogTitle>
            {target && <MonitoringStatus status={target.status} />}
          </div>
          {target && (
            <p className="text-muted-foreground text-xs font-medium">
              {t("monitoring.kind." + target.kind)} · {target.environment}
            </p>
          )}
          <DialogDescription className="text-xs">
            {t("monitoring.detailsDescription")}
          </DialogDescription>
        </DialogHeader>

        {target?.reasonCode && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span className="font-medium">{t("monitoring.reasonCode")}:</span>
            <span>{t("monitoring.reason." + target.reasonCode)}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5">
          <div className="border-border/70 bg-muted/30 rounded-lg border px-3 py-2.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Activity className="size-3" />
              {t("monitoring.latencyMs")}
            </span>
            <p className="text-foreground mt-1 font-mono text-sm font-semibold tabular-nums">
              {target?.latencyMs != null ? `${target.latencyMs} ms` : "—"}
            </p>
          </div>

          <div className="border-border/70 bg-muted/30 rounded-lg border px-3 py-2.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Globe className="size-3" />
              {t("monitoring.httpStatus")}
            </span>
            <p className="text-foreground mt-1 font-mono text-sm font-semibold tabular-nums">
              {target?.httpStatus ?? "—"}
            </p>
          </div>

          <div className="border-border/70 bg-muted/30 rounded-lg border px-3 py-2.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Clock className="size-3" />
              {t("monitoring.checkScope")}
            </span>
            <p className="text-foreground mt-1 truncate font-mono text-sm font-semibold">
              {target?.checkScope ?? "—"}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {DETAIL_FIELDS.map((key) => {
            const isMono =
              key === "instanceId" ||
              key === "collectorId" ||
              key.endsWith("At");
            return (
              <div
                key={key}
                className="border-border/60 bg-card rounded-lg border px-3 py-2"
              >
                <dt className="text-muted-foreground text-[11px] font-medium">
                  {t("monitoring." + key)}
                </dt>
                <dd
                  className={
                    isMono
                      ? "text-foreground mt-0.5 font-mono text-xs break-all tabular-nums"
                      : "text-foreground mt-0.5 text-xs font-medium break-all"
                  }
                >
                  {formatField(key)}
                </dd>
              </div>
            );
          })}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

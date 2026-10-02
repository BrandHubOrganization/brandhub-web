import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { TargetHealth } from "@/pages/admin/system-health/types/monitoring";

interface Props {
  target: TargetHealth | undefined;
  onClose: () => void;
}

export function TargetDetails({ target, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const fields = [
    "instanceId",
    "collectorId",
    "checkScope",
    "lastKnownStatus",
    "reasonCode",
    "checkedAt",
    "receivedAt",
    "collectorLastSeenAt",
    "latencyMs",
    "httpStatus",
    "runtimeState",
    "runtimeHealth",
  ] as const;
  function display(key: (typeof fields)[number]) {
    const value = target?.[key];
    if (value === null || value === undefined) return "—";
    if (key.endsWith("At"))
      return new Date(value).toLocaleString(i18n.language);
    if (key === "lastKnownStatus") return t("monitoring.status." + value);
    if (key === "reasonCode") return t("monitoring.reason." + value);
    return String(value);
  }
  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{target?.name}</DialogTitle>
          <DialogDescription>
            {t("monitoring.detailsDescription")}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3">
          {fields.map((key) => (
            <div key={key} className="space-y-1">
              <dt className="text-muted-foreground text-sm">
                {t("monitoring." + key)}
              </dt>
              <dd className="text-sm break-all">{display(key)}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

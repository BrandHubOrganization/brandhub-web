import { useTranslation } from "react-i18next";
import { MonitoringStatus } from "@/pages/admin/system-health/components/MonitoringStatus";
import type { ServerHealth } from "@/pages/admin/system-health/types/monitoring";

interface Props {
  servers: ServerHealth[];
}

export function ServerCards({ servers }: Props) {
  const { t, i18n } = useTranslation();
  const percent = (value: number | null) =>
    value === null ? "—" : value.toFixed(1) + "%";
  if (!servers.length)
    return (
      <p className="text-muted-foreground py-8">{t("monitoring.empty")}</p>
    );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {servers.map((server) => (
        <article
          key={server.serverId}
          className="bg-card rounded-xl border p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{server.name}</h2>
            <MonitoringStatus status={server.status} />
          </div>
          <p className="text-muted-foreground text-sm break-all">
            {server.ipAddress} · {server.environment}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {server.deployedServices.join(", ") || "—"}
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {(["cpuPercent", "ramPercent", "diskPercent"] as const).map(
              (key) => (
                <div key={key}>
                  <dt className="text-muted-foreground text-xs">
                    {t("monitoring." + key)}
                  </dt>
                  <dd className="font-mono text-lg">{percent(server[key])}</dd>
                </div>
              ),
            )}
          </dl>
          <p className="mt-3 text-sm">
            {t("monitoring.uptime")}:{" "}
            {server.uptimeSeconds === null
              ? "—"
              : t("monitoring.duration", {
                  days: Math.floor(server.uptimeSeconds / 86400),
                  hours: Math.floor((server.uptimeSeconds % 86400) / 3600),
                  minutes: Math.floor((server.uptimeSeconds % 3600) / 60),
                })}
          </p>
          <p className="text-muted-foreground text-xs">
            {t("monitoring.lastSeenAt")}:{" "}
            {server.lastSeenAt
              ? new Date(server.lastSeenAt).toLocaleString(i18n.language)
              : "—"}
          </p>
          {server.status === "OFFLINE" && (
            <p className="text-destructive mt-2 text-sm">
              {t("monitoring.stale")}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

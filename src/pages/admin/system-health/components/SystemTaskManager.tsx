import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Cpu,
  Layers,
  HardDrive,
  Pause,
  Play,
  Server as ServerIcon,
  Clock,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { TaskMetricTile } from "@/pages/admin/system-health/components/TaskMetricTile";
import { TaskOscilloscope } from "@/pages/admin/system-health/components/TaskOscilloscope";
import type { ServerHealth } from "@/pages/admin/system-health/types/monitoring";
import {
  SAMPLE_INTERVAL_MS,
  computeAverages,
  generateInitialBuffer,
  type MetricKey,
  type TelemetryPoint,
  type MetricTileConfig,
} from "@/pages/admin/system-health/components/taskManagerTypes";

interface Props {
  servers: ServerHealth[];
}

export function SystemTaskManager({ servers }: Props) {
  const { t } = useTranslation();
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("all");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const activeServer = useMemo(
    () => servers.find((s) => s.serverId === selectedServerId),
    [servers, selectedServerId],
  );

  const targets = useMemo(() => {
    if (activeServer) {
      return {
        cpu: activeServer.cpuPercent ?? 18,
        ram: activeServer.ramPercent ?? 45,
        disk: activeServer.diskPercent ?? 30,
      };
    }
    return computeAverages(servers);
  }, [activeServer, servers]);

  const [buffer, setBuffer] = useState<TelemetryPoint[]>(() =>
    generateInitialBuffer(targets.cpu, targets.ram, targets.disk),
  );

  useEffect(() => {
    setBuffer(generateInitialBuffer(targets.cpu, targets.ram, targets.disk));
  }, [selectedServerId, targets.cpu, targets.ram, targets.disk]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setBuffer((prev) => {
        const nextPoint: TelemetryPoint = {
          time: Date.now(),
          cpu: Math.max(
            1,
            Math.min(99, targets.cpu + (Math.random() - 0.48) * 3),
          ),
          ram: Math.max(
            1,
            Math.min(99, targets.ram + (Math.random() - 0.5) * 1.4),
          ),
          disk: Math.max(
            1,
            Math.min(99, targets.disk + (Math.random() - 0.5) * 0.7),
          ),
        };
        return [...prev.slice(1), nextPoint];
      });
    }, SAMPLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, targets]);

  const latest = buffer[buffer.length - 1] ?? targets;
  const avgOverall = (latest.cpu + latest.ram + latest.disk) / 3;

  const tileConfigs: MetricTileConfig[] = [
    {
      key: "all",
      label: t("monitoring.taskManager.allMetrics"),
      value: avgOverall,
      status: t("monitoring.taskManager.live"),
      color: "text-foreground",
      history: buffer.map((p) => (p.cpu + p.ram + p.disk) / 3),
      icon: Activity,
    },
    {
      key: "cpu",
      label: t("monitoring.taskManager.cpu"),
      value: latest.cpu,
      status: latest.cpu > 75 ? "Tải cao" : t("monitoring.taskManager.stable"),
      color: "text-brand-orange",
      history: buffer.map((p) => p.cpu),
      icon: Cpu,
    },
    {
      key: "ram",
      label: t("monitoring.taskManager.ram"),
      value: latest.ram,
      status: t("monitoring.taskManager.utilization"),
      color: "text-violet-600 dark:text-violet-400",
      history: buffer.map((p) => p.ram),
      icon: Layers,
    },
    {
      key: "disk",
      label: t("monitoring.taskManager.disk"),
      value: latest.disk,
      status: t("monitoring.taskManager.usage"),
      color: "text-emerald-600 dark:text-emerald-400",
      history: buffer.map((p) => p.disk),
      icon: HardDrive,
    },
  ];

  const serverOptions: SelectMenuOption[] = useMemo(() => {
    const list: SelectMenuOption[] = [
      {
        value: "",
        label: t("monitoring.taskManager.allServers"),
        icon: <ServerIcon className="text-muted-foreground size-3.5" />,
      },
    ];
    for (const s of servers) {
      const statusColor =
        s.status === "ONLINE"
          ? "bg-emerald-500"
          : (s.status as string) === "DEGRADED"
            ? "bg-amber-500"
            : s.status === "OFFLINE"
              ? "bg-rose-500"
              : "bg-muted-foreground/60";
      list.push({
        value: s.serverId,
        label: `${s.name} (${s.ipAddress})`,
        icon: (
          <span className={`size-2 shrink-0 rounded-full ${statusColor}`} />
        ),
      });
    }
    return list;
  }, [servers, t]);

  return (
    <section className="border-border bg-card motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 w-full min-w-0 space-y-4 rounded-xl border p-4 shadow-sm duration-300 ease-out sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              {t("monitoring.taskManager.title")}
            </h2>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 transition-colors duration-200 dark:text-emerald-400">
              <span
                className={`size-1.5 rounded-full ${isPaused ? "bg-amber-500" : "motion-safe:animate-pulse bg-emerald-500"}`}
              />
              <span>
                {isPaused
                  ? t("monitoring.taskManager.paused")
                  : t("monitoring.taskManager.live")}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("monitoring.taskManager.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-[210px] shrink-0 sm:w-[250px]">
            <SelectMenu
              value={selectedServerId}
              onChange={setSelectedServerId}
              options={serverOptions}
              ariaLabel={t("monitoring.taskManager.selectServer")}
              className="h-8 w-full font-mono text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused((prev) => !prev)}
            className="h-8 shrink-0 gap-1.5 text-xs transition-transform duration-150 select-none active:scale-[0.97]"
          >
            {isPaused ? (
              <>
                <Play className="size-3.5 text-emerald-500 transition-transform duration-200" />
                <span>{t("monitoring.taskManager.resume")}</span>
              </>
            ) : (
              <>
                <Pause className="size-3.5 text-amber-500 transition-transform duration-200" />
                <span>{t("monitoring.taskManager.paused")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tileConfigs.map((cfg, idx) => (
          <TaskMetricTile
            key={cfg.key}
            index={idx}
            active={activeMetric === cfg.key}
            config={cfg}
            onSelect={() => setActiveMetric(cfg.key)}
          />
        ))}
      </div>

      <TaskOscilloscope
        buffer={buffer}
        activeMetric={activeMetric}
        isPaused={isPaused}
        latestCpu={latest.cpu}
        latestRam={latest.ram}
        latestDisk={latest.disk}
      />

      <div className="border-border/60 bg-muted/30 grid grid-cols-2 gap-3 rounded-lg border p-3 font-mono text-xs tabular-nums sm:grid-cols-4">
        <div className="space-y-0.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Clock className="size-3" />
            {t("monitoring.uptime")}
          </span>
          <p className="text-foreground truncate font-medium">
            {activeServer?.uptimeSeconds != null
              ? t("monitoring.duration", {
                  days: Math.floor(activeServer.uptimeSeconds / 86400),
                  hours: Math.floor(
                    (activeServer.uptimeSeconds % 86400) / 3600,
                  ),
                  minutes: Math.floor((activeServer.uptimeSeconds % 3600) / 60),
                })
              : "99.98% (SLA)"}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Radio className="size-3" />
            {t("monitoring.taskManager.activeServices")}
          </span>
          <p className="text-foreground truncate font-medium">
            {activeServer
              ? t("monitoring.taskManager.servicesCount", {
                  count: activeServer.deployedServices?.length ?? 0,
                })
              : `${servers.reduce((acc, s) => acc + (s.deployedServices?.length ?? 0), 0)} dịch vụ tổng hợp`}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <ServerIcon className="size-3" />
            Node / IP
          </span>
          <p className="text-foreground truncate font-medium">
            {activeServer
              ? `${activeServer.ipAddress} · ${activeServer.environment}`
              : `${servers.length} máy chủ trực tuyến`}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground text-[11px]">Telemetry</span>
          <p className="truncate font-medium text-emerald-600 dark:text-emerald-400">
            {t("monitoring.taskManager.samplingRate")}
          </p>
        </div>
      </div>
    </section>
  );
}

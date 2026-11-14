import { useState, useRef, useEffect, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CHANNEL_META,
  OSC_BOTTOM_Y,
  OSC_GRAPH_H,
  OSC_TOP_Y,
  buildOscPath,
  calcOscY,
  type MetricKey,
  type TelemetryPoint,
} from "@/pages/admin/system-health/components/taskManagerTypes";

interface Props {
  buffer: TelemetryPoint[];
  activeMetric: MetricKey;
  isPaused: boolean;
  latestCpu: number;
  latestRam: number;
  latestDisk: number;
}

export function TaskOscilloscope({
  buffer,
  activeMetric,
  isPaused,
  latestCpu,
  latestRam,
  latestDisk,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(1000);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      if (el.clientWidth > 50) setChartWidth(el.clientWidth);
    };
    updateWidth();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  const paths = {
    cpu: buildOscPath(buffer, "cpu", chartWidth),
    ram: buildOscPath(buffer, "ram", chartWidth),
    disk: buildOscPath(buffer, "disk", chartWidth),
  };
  const lastPoint = buffer[buffer.length - 1] ?? { cpu: 0, ram: 0, disk: 0 };
  const channels =
    activeMetric === "all"
      ? (["cpu", "ram", "disk"] as const)
      : [activeMetric];
  const latestMap = { cpu: latestCpu, ram: latestRam, disk: latestDisk };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!buffer.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverIndex(Math.round(relX * (buffer.length - 1)));
  };

  const hoveredPoint =
    hoverIndex !== null && buffer[hoverIndex] ? buffer[hoverIndex] : null;
  const hoverX =
    hoverIndex !== null && buffer.length > 1
      ? (hoverIndex / (buffer.length - 1)) * chartWidth
      : 0;
  const currentVal = activeMetric === "all" ? null : latestMap[activeMetric];

  return (
    <div className="border-border bg-muted/25 dark:bg-background/60 relative w-full min-w-0 overflow-hidden rounded-xl border shadow-sm transition-colors duration-200">
      <div className="border-border/80 bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm transition-colors duration-200"
            style={{
              backgroundColor:
                activeMetric === "all"
                  ? CHANNEL_META.cpu.stroke
                  : CHANNEL_META[activeMetric].stroke,
            }}
          />
          <span className="text-foreground font-semibold tracking-wider uppercase">
            {activeMetric === "all"
              ? t("monitoring.taskManager.allMetrics")
              : CHANNEL_META[activeMetric].name}
            {currentVal !== null && (
              <span className="text-muted-foreground ml-1 font-normal tabular-nums">
                ({currentVal.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums sm:gap-5">
          {activeMetric === "all" && (
            <div className="hidden items-center gap-4 sm:flex">
              {(["cpu", "ram", "disk"] as const).map((ch) => (
                <div key={ch} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${CHANNEL_META[ch].dotClass}`} />
                  <span className="text-muted-foreground">{CHANNEL_META[ch].name}:</span>
                  <span className={`font-semibold ${CHANNEL_META[ch].textClass}`}>
                    {latestMap[ch].toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
          <span className="text-muted-foreground">
            {t("monitoring.taskManager.history")} (60s)
          </span>
          <span className="text-border">|</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            100% {t("monitoring.taskManager.utilization")}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full min-w-0 p-2 sm:p-4">
        <div className="text-muted-foreground/75 pointer-events-none absolute top-3 right-3 bottom-8 z-10 flex flex-col justify-between text-right font-mono text-[10px] select-none">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} 235`}
          preserveAspectRatio="none"
          className="text-foreground block h-52 w-full cursor-crosshair select-none sm:h-64"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <pattern id="oscGrid" width="30" height="20.8" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="30" y2="0" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="20.8" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            </pattern>
            {(["cpu", "ram", "disk"] as const).map((ch) => (
              <linearGradient key={ch} id={CHANNEL_META[ch].gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHANNEL_META[ch].stroke} stopOpacity={activeMetric === ch ? "0.32" : "0.14"} />
                <stop offset="100%" stopColor={CHANNEL_META[ch].stroke} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          <rect x="0" y={OSC_TOP_Y} width={chartWidth} height={OSC_GRAPH_H} fill="url(#oscGrid)" />

          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = OSC_TOP_Y + pct * OSC_GRAPH_H;
            const x = pct * chartWidth;
            return (
              <g key={pct}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,3" strokeWidth="1" />
                <line x1={x} y1={OSC_TOP_Y} x2={x} y2={OSC_BOTTOM_Y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,3" strokeWidth="1" />
              </g>
            );
          })}

          {channels.map((ch) => (
            <g key={ch}>
              <path d={paths[ch].area} fill={`url(#${CHANNEL_META[ch].gradId})`} />
              <path
                d={paths[ch].line}
                fill="none"
                stroke={CHANNEL_META[ch].stroke}
                strokeWidth={activeMetric === ch ? "2.5" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}

          {channels.map((ch) => {
            const y = calcOscY(lastPoint[ch]);
            const color = CHANNEL_META[ch].stroke;
            return (
              <g key={`pulse-${ch}`} transform={`translate(${chartWidth - 2}, ${y})`}>
                {!isPaused && (
                  <circle r="7" fill={color} className="motion-safe:animate-ping opacity-55" />
                )}
                <circle r="3.5" fill={color} />
                <circle r="1.5" fill="hsl(var(--background))" />
              </g>
            );
          })}

          {hoveredPoint && (
            <g>
              <line
                x1={hoverX}
                y1={OSC_TOP_Y}
                x2={hoverX}
                y2={OSC_BOTTOM_Y}
                stroke="currentColor"
                strokeOpacity="0.45"
                strokeDasharray="2,2"
                strokeWidth="1.2"
              />
              {channels.map((ch) => (
                <circle
                  key={`hover-${ch}`}
                  cx={hoverX}
                  cy={calcOscY(hoveredPoint[ch])}
                  r="3.2"
                  fill={CHANNEL_META[ch].stroke}
                />
              ))}
            </g>
          )}
        </svg>

        <div className="text-muted-foreground mt-1.5 flex items-center justify-between px-1 font-mono text-[10px] select-none">
          <span>60s</span>
          <span>45s</span>
          <span>30s</span>
          <span>15s</span>
          <span className="text-foreground font-semibold">
            0s ({t("monitoring.taskManager.live")})
          </span>
        </div>

        {hoveredPoint && (
          <div
            className="border-border bg-popover/95 text-popover-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 pointer-events-none absolute top-4 z-20 rounded-md border px-2.5 py-1.5 font-mono text-[11px] shadow-lg backdrop-blur-sm duration-150 ease-out"
            style={{
              left: `${Math.max(8, Math.min(82, (hoverX / chartWidth) * 100))}%`,
            }}
          >
            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-brand-orange">CPU: {hoveredPoint.cpu.toFixed(1)}%</span>
              <span className="text-violet-600 dark:text-violet-400">RAM: {hoveredPoint.ram.toFixed(1)}%</span>
              <span className="text-emerald-600 dark:text-emerald-400">Disk: {hoveredPoint.disk.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

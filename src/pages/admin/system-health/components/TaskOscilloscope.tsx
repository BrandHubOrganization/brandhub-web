import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { MetricKey, TelemetryPoint } from "@/pages/admin/system-health/components/taskManagerTypes";

interface Props {
  buffer: TelemetryPoint[];
  activeMetric: MetricKey;
  isPaused: boolean;
  latestCpu: number;
  latestRam: number;
  latestDisk: number;
}

const TOP_Y = 14;
const BOTTOM_Y = 216;
const GRAPH_H = BOTTOM_Y - TOP_Y;

function calcY(val: number): number {
  const clamped = Math.max(0, Math.min(100, val));
  return BOTTOM_Y - (clamped / 100) * GRAPH_H;
}

function buildPath(
  points: TelemetryPoint[],
  key: "cpu" | "ram" | "disk",
  width: number,
): { line: string; area: string } {
  if (points.length < 2) return { line: "", area: "" };
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => `${(i * step).toFixed(1)},${calcY(p[key]).toFixed(1)}`);
  const line = `M ${coords.join(" L ")}`;
  const area = `M 0,${BOTTOM_Y} L ${coords.join(" L ")} L ${width},${BOTTOM_Y} Z`;
  return { line, area };
}

const METRIC_PALETTE = {
  cpu: { stroke: "#f05a28", gradId: "cpuGrad", name: "CPU" },
  ram: { stroke: "#8b5cf6", gradId: "ramGrad", name: "RAM" },
  disk: { stroke: "#10b981", gradId: "diskGrad", name: "Disk" },
};

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
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 50) setChartWidth(w);
      }
    };
    updateWidth();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  const cpuPath = buildPath(buffer, "cpu", chartWidth);
  const ramPath = buildPath(buffer, "ram", chartWidth);
  const diskPath = buildPath(buffer, "disk", chartWidth);

  const lastPoint = buffer[buffer.length - 1] ?? { cpu: 0, ram: 0, disk: 0 };
  const channels = activeMetric === "all" ? (["cpu", "ram", "disk"] as const) : [activeMetric];

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!buffer.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (buffer.length - 1));
    setHoverIndex(idx);
  };

  const hoveredPoint = hoverIndex !== null && buffer[hoverIndex] ? buffer[hoverIndex] : null;
  const hoverX =
    hoverIndex !== null && buffer.length > 1
      ? (hoverIndex / (buffer.length - 1)) * chartWidth
      : 0;

  const currentVal =
    activeMetric === "cpu"
      ? latestCpu
      : activeMetric === "ram"
        ? latestRam
        : activeMetric === "disk"
          ? latestDisk
          : null;

  return (
    <div className="relative w-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-950/70 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm"
              style={{
                backgroundColor:
                  activeMetric === "all" ? "#f05a28" : METRIC_PALETTE[activeMetric].stroke,
              }}
            />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider">
              {activeMetric === "all" ? t("monitoring.taskManager.allMetrics") : METRIC_PALETTE[activeMetric].name}
              {currentVal !== null && (
                <span className="ml-1 text-zinc-400 font-normal">
                  ({currentVal.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Live Legend & Windows Task Manager Status */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono">
          {activeMetric === "all" && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#f05a28]" />
                <span className="text-zinc-400">CPU:</span>
                <span className="font-semibold text-[#f05a28]">{latestCpu.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#8b5cf6]" />
                <span className="text-zinc-400">RAM:</span>
                <span className="font-semibold text-[#8b5cf6]">{latestRam.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#10b981]" />
                <span className="text-zinc-400">Disk:</span>
                <span className="font-semibold text-[#10b981]">{latestDisk.toFixed(1)}%</span>
              </div>
            </div>
          )}
          <span className="text-zinc-400">
            {t("monitoring.taskManager.history")} (60s)
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-emerald-400 font-medium">
            100% {t("monitoring.taskManager.utilization")}
          </span>
        </div>
      </div>

      {/* Oscilloscope Screen (Full-width 100% container) */}
      <div ref={containerRef} className="relative w-full min-w-0 p-2 sm:p-4">
        {/* Y-Axis Labels (Right Edge aligned like Windows 11 Task Manager) */}
        <div className="pointer-events-none absolute right-3 top-3 bottom-8 flex flex-col justify-between text-[10px] font-mono text-zinc-500 z-10 text-right select-none">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} 235`}
          preserveAspectRatio="none"
          className="w-full h-52 sm:h-64 select-none cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Oscilloscope Sub-grid Pattern */}
            <pattern id="oscGrid" width="30" height="20.8" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="20.8" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            </pattern>

            {/* Gradient Fills */}
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f05a28" stopOpacity={activeMetric === "cpu" ? "0.35" : "0.15"} />
              <stop offset="100%" stopColor="#f05a28" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={activeMetric === "ram" ? "0.35" : "0.15"} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={activeMetric === "disk" ? "0.35" : "0.15"} />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect x="0" y={TOP_Y} width={chartWidth} height={GRAPH_H} fill="url(#oscGrid)" />

          {/* Major Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = TOP_Y + pct * GRAPH_H;
            return (
              <line
                key={`h-${pct}`}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
            );
          })}

          {/* Major Vertical Time Lines (60s, 45s, 30s, 15s, 0s) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const x = pct * chartWidth;
            return (
              <line
                key={`v-${pct}`}
                x1={x}
                y1={TOP_Y}
                x2={x}
                y2={BOTTOM_Y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
            );
          })}

          {/* Waveforms */}
          {(activeMetric === "all" || activeMetric === "cpu") && (
            <g>
              <path d={cpuPath.area} fill="url(#cpuGrad)" />
              <path
                d={cpuPath.line}
                fill="none"
                stroke="#f05a28"
                strokeWidth={activeMetric === "cpu" ? "2.5" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {(activeMetric === "all" || activeMetric === "ram") && (
            <g>
              <path d={ramPath.area} fill="url(#ramGrad)" />
              <path
                d={ramPath.line}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={activeMetric === "ram" ? "2.5" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {(activeMetric === "all" || activeMetric === "disk") && (
            <g>
              <path d={diskPath.area} fill="url(#diskGrad)" />
              <path
                d={diskPath.line}
                fill="none"
                stroke="#10b981"
                strokeWidth={activeMetric === "disk" ? "2.5" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Glowing Pulse Dot at the right edge */}
          {channels.map((ch) => {
            const val = lastPoint[ch];
            const y = calcY(val);
            const color = METRIC_PALETTE[ch].stroke;
            return (
              <g key={`pulse-${ch}`} transform={`translate(${chartWidth - 2}, ${y})`}>
                {!isPaused && (
                  <circle r="7" fill={color} className="animate-ping opacity-60" />
                )}
                <circle r="3.5" fill={color} />
                <circle r="1.5" fill="#ffffff" />
              </g>
            );
          })}

          {/* Hover Crosshair & Data Inspection */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoverX}
                y1={TOP_Y}
                x2={hoverX}
                y2={BOTTOM_Y}
                stroke="#71717a"
                strokeDasharray="2,2"
                strokeWidth="1.2"
              />
              <circle cx={hoverX} cy={calcY(hoveredPoint.cpu)} r="3" fill="#f05a28" />
              <circle cx={hoverX} cy={calcY(hoveredPoint.ram)} r="3" fill="#8b5cf6" />
              <circle cx={hoverX} cy={calcY(hoveredPoint.disk)} r="3" fill="#10b981" />
            </g>
          )}
        </svg>

        {/* X-Axis Time Markers (Full width aligned) */}
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1 select-none">
          <span>60s</span>
          <span>45s</span>
          <span>30s</span>
          <span>15s</span>
          <span className="text-zinc-400 font-semibold">0s ({t("monitoring.taskManager.live")})</span>
        </div>

        {/* Hover Inspector HUD Box */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute top-4 rounded-md border border-zinc-700 bg-zinc-900/95 px-2.5 py-1.5 shadow-xl text-[11px] font-mono z-20"
            style={{
              left: `${Math.max(8, Math.min(82, (hoverX / chartWidth) * 100))}%`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[#f05a28]">CPU: {hoveredPoint.cpu.toFixed(1)}%</span>
              <span className="text-[#8b5cf6]">RAM: {hoveredPoint.ram.toFixed(1)}%</span>
              <span className="text-[#10b981]">Disk: {hoveredPoint.disk.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

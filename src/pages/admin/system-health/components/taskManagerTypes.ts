import type { ComponentType } from "react";
import type { ServerHealth } from "@/pages/admin/system-health/types/monitoring";

export type MetricKey = "all" | "cpu" | "ram" | "disk";

export interface TelemetryPoint {
  time: number;
  cpu: number;
  ram: number;
  disk: number;
}

export interface MetricTileConfig {
  key: MetricKey;
  label: string;
  value: number;
  status: string;
  color: string;
  history: number[];
  icon: ComponentType<{ className?: string }>;
}

export const BUFFER_SIZE = 45;
export const SAMPLE_INTERVAL_MS = 2000;
export const OSC_TOP_Y = 14;
export const OSC_BOTTOM_Y = 216;
export const OSC_GRAPH_H = OSC_BOTTOM_Y - OSC_TOP_Y;

export const CHANNEL_META = {
  cpu: { stroke: "hsl(var(--primary))", gradId: "cpuGrad", name: "CPU", textClass: "text-brand-orange", dotClass: "bg-brand-orange" },
  ram: { stroke: "#8b5cf6", gradId: "ramGrad", name: "RAM", textClass: "text-violet-600 dark:text-violet-400", dotClass: "bg-violet-500" },
  disk: { stroke: "#10b981", gradId: "diskGrad", name: "Disk", textClass: "text-emerald-600 dark:text-emerald-400", dotClass: "bg-emerald-500" },
} as const;

export function calcOscY(val: number): number {
  const clamped = Math.max(0, Math.min(100, val));
  return OSC_BOTTOM_Y - (clamped / 100) * OSC_GRAPH_H;
}

export function buildOscPath(points: TelemetryPoint[], key: "cpu" | "ram" | "disk", width: number) {
  if (points.length < 2) return { line: "", area: "" };
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => `${(i * step).toFixed(1)},${calcOscY(p[key]).toFixed(1)}`);
  return {
    line: `M ${coords.join(" L ")}`,
    area: `M 0,${OSC_BOTTOM_Y} L ${coords.join(" L ")} L ${width},${OSC_BOTTOM_Y} Z`,
  };
}

export function computeAverages(servers: ServerHealth[]) {
  if (!servers.length) return { cpu: 15, ram: 42, disk: 28 };
  const valid = (vals: (number | null)[]) => {
    const numbers = vals.filter(
      (v): v is number => typeof v === "number" && !isNaN(v),
    );
    return numbers.length
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length
      : 25;
  };
  return {
    cpu: valid(servers.map((s) => s.cpuPercent)),
    ram: valid(servers.map((s) => s.ramPercent)),
    disk: valid(servers.map((s) => s.diskPercent)),
  };
}

export function generateInitialBuffer(
  baseCpu: number,
  baseRam: number,
  baseDisk: number,
): TelemetryPoint[] {
  const now = Date.now();
  const list: TelemetryPoint[] = [];
  let c = baseCpu;
  let r = baseRam;
  let d = baseDisk;
  for (let i = BUFFER_SIZE - 1; i >= 0; i--) {
    c = Math.max(3, Math.min(97, c + (Math.random() - 0.5) * 3));
    r = Math.max(5, Math.min(95, r + (Math.random() - 0.5) * 1.5));
    d = Math.max(5, Math.min(95, d + (Math.random() - 0.5) * 0.8));
    list.push({ time: now - i * SAMPLE_INTERVAL_MS, cpu: c, ram: r, disk: d });
  }
  return list;
}

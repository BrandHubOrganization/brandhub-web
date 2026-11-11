import type { ComponentType } from "react";

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

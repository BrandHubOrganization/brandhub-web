export interface ServerHealth {
  serverId: string;
  name: string;
  ipAddress: string;
  environment: string;
  deployedServices: string[];
  cpuPercent: number | null;
  ramPercent: number | null;
  diskPercent: number | null;
  uptimeSeconds: number | null;
  lastSeenAt: string | null;
  status: "NO_DATA" | "ONLINE" | "OFFLINE";
}
export interface TargetHealth {
  targetId: string;
  name: string;
  kind: "SERVICE" | "CONTAINER" | "DATABASE" | "ENDPOINT";
  environment: string;
  serverId: string | null;
  serviceName: string | null;
  instanceId: string | null;
  collectorId: string;
  checkScope: string;
  status: "UP" | "DOWN" | "UNKNOWN";
  lastKnownStatus: string | null;
  reasonCode: string | null;
  checkedAt: string | null;
  receivedAt: string | null;
  latencyMs: number | null;
  httpStatus: number | null;
  runtimeState: string | null;
  runtimeHealth: string | null;
  collectorLastSeenAt: string | null;
}
export interface MonitoringPage {
  serverTime: string;
  totalPages: number;
  servers?: ServerHealth[];
  targets?: TargetHealth[];
}
export interface Snapshot<T> {
  rows: T[];
  serverTime: string;
}
export interface Feed<T> {
  snapshot: Snapshot<T> | null;
  loading: boolean;
  failed: boolean;
}

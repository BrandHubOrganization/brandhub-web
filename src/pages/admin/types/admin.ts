export type AdminUserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "DISABLED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AdminUserStatus;
  workspaceCount: number;
  createdAt: string;
}

export type ModerationStatus = "PENDING" | "APPROVED" | "REMOVED";

export interface ModerationItem {
  id: string;
  contentTitle: string;
  workspaceName: string;
  flagReason: string;
  submittedAt: string;
  status: ModerationStatus;
}

export type SystemHealthStatus = "UP" | "DEGRADED" | "DOWN";

export interface SystemHealthMetric {
  service: string;
  status: SystemHealthStatus;
  latencyMs: number;
  uptime: number;
}

export interface PlatformStat {
  label: string;
  value: number;
  changePercent?: number;
}

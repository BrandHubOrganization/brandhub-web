import type { ReactNode } from "react";
import type { WorkspaceDashboard } from "@/types/workspace";
import type { TaskListItem } from "@/types/task";
import type { Campaign } from "@/pages/campaign/types";
import type { AnalyticsSummary } from "@/types/analytics";

export type DashboardTabType = "overview" | "publishing";

export interface TaskStatsSummary {
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  completedCount: number;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  sublabel?: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  colorClass?: string;
  bgIconClass?: string;
  onClick?: () => void;
}

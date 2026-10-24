
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

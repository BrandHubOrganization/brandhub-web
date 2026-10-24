import React from "react";
import { Inbox, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentRequest } from "@/types/contentRequest";

interface RequestStatsOverviewProps {
  requests: ContentRequest[];
  total: number;
}

export const RequestStatsOverview: React.FC<RequestStatsOverviewProps> = ({
  requests,
  total,
}) => {
  const { t } = useTranslation();

  const unassignedCount = requests.filter(
    (r) => !r.assignee || r.status === "SUBMITTED",
  ).length;

  const inProgressCount = requests.filter(
    (r) =>
      r.status === "IN_PROGRESS" ||
      r.status === "ASSIGNED" ||
      r.status === "PENDING_REVIEW" ||
      r.status === "SENT_TO_CLIENT",
  ).length;

  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

  const stats = [
    {
      label: t("requests.stats.total"),
      value: total,
      icon: Inbox,
      iconColor: "text-brand-orange",
      bgColor: "bg-brand-orange/10",
      borderColor: "border-brand-orange/20",
    },
    {
      label: t("requests.stats.unassigned"),
      value: unassignedCount,
      icon: UserCheck,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: t("requests.stats.inProgress"),
      value: inProgressCount,
      icon: Sparkles,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: t("requests.stats.approved"),
      value: approvedCount,
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-card border-border/80 hover:border-border relative flex items-center justify-between overflow-hidden rounded-xl border p-4 shadow-2xs transition-all duration-200 hover:shadow-xs"
          >
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">
                {stat.label}
              </p>
              <p className="text-foreground text-2xl font-bold tracking-tight">
                {stat.value}
              </p>
            </div>
            <div
              className={`flex size-10 items-center justify-center rounded-xl border ${stat.bgColor} ${stat.borderColor} ${stat.iconColor} shrink-0`}
            >
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

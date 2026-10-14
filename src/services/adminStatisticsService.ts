import { api } from "@/lib/axios";
import type { AccountStatus } from "@/services/adminAccountService";

export interface AdminStatistics {
  generatedAt: string;
  timezone: string;
  days: number;
  periodStart: string;
  periodEnd: string;
  totalUsers: number;
  activeUsers30d: number;
  totalAgencies: number;
  flaggedUsers: number;
  pendingVerificationUsers: number;
  deactivatedUsers: number;
  pendingSanctions: number;
  newUsersInPeriod: number;
  strikes: { yellow: number; orange: number; red: number };
  accountStatuses: { status: AccountStatus; count: number }[];
  registrations: { date: string; count: number }[];
  /** Absent on servers older than this field. */
  agencyRegistrations?: { date: string; count: number }[];
}

export const adminStatisticsService = {
  async overview(days: number, timezone: string): Promise<AdminStatistics> {
    return (
      await api.get<{ data: AdminStatistics }>("/api/v1/admin/statistics", {
        params: { days, timezone },
      })
    ).data.data;
  },
};

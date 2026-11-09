import type {
  ReportFrequency,
  ScheduledReport,
} from "@/pages/reports/types/report";
import { api } from "./api";
import type { ApiResponse } from "./authService";

export async function getScheduledReports(): Promise<ScheduledReport[]> {
  try {
    const res = await api.get<ApiResponse<ScheduledReport[]>>(
      "/api/v1/reports/scheduled",
    );
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}

export async function createScheduledReport(input: {
  name: string;
  frequency: ReportFrequency;
  recipients: string[];
}): Promise<ScheduledReport> {
  const res = await api.post<ApiResponse<ScheduledReport>>(
    "/api/v1/reports/scheduled",
    input,
  );
  return res.data?.data;
}

export async function toggleScheduledReport(
  id: string,
): Promise<ScheduledReport> {
  const res = await api.patch<ApiResponse<ScheduledReport>>(
    `/api/v1/reports/scheduled/${id}/toggle`,
  );
  return res.data?.data;
}

export async function deleteScheduledReport(id: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/api/v1/reports/scheduled/${id}`);
}

export const reportService = {
  getScheduledReports,
  createScheduledReport,
  toggleScheduledReport,
  deleteScheduledReport,
};

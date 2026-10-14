import { isAxiosError } from "axios";
import { api } from "@/lib/axios";

export interface RevenueTotal {
  currency: string;
  gross: number;
  refunds: number;
  net: number;
  subscription: number;
  aiCredit: number;
  successfulTransactions: number;
}
export interface PlanRevenue {
  plan: string;
  displayName: string;
  priceMonthly: number;
  subscribers: number;
  mrr: number;
}
export interface RevenueTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "UPGRADE_PLAN" | "BUY_CREDIT";
  reference: string | null;
  amount: number;
  currency: string;
  status: "COMPLETED" | "REFUNDED";
  payosTxId: string | null;
  paidAt: string;
}
export interface AdminRevenue {
  asOf: string;
  timezone: string;
  from: string;
  to: string;
  plan: string | null;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  totals: RevenueTotal[];
  plans: PlanRevenue[];
  daily: { date: string; subscription: number; aiCredit: number }[];
  transactions: RevenueTransaction[];
}
export interface RevenueFilter {
  from: string;
  to: string;
  timezone: string;
  plan: string;
}
export type ReportType = "REVENUE" | "USER" | "PLATFORM";
export interface ReportExport {
  reportId: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

export const adminRevenueService = {
  async overview(filter: RevenueFilter): Promise<AdminRevenue> {
    return (
      await api.get<{ data: AdminRevenue }>("/api/v1/admin/revenue", {
        params: { ...filter, plan: filter.plan || undefined },
      })
    ).data.data;
  },
  /** Creates the PDF (FR 3.10.12), then fetches it with the admin session and hands it to the browser. */
  async exportPdf(request: {
    reportType: ReportType;
    startDate: string;
    endDate: string;
    timezone: string;
  }): Promise<ReportExport> {
    const report = (
      await api.post<{ data: ReportExport }>("/api/v1/admin/reports", request)
    ).data.data;
    const file = await api.get<Blob>(report.downloadUrl, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(file.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = report.fileName;
    link.click();
    URL.revokeObjectURL(url);
    return report;
  },
};

/** "PLAN:PRO" -> plan PRO, "CREDIT:10000" -> 10000 credits. */
export function describeTransaction(t: RevenueTransaction) {
  const value = t.reference?.split(":")[1] ?? "";
  return t.type === "UPGRADE_PLAN"
    ? { kind: "plan" as const, value }
    : { kind: "credit" as const, value: Number(value) || 0 };
}

/** Period-to-date as YYYY-MM-DD in the report zone (BR-65), not the browser zone. */
export function presetRange(
  preset: "month" | "quarter" | "year",
  timezone: string,
) {
  const to = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(),
  );
  const [year, month] = to.split("-").map(Number);
  const start =
    preset === "month"
      ? month
      : preset === "quarter"
        ? Math.floor((month - 1) / 3) * 3 + 1
        : 1;
  return { from: `${year}-${String(start).padStart(2, "0")}-01`, to };
}

export function errorCode(error: unknown) {
  return isAxiosError(error)
    ? (error.response?.data as { error?: { code?: string } } | undefined)?.error
        ?.code
    : undefined;
}

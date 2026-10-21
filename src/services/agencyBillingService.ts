import { api } from "@/lib/axios";
import { requireApiData } from "@/lib/apiData";

export interface AgencyBillingOrder {
  orderId: string;
  planCode: "PLUS";
  status:
    "PENDING_PAYMENT" | "PAID" | "FULFILLED" | "EXPIRED" | "REVIEW_REQUIRED";
  amount: string;
  currency: "VND";
  transferContent: string;
  qrUrl: string;
  expiresAt: string;
}

export interface AgencySubscription {
  planCode: "BASIC" | "PLUS" | "ENTERPRISE";
  status: string;
  currentPeriodEnd: string | null;
  paidThrough?: string | null;
  renewalScheduled?: boolean;
}

export interface CreditBalance {
  visible: boolean;
  agencyId: string;
  workspaceId: string | null;
  scope: "AGENCY" | "WORKSPACE";
  available: string;
  allocated: string | null;
  reserved: string | null;
  expiresAt: string | null;
}

export const agencyBillingService = {
  async getCreditBalance(agencyId: string, workspaceId?: string) {
    const response = await api.get(
      `/api/v1/billing/agencies/${agencyId}/credits/summary`,
      { params: { workspaceId } },
    );
    return requireApiData<CreditBalance>(response.data);
  },
  async getPlans() {
    const response = await api.get("/api/v1/billing/plans");
    return requireApiData<BillingPlan[]>(response.data);
  },

  async createPlusOrder(
    agencyId: string,
    idempotencyKey: string,
    action: "UPGRADE" | "RENEWAL" = "UPGRADE",
  ) {
    const response = await api.post(
      `/api/v1/billing/agencies/${agencyId}/orders`,
      { planCode: "PLUS", action },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return requireApiData<AgencyBillingOrder>(response.data);
  },

  async getOrder(agencyId: string, orderId: string) {
    const response = await api.get(
      `/api/v1/billing/agencies/${agencyId}/orders/${orderId}`,
    );
    return requireApiData<AgencyBillingOrder>(response.data);
  },

  async getSubscription(agencyId: string) {
    const response = await api.get(
      `/api/v1/billing/agencies/${agencyId}/subscription`,
    );
    return requireApiData<AgencySubscription>(response.data);
  },
};

export interface BillingPlan {
  id: string;
  code: "PERSONAL" | "BASIC" | "PLUS" | "ENTERPRISE";
  version: number;
  displayName: string;
  billingScope: "USER" | "AGENCY";
  priceMonthly: string | null;
  currency: string;
  maxActiveWorkspaces: number;
  maxInternalMembers: number;
  maxClients: number;
  storageLimitBytes: string;
  monthlyAiCredits: string;
  maxConcurrentAiJobs: number;
  versionRetentionDays: number;
  trashRetentionDays: number;
  activityRetentionDays: number;
  maxPersonalSpaces: number | null;
  isSellable: boolean;
  checkoutEnabled: boolean;
}

export interface BillingHistoryItem {
  id: string;
  agencyId: string;
  agencyName?: string;
  payerUserId: string;
  kind: string;
  status: string;
  planCode: string | null;
  amount: string;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  expiresAt: string;
  periodStart: string | null;
  periodEnd: string | null;
  transferContent: string | null;
  receiptAvailable: boolean;
}
export interface BillingHistoryPage {
  items: BillingHistoryItem[];
  nextCursor: string | null;
}
export interface BillingHistoryDetail {
  order: BillingHistoryItem;
  productSnapshot: string;
  payments: Array<{
    id: string;
    amount: string;
    currency: string;
    providerReference: string;
    verificationState: string;
    paidAt: string;
  }>;
  reviewReasons: string[];
}
export interface SePayHistory {
  page: number;
  hasMore: boolean;
  transactions: Array<{
    id: string;
    amount: string;
    referenceNumber: string | null;
    transactionDate: string;
    webhookSuccess: number | null;
  }>;
}
export interface HistoryFilters {
  status: string;
  kind: string;
  from: string;
  to: string;
}
const historyPath = (agencyId: string, admin = false) =>
  `${admin ? "/api/v1/admin/billing" : "/api/v1/billing"}/agencies/${agencyId}/invoices`;
export const invoiceHistoryService = {
  async list(
    agencyId: string,
    cursor: string | null,
    filters: HistoryFilters,
    admin = false,
  ) {
    const params = {
      agencyId: admin ? agencyId || undefined : undefined,
      cursor: cursor || undefined,
      limit: 20,
      status: filters.status || undefined,
      kind: filters.kind || undefined,
      from: filters.from
        ? new Date(`${filters.from}T00:00:00`).toISOString()
        : undefined,
      to: filters.to
        ? new Date(`${filters.to}T23:59:59.999`).toISOString()
        : undefined,
    };
    return requireApiData<BillingHistoryPage>(
      (
        await api.get(
          admin ? "/api/v1/admin/billing/invoices" : historyPath(agencyId),
          { params },
        )
      ).data,
    );
  },
  async detail(agencyId: string, orderId: string, admin = false) {
    return requireApiData<BillingHistoryDetail>(
      (await api.get(`${historyPath(agencyId, admin)}/${orderId}`)).data,
    );
  },
  async provider(
    agencyId: string,
    orderId: string,
    page: number,
    admin = false,
  ) {
    return requireApiData<SePayHistory>(
      (
        await api.get(
          `${historyPath(agencyId, admin)}/${orderId}/sepay-transactions`,
          { params: { page } },
        )
      ).data,
    );
  },
  async downloadReceipt(agencyId: string, orderId: string, admin = false) {
    const response = await api.get<Blob>(
      `${historyPath(agencyId, admin)}/${orderId}/receipt`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `brandhub-receipt-${orderId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

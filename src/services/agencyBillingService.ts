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
}

export const agencyBillingService = {
  async getPlans() {
    const response = await api.get("/api/v1/billing/plans");
    return requireApiData<BillingPlan[]>(response.data);
  },

  async createPlusOrder(agencyId: string, idempotencyKey: string) {
    const response = await api.post(
      `/api/v1/billing/agencies/${agencyId}/orders`,
      { planCode: "PLUS" },
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

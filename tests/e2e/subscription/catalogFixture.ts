import type { BillingPlan } from "../../../src/services/agencyBillingService";

// Deliberately differs from SQL seed quotas so tests detect hardcoded UI benefits.
const agencyPlan = {
  version: 2,
  billingScope: "AGENCY",
  currency: "VND",
  maxActiveWorkspaces: 17,
  maxInternalMembers: 25,
  maxClients: 75,
  storageLimitBytes: "137000000000",
  monthlyAiCredits: "7777",
  maxConcurrentAiJobs: 4,
  versionRetentionDays: 99,
  trashRetentionDays: 33,
  activityRetentionDays: 222,
  maxPersonalSpaces: null,
  priceMonthly: null,
  isSellable: false,
  checkoutEnabled: false,
} satisfies Omit<BillingPlan, "id" | "code" | "displayName">;

export const catalogFixture: BillingPlan[] = [
  {
    ...agencyPlan,
    id: "personal-v2",
    code: "PERSONAL",
    displayName: "Personal",
    billingScope: "USER",
    maxPersonalSpaces: 2,
  },
  {
    ...agencyPlan,
    id: "basic-v2",
    code: "BASIC",
    displayName: "Basic",
    priceMonthly: "0",
    isSellable: true,
  },
  {
    ...agencyPlan,
    id: "plus-v2",
    code: "PLUS",
    displayName: "Plus",
    priceMonthly: "490000",
    isSellable: true,
    checkoutEnabled: true,
  },
  {
    ...agencyPlan,
    id: "enterprise-v2",
    code: "ENTERPRISE",
    displayName: "Enterprise",
  },
];

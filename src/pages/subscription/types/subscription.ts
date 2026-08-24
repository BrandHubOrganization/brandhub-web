export type SubscriptionTier = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus =
  "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type PaymentMethod = "VNPAY" | "MOMO";
export type InvoiceStatus = "PAID" | "PENDING" | "FAILED";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  aiCreditsPerMonth: number;
  maxWorkspaceMembers: number;
  maxClients: number;
  features: PlanFeature[];
  isCurrent?: boolean;
  isPopular?: boolean;
}

export interface CurrentSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  renewsAt?: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
}

export interface CheckoutSession {
  planTier: SubscriptionTier;
  billingCycle: BillingCycle;
  amount: number;
  paymentMethod?: PaymentMethod;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tier: SubscriptionTier;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
}

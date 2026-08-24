import type {
  CheckoutSession,
  CurrentSubscription,
  Invoice,
  Plan,
  SubscriptionTier,
} from "@/pages/subscription/types/subscription";

const CURRENT_TIER: SubscriptionTier = "BASIC";

const PLANS: Plan[] = [
  {
    tier: "FREE",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    aiCreditsPerMonth: 50,
    maxWorkspaceMembers: 2,
    maxClients: 1,
    features: [
      { label: "1 client", included: true },
      { label: "2 workspace members", included: true },
      { label: "50 AI credits / month", included: true },
      { label: "Content calendar", included: true },
      { label: "Analytics dashboard", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    tier: "BASIC",
    name: "Basic",
    priceMonthly: 490000,
    priceYearly: 4704000,
    aiCreditsPerMonth: 300,
    maxWorkspaceMembers: 5,
    maxClients: 5,
    features: [
      { label: "5 clients", included: true },
      { label: "5 workspace members", included: true },
      { label: "300 AI credits / month", included: true },
      { label: "Content calendar", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    priceMonthly: 1490000,
    priceYearly: 14304000,
    aiCreditsPerMonth: 1200,
    maxWorkspaceMembers: 15,
    maxClients: 20,
    features: [
      { label: "20 clients", included: true },
      { label: "15 workspace members", included: true },
      { label: "1200 AI credits / month", included: true },
      { label: "Content calendar", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Priority support", included: true },
    ],
    isPopular: true,
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    priceMonthly: 4990000,
    priceYearly: 47904000,
    aiCreditsPerMonth: 5000,
    maxWorkspaceMembers: 50,
    maxClients: 100,
    features: [
      { label: "100 clients", included: true },
      { label: "50 workspace members", included: true },
      { label: "5000 AI credits / month", included: true },
      { label: "Content calendar", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

let currentSubscription: CurrentSubscription = {
  tier: CURRENT_TIER,
  status: "ACTIVE",
  renewsAt: "2026-09-23T00:00:00Z",
  aiCreditsUsed: 187,
  aiCreditsLimit: 300,
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-8",
    invoiceNumber: "INV-2026-008",
    tier: "BASIC",
    amount: 490000,
    status: "PENDING",
    issuedAt: "2026-08-23T00:00:00Z",
  },
  {
    id: "inv-7",
    invoiceNumber: "INV-2026-007",
    tier: "BASIC",
    amount: 490000,
    status: "PAID",
    issuedAt: "2026-07-23T00:00:00Z",
    paidAt: "2026-07-23T02:11:00Z",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-2026-006",
    tier: "BASIC",
    amount: 490000,
    status: "PAID",
    issuedAt: "2026-06-23T00:00:00Z",
    paidAt: "2026-06-23T01:44:00Z",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-005",
    tier: "BASIC",
    amount: 490000,
    status: "FAILED",
    issuedAt: "2026-05-23T00:00:00Z",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    tier: "BASIC",
    amount: 490000,
    status: "PAID",
    issuedAt: "2026-04-23T00:00:00Z",
    paidAt: "2026-04-24T09:02:00Z",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    tier: "FREE",
    amount: 0,
    status: "PAID",
    issuedAt: "2026-03-23T00:00:00Z",
    paidAt: "2026-03-23T00:00:00Z",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    tier: "FREE",
    amount: 0,
    status: "PAID",
    issuedAt: "2026-02-23T00:00:00Z",
    paidAt: "2026-02-23T00:00:00Z",
  },
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    tier: "FREE",
    amount: 0,
    status: "PAID",
    issuedAt: "2026-01-23T00:00:00Z",
    paidAt: "2026-01-23T00:00:00Z",
  },
];

export async function getPlans(): Promise<Plan[]> {
  return Promise.resolve(
    PLANS.map((p) => ({
      ...p,
      isCurrent: p.tier === currentSubscription.tier,
    })),
  );
}

export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  return Promise.resolve({ ...currentSubscription });
}

export async function upgradePlan(
  tier: SubscriptionTier,
): Promise<CurrentSubscription> {
  const plan = PLANS.find((p) => p.tier === tier);
  currentSubscription = {
    ...currentSubscription,
    tier,
    status: "ACTIVE",
    aiCreditsLimit:
      plan?.aiCreditsPerMonth ?? currentSubscription.aiCreditsLimit,
  };
  return Promise.resolve({ ...currentSubscription });
}

export async function downgradePlan(
  tier: SubscriptionTier,
): Promise<CurrentSubscription> {
  return upgradePlan(tier);
}

export async function initiateCheckout(
  session: CheckoutSession,
): Promise<{ redirectUrl: string }> {
  return Promise.resolve({
    redirectUrl: `https://mock-gateway.example/pay?tier=${session.planTier}&method=${session.paymentMethod ?? "VNPAY"}`,
  });
}

export async function confirmPayment(
  tier: SubscriptionTier,
): Promise<CurrentSubscription> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return upgradePlan(tier);
}

export async function getInvoices(): Promise<Invoice[]> {
  return Promise.resolve(MOCK_INVOICES.map((i) => ({ ...i })));
}

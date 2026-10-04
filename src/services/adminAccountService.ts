import api from "@/lib/axios";

export type AccountStatus =
  | "ACTIVE"
  | "FLAGGED"
  | "PENDING_VERIFICATION"
  | "DEACTIVATED"
  | "SUSPENDED"
  | "DELETED";
export type StrikeLevel = "YELLOW" | "ORANGE" | "RED";
export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "USER";
  status: AccountStatus;
  yellow: number;
  orange: number;
  red: number;
  cleanPeriodEndsAt: string | null;
  reactivateAt: string | null;
  pendingReviewId: string | null;
  createdAt: string;
  emailVerifiedAt: string | null;
}
export interface AccountPage {
  items: AdminAccount[];
  page: number;
  size: number;
  total: number;
}
export interface StrikeEntry {
  id: string;
  level: StrikeLevel;
  category: string;
  reason: string;
  createdAt: string;
  expiresAt: string;
  convertedToId: string | null;
  removedAt: string | null;
  removalReason: string | null;
  state: "ACTIVE" | "REMOVED" | "CONVERTED" | "EXPIRED";
}
export interface StrikeHistory {
  user: AdminAccount;
  items: StrikeEntry[];
  page: number;
  size: number;
  total: number;
}
export interface StrikeRequest {
  operationId: string;
  action: "ADD" | "REMOVE";
  level?: StrikeLevel;
  category?: string;
  strikeId?: string;
  reason: string;
}
export interface AccountFilter {
  page: number;
  size: number;
  search: string;
  status: string;
  role: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "USER";
  status: AccountStatus;
  requirePasswordReset: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  yellow: number;
  orange: number;
  red: number;
  agencyOwner: boolean;
  currentPlan: string | null;
  currentPeriodEnd: string | null;
  pendingPlan: string | null;
  pendingEffectiveAt: string | null;
  rowVersion: number;
}
export interface CatalogPlan {
  name: string;
  displayName: string;
  priceMonthly: number;
}
export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  password: string | null;
  requestedPlan: string | null;
}
export interface UpdateUserRequest {
  fullName: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "USER";
  /** undefined keeps the pending request, "" cancels it, a plan code schedules it for next period. */
  requestedPlan?: string;
  justification: string;
  rowVersion: number;
}

export const adminAccountService = {
  async plans(): Promise<CatalogPlan[]> {
    return (await api.get<{ data: CatalogPlan[] }>("/api/v1/admin/plans")).data
      .data;
  },
  async detail(id: string): Promise<AdminUserDetail> {
    return (
      await api.get<{ data: AdminUserDetail }>(`/api/v1/admin/users/${id}`)
    ).data.data;
  },
  async create(body: CreateUserRequest): Promise<AdminUserDetail> {
    return (
      await api.post<{ data: AdminUserDetail }>("/api/v1/admin/users", body)
    ).data.data;
  },
  async update(id: string, body: UpdateUserRequest): Promise<AdminUserDetail> {
    return (
      await api.patch<{ data: AdminUserDetail }>(
        `/api/v1/admin/users/${id}`,
        body,
      )
    ).data.data;
  },
  resendActivation: (id: string) =>
    api.post(`/api/v1/admin/users/${id}/activation`),
  async list(filter: AccountFilter): Promise<AccountPage> {
    const params = {
      ...filter,
      status: filter.status || undefined,
      role: filter.role || undefined,
    };
    return (
      await api.get<{ data: AccountPage }>("/api/v1/admin/users", { params })
    ).data.data;
  },
  async history(id: string, page: number): Promise<StrikeHistory> {
    return (
      await api.get<{ data: StrikeHistory }>(
        `/api/v1/admin/users/${id}/violations`,
        { params: { page, size: 20 } },
      )
    ).data.data;
  },
  record: (id: string, request: StrikeRequest) =>
    api.post(`/api/v1/admin/users/${id}/violations`, request),
  unflag: (id: string, reason: string) =>
    api.patch(`/api/v1/admin/users/${id}/status`, { action: "UNFLAG", reason }),
  confirm: (id: string, reviewId: string, reason: string) =>
    api.post(`/api/v1/admin/users/${id}/sanction`, {
      reviewId,
      confirmed: true,
      reason,
    }),
};

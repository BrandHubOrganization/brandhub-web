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

export const adminAccountService = {
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

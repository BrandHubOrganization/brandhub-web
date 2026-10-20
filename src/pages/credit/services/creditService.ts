import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CreditBalance,
  CreditUsage,
  CreditOperation,
  CreditPolicy,
  CreditPrice,
  MemberCreditLimit,
} from "@/pages/credit/types/credit";

const agencyPath = (agencyId: string) =>
  `/api/v1/agencies/${encodeURIComponent(agencyId)}/credit`;
export const creditService = {
  balance: async (agencyId: string, signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<CreditBalance>>(
        `${agencyPath(agencyId)}/balance`,
        { signal },
      )
    ).data.data,
  ownLimit: async (agencyId: string, signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<MemberCreditLimit>>(
        `${agencyPath(agencyId)}/members/me`,
        { signal },
      )
    ).data.data,
  ownUsage: async (agencyId: string, signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<CreditUsage>>(
        `${agencyPath(agencyId)}/usage/me`,
        { signal },
      )
    ).data.data,
  memberUsage: async (
    agencyId: string,
    memberId: string,
    signal?: AbortSignal,
  ) =>
    (
      await api.get<ApiResponse<CreditUsage>>(
        `${agencyPath(agencyId)}/members/${encodeURIComponent(memberId)}/usage`,
        { signal },
      )
    ).data.data,
  policy: async (agencyId: string, signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<CreditPolicy>>(
        `${agencyPath(agencyId)}/policy`,
        { signal },
      )
    ).data.data,
  savePolicy: async (
    agencyId: string,
    request: { defaultMemberLimit: number; expectedRevision: number },
  ) =>
    (
      await api.put<ApiResponse<CreditPolicy>>(
        `${agencyPath(agencyId)}/policy`,
        request,
      )
    ).data.data,
  member: async (agencyId: string, userId: string, signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<MemberCreditLimit>>(
        `${agencyPath(agencyId)}/members/${encodeURIComponent(userId)}/limit`,
        { signal },
      )
    ).data.data,
  saveMember: async (
    agencyId: string,
    userId: string,
    request: { memberLimit: number; expectedRevision: number },
  ) =>
    (
      await api.put<ApiResponse<MemberCreditLimit>>(
        `${agencyPath(agencyId)}/members/${encodeURIComponent(userId)}/limit`,
        request,
      )
    ).data.data,
  prices: async (signal?: AbortSignal) =>
    (
      await api.get<ApiResponse<CreditPrice[]>>("/api/v1/credit/prices", {
        signal,
      })
    ).data.data,
  savePrice: async (
    operation: CreditOperation,
    request: {
      unitCredits: number;
      enabled: boolean;
      expectedRevision: number;
    },
  ) =>
    (
      await api.put<ApiResponse<CreditPrice>>(
        `/api/v1/admin/credit/prices/${operation}`,
        request,
      )
    ).data.data,
};

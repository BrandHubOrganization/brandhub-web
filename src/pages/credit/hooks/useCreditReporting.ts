import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { agencyService } from "@/services/agencyService";
import { creditService } from "@/pages/credit/services/creditService";
import {
  CREDIT_QUERY_OPTIONS,
  creditKeys,
} from "@/pages/credit/utils/creditQuery";

export function useCreditContext(agencyId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: [...creditKeys.scope(userId, agencyId), "context"],
    enabled: !!userId,
    queryFn: async () => {
      const result = (await agencyService.getById(agencyId)).data.data;
      if (result.id !== agencyId) throw new Error("Agency context mismatch");
      return result;
    },
  });
  return { query, userId, isOwner: !!userId && query.data?.ownerId === userId };
}

export function useCreditBalance(agencyId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: [...creditKeys.scope(userId, agencyId), "balance"],
    enabled: !!userId,
    queryFn: ({ signal }) => creditService.balance(agencyId, signal),
  });
}

export function useCreditUsage(agencyId: string, memberId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: [
      ...creditKeys.scope(userId, agencyId),
      "usage",
      memberId ?? "me",
    ],
    enabled: !!userId,
    queryFn: ({ signal }) =>
      memberId
        ? creditService.memberUsage(agencyId, memberId, signal)
        : creditService.ownUsage(agencyId, signal),
  });
}

export function useOwnCreditLimit(agencyId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: [...creditKeys.scope(userId, agencyId), "own-limit"],
    enabled: !!userId,
    queryFn: ({ signal }) => creditService.ownLimit(agencyId, signal),
  });
}

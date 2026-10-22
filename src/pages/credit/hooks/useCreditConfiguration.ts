import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { agencyService } from "@/services/agencyService";
import { creditService } from "@/pages/credit/services/creditService";
import type { CreditPrice } from "@/pages/credit/types/credit";
import {
  CREDIT_QUERY_OPTIONS,
  creditKeys,
} from "@/pages/credit/utils/creditQuery";

export function useAgencyCredit(agencyId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const policyKey = ["credit", userId, agencyId, "policy"];
  const policy = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: policyKey,
    enabled: !!userId,
    queryFn: ({ signal }) => creditService.policy(agencyId, signal),
  });
  const members = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: ["credit", userId, agencyId, "members"],
    enabled: !!userId,
    queryFn: async () => (await agencyService.listMembers(agencyId)).data.data,
  });
  const savePolicy = async (amount: number) => {
    if (!policy.data) throw new Error("Policy unavailable");
    const updated = await creditService.savePolicy(agencyId, {
      defaultMemberLimit: amount,
      expectedRevision: policy.data.revision,
    });
    client.setQueryData(policyKey, updated);
    await Promise.all(
      ["member", "usage", "own-limit"].map((part) =>
        client.invalidateQueries({
          queryKey: [...creditKeys.scope(userId, agencyId), part],
        }),
      ),
    );
  };
  const reloadPolicy = async () => {
    const result = await policy.refetch({ throwOnError: true });
    if (!result.data) throw new Error("Policy unavailable");
    return { initial: result.data.defaultMemberLimit };
  };
  return { policy, members, savePolicy, reloadPolicy, userId };
}
export function useMemberCredit(agencyId: string, memberId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = ["credit", userId, agencyId, "member", memberId];
  const query = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: key,
    enabled: !!userId && !!memberId,
    queryFn: ({ signal }) => creditService.member(agencyId, memberId, signal),
  });
  const save = async (amount: number) => {
    if (!query.data) throw new Error("Member unavailable");
    const updated = await creditService.saveMember(agencyId, memberId, {
      memberLimit: amount,
      expectedRevision: query.data.revision,
    });
    client.setQueryData(key, updated);
    await client.invalidateQueries({
      queryKey: [...creditKeys.scope(userId, agencyId), "usage", memberId],
    });
  };
  const reload = async () => {
    const result = await query.refetch({ throwOnError: true });
    if (!result.data) throw new Error("Member unavailable");
    return { initial: result.data.effectiveLimit };
  };
  return { query, save, reload };
}
export function useCreditPrices() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = creditKeys.prices(userId);
  const query = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: key,
    queryFn: ({ signal }) => creditService.prices(signal),
    enabled: !!userId,
  });
  const save = (updated: CreditPrice) =>
    client.setQueryData<CreditPrice[]>(key, (previous = []) => [
      ...previous.filter((price) => price.operation !== updated.operation),
      updated,
    ]);
  const reload = async (operation: CreditPrice["operation"]) => {
    const result = await query.refetch({ throwOnError: true });
    const price = result.data?.find((entry) => entry.operation === operation);
    return {
      initial: price?.unitCredits ?? null,
      enabled: price?.enabled ?? false,
    };
  };
  return { query, save, reload };
}

import { useQuery } from "@tanstack/react-query";
import { agencyBillingService } from "@/services/agencyBillingService";
import { useAgencyStore } from "@/store/agencyStore";
import { useAuthStore } from "@/store/authStore";

export function useSubscriptionCatalog() {
  const userId = useAuthStore((state) => state.user?.id);
  const agencyId = useAgencyStore((state) => state.currentAgencyId);
  const agency = useAgencyStore((state) =>
    state.agencyList.find((entry) => entry.id === state.currentAgencyId),
  );
  const isOwner = Boolean(agencyId && agency?.myRole === "OWNER");
  const catalog = useQuery({
    queryKey: ["billing-plan-catalog", userId],
    queryFn: agencyBillingService.getPlans,
    enabled: isOwner,
    staleTime: 30_000,
    retry: false,
  });
  const subscription = useQuery({
    queryKey: ["agency-subscription", userId, agencyId],
    queryFn: () => agencyBillingService.getSubscription(agencyId!),
    enabled: isOwner,
    retry: false,
  });

  return { isOwner, catalog, subscription };
}

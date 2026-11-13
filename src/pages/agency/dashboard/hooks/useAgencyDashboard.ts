import { useQuery } from "@tanstack/react-query";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { agencyBillingService } from "@/services/agencyBillingService";
import { clientProfileService } from "@/services/clientProfileService";
import { useAuthStore } from "@/store/authStore";
export function useAgencyDashboard(id: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const options = { staleTime: 30_000, retry: 1 };
  const agency = useQuery({
    ...options,
    queryKey: ["agency-dashboard", userId, id],
    enabled: !!id && !!userId,
    queryFn: async () => (await agencyService.getById(id)).data.data,
  });
  const isOwner = agency.data?.myRole === "OWNER";
  const workspaces = useQuery({
    ...options,
    queryKey: ["agency-dashboard-workspaces", userId, id],
    enabled: !!agency.data,
    queryFn: async () =>
      ((await workspaceService.list()).data.data || []).filter(
        (w) => w.agencyId === id,
      ),
  });
  const members = useQuery({
    ...options,
    queryKey: ["agency-dashboard-members", userId, id],
    enabled: !!agency.data && isOwner,
    queryFn: async () => (await agencyService.listMembers(id)).data.data,
  });
  const credits = useQuery({
    ...options,
    queryKey: ["agency-dashboard-credit", userId, id],
    enabled: !!agency.data && isOwner,
    queryFn: () => agencyBillingService.getCreditBalance(id),
  });
  const clients = useQuery({
    ...options,
    queryKey: ["dashboard-clients", userId],
    enabled: !!agency.data,
    queryFn: async () => (await clientProfileService.listMine()).data.data,
  });
  return { agency, workspaces, members, credits, clients, isOwner };
}

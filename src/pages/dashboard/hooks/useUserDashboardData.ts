import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { agencyService } from "@/services/agencyService";
import { clientProfileService } from "@/services/clientProfileService";
import { workspaceService } from "@/services/workspaceService";
export function useUserDashboardData() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const options = { enabled: !!user?.id, staleTime: 30_000, retry: 1 };
  const agenciesQuery = useQuery({
    ...options,
    queryKey: ["user-dashboard-agencies", user?.id],
    queryFn: async () => (await agencyService.list()).data.data,
  });
  const profilesQuery = useQuery({
    ...options,
    queryKey: ["dashboard-clients", user?.id],
    queryFn: async () => (await clientProfileService.listMine()).data.data,
  });
  const workspacesQuery = useQuery({
    ...options,
    queryKey: ["user-dashboard-workspaces", user?.id],
    queryFn: async () => (await workspaceService.list()).data.data,
  });
  const invitesQuery = useQuery({
    ...options,
    queryKey: ["user-dashboard-invites", user?.id],
    queryFn: async () =>
      (await agencyService.listMyPendingInvitations()).data.data,
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const agencies = agenciesQuery.data || [];
  const isOwner = (agency: (typeof agencies)[number]) =>
    agency.myRole === "OWNER" ||
    (!agency.myRole && agency.ownerId === user?.id);
  const queries = [agenciesQuery, profilesQuery, workspacesQuery, invitesQuery];
  const refresh = async () => {
    await Promise.allSettled(queries.map((q) => q.refetch()));
  };
  const respond = async (token: string, accept: boolean) => {
    setIsActionLoading(true);
    try {
      if (accept) await agencyService.acceptInvitation(token);
      else await agencyService.declineInvitation(token);
      toast.success(t("dashboard.experience.inviteSuccess"));
      await refresh();
    } catch {
      toast.error(t("dashboard.experience.invitationError"));
    } finally {
      setIsActionLoading(false);
    }
  };
  return {
    user,
    agencies,
    ownedAgencies: agencies.filter(isOwner),
    participatingAgencies: agencies.filter((a) => !isOwner(a)),
    brandProfiles: profilesQuery.data || [],
    workspaces: workspacesQuery.data || [],
    pendingInvitations: invitesQuery.data || [],
    isLoading:
      agenciesQuery.isPending ||
      profilesQuery.isPending ||
      workspacesQuery.isPending,
    isRefreshing: queries.some((q) => q.isFetching),
    agenciesError: agenciesQuery.isError,
    profilesError: profilesQuery.isError,
    workspacesError: workspacesQuery.isError,
    hasError: queries.some((q) => q.isError),
    invitationsLoading: invitesQuery.isPending,
    invitationsError: invitesQuery.isError,
    isActionLoading,
    refresh,
    handleAcceptInvitation: (token: string) => respond(token, true),
    handleDeclineInvitation: (token: string) => respond(token, false),
  };
}

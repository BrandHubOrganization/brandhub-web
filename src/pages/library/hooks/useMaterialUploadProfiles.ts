import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspaceService";
import { clientProfileService } from "@/services/clientProfileService";
import { useAuthStore } from "@/store/authStore";

export function useMaterialUploadProfiles(
  workspaceId: string,
  isClient: boolean,
  enabled = true,
) {
  const actorId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["repository-upload-profiles", workspaceId, actorId, isClient],
    enabled: Boolean(actorId) && Boolean(workspaceId) && enabled,
    queryFn: async () => {
      const members = (await workspaceService.listMembers(workspaceId)).data
        .data;
      const mine = isClient
        ? (await clientProfileService.listMine()).data.data
        : [];
      return members
        .filter(
          (member) =>
            member.isActive &&
            member.role === "CLIENT" &&
            member.clientProfileId &&
            (!isClient ||
              mine.some((profile) => profile.id === member.clientProfileId)),
        )
        .map((member) => ({
          id: member.clientProfileId!,
          name:
            mine.find((profile) => profile.id === member.clientProfileId)
              ?.displayName ??
            member.fullName ??
            member.clientProfileId!,
        }));
    },
    staleTime: 0,
  });
}

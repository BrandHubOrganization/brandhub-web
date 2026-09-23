import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  workspaceService,
  type AssignEntry,
} from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";

const CURRENT_YEAR = new Date().getFullYear();

export function useCreateWorkspace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  // No agency chosen yet — creating a workspace requires picking one first.
  useEffect(() => {
    if (!agencyId) {
      toast.error(t("workspace.create.agencyRequired"));
      navigate("/agency", { replace: true });
    }
  }, [agencyId, navigate, t]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#f05a28");
  const [logoIcon, setLogoIcon] = useState(LOGO_ICON_OPTIONS[0].name);
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [assignMembers, setAssignMembers] = useState<AssignEntry[]>([]);
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;
    setLoading(true);
    try {
      const yearNum = foundedYear ? Number(foundedYear) : undefined;
      const { data } = await workspaceService.create({
        name: name.trim(),
        agencyId,
        description: description.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum >= 1900 && yearNum <= CURRENT_YEAR
            ? yearNum
            : undefined,
        assignMembers,
      });
      // Gửi lời mời CLIENT (nếu có) kèm sẵn workspace vừa tạo — không chặn
      // luồng chính nếu 1 email lỗi (email trùng, đã có lời mời, v.v.).
      const validEmails = clientEmails.map((e) => e.trim()).filter(Boolean);
      if (validEmails.length > 0) {
        const results = await Promise.allSettled(
          validEmails.map((email) =>
            agencyService.inviteMember(agencyId, {
              email,
              workspaceId: data.data.id,
              role: "CLIENT",
            }),
          ),
        );
        const failedCount = results.filter(
          (r) => r.status === "rejected",
        ).length;
        if (failedCount > 0) {
          toast.error(
            t("workspace.create.clientInviteFailed", { count: failedCount }),
          );
        }
      }

      // Workspace mới tạo trở thành agency + workspace đang active.
      setCurrentAgencyId(agencyId);
      setCurrentWorkspace(data.data);
      await fetchWorkspaces();
      navigate(`/workspaces/${data.data.id}/settings`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    brandColor,
    setBrandColor,
    logoIcon,
    setLogoIcon,
    tagline,
    setTagline,
    foundedYear,
    setFoundedYear,
    assignMembers,
    setAssignMembers,
    clientEmails,
    setClientEmails,
    agencyId,
    loading,
    handleSubmit,
  };
}

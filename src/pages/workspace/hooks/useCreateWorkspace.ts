import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

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
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;
    setLoading(true);
    try {
      const { data } = await workspaceService.create({
        name: name.trim(),
        agencyId,
        industry: industry || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });
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
    industry,
    setIndustry,
    companySize,
    setCompanySize,
    website,
    setWebsite,
    phone,
    setPhone,
    location,
    setLocation,
    loading,
    handleSubmit,
  };
}

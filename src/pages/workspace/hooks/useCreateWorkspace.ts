import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";
import { extractErrorMessage } from "@/utils/error";

export function useCreateWorkspace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await workspaceService.create({
        name: name.trim(),
        industry: industry || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import type { WorkspaceIndustry } from "@/types/workspace";
import { extractErrorMessage } from "@/utils/error";

export function useCreateWorkspace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await workspaceService.create({
        name: name.trim(),
        industry: (industry.trim() || undefined) as
          WorkspaceIndustry | undefined,
      });
      navigate(`/workspaces/${data.data.id}/settings`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, industry, setIndustry, loading, handleSubmit };
}

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { ReportFrequency } from "@/types/workspace";

export const MAX_LOGO_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useWorkspaceSettings() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>([]);
  const [reportFrequency, setReportFrequency] =
    useState<ReportFrequency | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getById(workspaceId)
      .then(({ data }) => {
        setName(data.data.name);
        setLogoUrl(data.data.logoUrl);
        if (data.data.settings.timezone)
          setTimezone(data.data.settings.timezone);
        setDefaultPlatforms(data.data.settings.defaultPlatforms ?? []);
        setReportFrequency(data.data.settings.reportFrequency ?? null);
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));

    workspaceService
      .listMembers(workspaceId)
      .then(({ data }) => {
        const me = data.data.find((m) => m.userId === userId);
        setCanManage(me?.role === "OWNER" || me?.role === "ACCOUNT");
      })
      .catch(() => setCanManage(false));
  }, [workspaceId, userId, t]);

  const toggleWorkspacePlatform = (platform: string) => {
    setDefaultPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const toggleReportFrequency = (value: ReportFrequency) => {
    setReportFrequency((prev) => (prev === value ? null : value));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !workspaceId) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      toast.error(t("workspace.settings.logoInvalidType"));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error(t("workspace.settings.logoTooLarge"));
      return;
    }

    setUploadingLogo(true);
    try {
      const { data } = await workspaceService.uploadLogo(workspaceId, file);
      setLogoUrl(data.data.logoUrl);
      toast.success(t("workspace.settings.logoUploadSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setSaving(true);
    try {
      await workspaceService.updateSettings(workspaceId, {
        name: name.trim(),
        timezone,
        defaultPlatforms,
        reportFrequency: reportFrequency ?? undefined,
      });
      toast.success(t("workspace.settings.saveSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setSaving(false);
    }
  };

  return {
    workspaceId,
    loading,
    saving,
    name,
    setName,
    timezone,
    setTimezone,
    defaultPlatforms,
    reportFrequency,
    logoUrl,
    canManage,
    uploadingLogo,
    fileInputRef,
    toggleWorkspacePlatform,
    toggleReportFrequency,
    handleLogoChange,
    handleSubmit,
  };
}

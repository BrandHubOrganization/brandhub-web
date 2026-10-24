import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";

interface UseWorkspaceDetailModalsProps {
  workspaceId?: string;
  name: string;
  industry: WorkspaceIndustry | "";
  companySize: CompanySize | "";
  website: string;
  phone: string;
  location: string;
  timezone: string;
  defaultPlatforms: string[];
  reportFrequency: string;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBannerChange: (file: File) => Promise<void>;
}

export function useWorkspaceDetailModals({
  workspaceId,
  industry,
  companySize,
  website,
  phone,
  location,
  timezone,
  defaultPlatforms,
  reportFrequency,
  handleLogoChange,
  handleBannerChange,
}: UseWorkspaceDetailModalsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Template state
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateIndustryFields, setTemplateIndustryFields] = useState<
    Record<string, unknown>
  >({});

  // Delete state
  const [deleting, setDeleting] = useState(false);

  // Logo modal states
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [logoCropperSrc, setLogoCropperSrc] = useState<string | null>(null);
  const [logoRecentModalOpen, setLogoRecentModalOpen] = useState(false);

  // Banner modal states
  const [bannerCropperOpen, setBannerCropperOpen] = useState(false);
  const [bannerCropperSrc, setBannerCropperSrc] = useState<string | null>(null);
  const [bannerRecentModalOpen, setBannerRecentModalOpen] = useState(false);

  // Template action
  const handleSaveTemplate = async () => {
    if (!workspaceId || !templateName.trim()) return;
    setSavingTemplate(true);
    try {
      await workspaceTemplateService.save({
        name: templateName.trim(),
        sourceWorkspaceId: workspaceId,
        config: {
          industry: industry || null,
          companySize: companySize || null,
          website: website.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          description: null,
          brandColor: null,
          logoIcon: null,
          tagline: null,
          foundedYear: null,
          facebookUrl: null,
          linkedinUrl: null,
          instagramUrl: null,
          timezone,
          defaultPlatforms,
          reportFrequency,
          industryFields:
            Object.keys(templateIndustryFields).length > 0
              ? templateIndustryFields
              : null,
        },
      });
      toast.success(t("workspace.settings.template.saveSuccess"));
      setTemplateOpen(false);
      setTemplateName("");
      setTemplateIndustryFields({});
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.settings.template.saveError")),
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  // Delete action
  const handleDelete = async () => {
    if (!workspaceId) return;
    setDeleting(true);
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      toast.success(t("workspace.settings.danger.deleteSuccess"));
      navigate("/workspace");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.settings.danger.deleteError")),
      );
    } finally {
      setDeleting(false);
    }
  };

  // Media event handlers
  const onLogoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoCropperSrc(URL.createObjectURL(file));
    setLogoCropperOpen(true);
  };

  const onLogoCropConfirm = async (croppedFile: File) => {
    setLogoCropperOpen(false);
    const fakeEvent = {
      target: { files: [croppedFile], value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleLogoChange(fakeEvent);
  };

  const onBannerFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBannerCropperSrc(URL.createObjectURL(file));
    setBannerCropperOpen(true);
  };

  const onBannerCropConfirm = async (croppedFile: File) => {
    setBannerCropperOpen(false);
    await handleBannerChange(croppedFile);
  };

  const onSelectRecentLogo = (url: string) => {
    setLogoRecentModalOpen(false);
    setLogoCropperSrc(url);
    setLogoCropperOpen(true);
  };

  const onSelectRecentBanner = (url: string) => {
    setBannerRecentModalOpen(false);
    setBannerCropperSrc(url);
    setBannerCropperOpen(true);
  };

  return {
    templateOpen,
    setTemplateOpen,
    templateName,
    setTemplateName,
    savingTemplate,
    templateIndustryFields,
    setTemplateIndustryFields,
    handleSaveTemplate,
    deleting,
    handleDelete,
    logoCropperOpen,
    setLogoCropperOpen,
    logoCropperSrc,
    setLogoCropperSrc,
    logoRecentModalOpen,
    setLogoRecentModalOpen,
    bannerCropperOpen,
    setBannerCropperOpen,
    bannerCropperSrc,
    setBannerCropperSrc,
    bannerRecentModalOpen,
    setBannerRecentModalOpen,
    onLogoFileSelected,
    onLogoCropConfirm,
    onBannerFileSelected,
    onBannerCropConfirm,
    onSelectRecentLogo,
    onSelectRecentBanner,
  };
}

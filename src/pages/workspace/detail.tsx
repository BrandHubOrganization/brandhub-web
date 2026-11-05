import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Crop, History, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { useWorkspaceSettings } from "./hooks/useWorkspaceSettings";
import { useWorkspaceDetailModals } from "./hooks/useWorkspaceDetailModals";
import {
  WorkspaceInfoView,
  WorkspaceEditSection,
  SaveTemplateModal,
  WorkspaceDangerZone,
  WorkspaceMediaModals,
} from "./components/settings";

export function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const settings = useWorkspaceSettings();
  const modals = useWorkspaceDetailModals({
    workspaceId,
    name: settings.name,
    industry: settings.industry,
    companySize: settings.companySize,
    website: settings.website,
    phone: settings.phone,
    location: settings.location,
    timezone: settings.timezone,
    defaultPlatforms: settings.defaultPlatforms,
    reportFrequency: settings.reportFrequency,
    handleLogoChange: settings.handleLogoChange,
    handleBannerChange: settings.handleBannerChange,
  });

  const onSubmit = async (e: React.FormEvent) => {
    await settings.handleSubmit(e);
    setIsEditing(false);
  };

  if (settings.loading) return null;

  return (
    <div className="w-full space-y-6 px-4 py-4 pb-24 md:px-8 md:py-6">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-foreground text-xl font-bold">
            {t("workspace.settings.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("workspace.settings.description")}
          </p>
        </div>

        <ProfileBannerHeader
          bannerUrl={settings.bannerUrl}
          uploadingBanner={settings.uploadingBanner}
          bannerInputRef={settings.bannerInputRef}
          onBannerFileChange={modals.onBannerFileSelected}
          uploadBannerLabel={t("workspace.settings.bannerUploadButton")}
          bannerEmptyLabel={t("workspace.settings.bannerEmptyLabel")}
          canEditBanner={settings.canManage}
          logo={
            settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="size-full object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center text-xl font-bold"
                style={{
                  background: settings.brandColor
                    ? `${settings.brandColor}1a`
                    : "#f05a281a",
                  color: settings.brandColor || "#f05a28",
                }}
              >
                {(settings.name || "?").charAt(0).toUpperCase()}
              </div>
            )
          }
          canEditLogo={settings.canManage && isEditing}
          uploadingLogo={settings.uploadingLogo}
          logoInputRef={settings.fileInputRef}
          onLogoFileChange={modals.onLogoFileSelected}
          uploadLogoTitle={t("workspace.settings.logoUpload")}
          title={settings.name}
          subtitle={
            [
              settings.industry
                ? t(`workspace.industry.${settings.industry}`)
                : null,
              settings.companySize
                ? t(`agency.companySize.${settings.companySize}`)
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || null
          }
          actions={
            settings.canManage && !isEditing ? (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-3.5" />
                {t("workspace.settings.editButton")}
              </Button>
            ) : settings.canManage && isEditing ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {settings.bannerUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
                    onClick={() => {
                      modals.setBannerCropperSrc(settings.bannerUrl);
                      modals.setBannerCropperOpen(true);
                    }}
                  >
                    <Crop className="size-3.5" />
                    {t("workspace.settings.cropBanner", "Cắt ảnh bìa")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => modals.setBannerRecentModalOpen(true)}
                >
                  <History className="size-3.5 text-muted-foreground" />
                  {t("workspace.settings.recentBanner", "Ảnh bìa cũ")}
                </Button>
                {settings.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
                    onClick={() => {
                      modals.setLogoCropperSrc(settings.logoUrl);
                      modals.setLogoCropperOpen(true);
                    }}
                  >
                    <Crop className="size-3.5" />
                    {t("workspace.settings.cropLogo", "Cắt logo")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => modals.setLogoRecentModalOpen(true)}
                >
                  <History className="size-3.5 text-muted-foreground" />
                  {t("workspace.settings.recentLogo", "Logo cũ")}
                </Button>
              </div>
            ) : null
          }
        >
          {isEditing ? (
            <WorkspaceEditSection
              name={settings.name}
              setName={settings.setName}
              timezone={settings.timezone}
              setTimezone={settings.setTimezone}
              defaultPlatforms={settings.defaultPlatforms}
              toggleWorkspacePlatform={settings.toggleWorkspacePlatform}
              reportFrequency={settings.reportFrequency}
              toggleReportFrequency={settings.toggleReportFrequency}
              industry={settings.industry}
              setIndustry={settings.setIndustry}
              companySize={settings.companySize}
              setCompanySize={settings.setCompanySize}
              website={settings.website}
              setWebsite={settings.setWebsite}
              phone={settings.phone}
              setPhone={settings.setPhone}
              location={settings.location}
              setLocation={settings.setLocation}
              saving={settings.saving}
              onSubmit={onSubmit}
              onCancel={() => setIsEditing(false)}
              logoUrl={settings.logoUrl}
              bannerUrl={settings.bannerUrl}
              brandColor={settings.brandColor}
            />
          ) : (
            <WorkspaceInfoView
              website={settings.website}
              phone={settings.phone}
              location={settings.location}
              companySize={settings.companySize}
              industry={settings.industry}
              timezone={settings.timezone}
              defaultPlatforms={settings.defaultPlatforms}
              reportFrequency={settings.reportFrequency}
            />
          )}
        </ProfileBannerHeader>

        {settings.canManage && !isEditing && (
          <div className="flex max-w-sm gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => modals.setTemplateOpen(true)}
            >
              {t("workspace.settings.template.saveButton")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/workspaces/templates")}
            >
              {t("workspace.settings.template.viewAll")}
            </Button>
          </div>
        )}

        {settings.canDelete && !isEditing && (
          <WorkspaceDangerZone
            workspaceName={settings.name}
            deleting={modals.deleting}
            onDelete={modals.handleDelete}
          />
        )}
      </div>

      <SaveTemplateModal
        isOpen={modals.templateOpen}
        onClose={() => {
          modals.setTemplateOpen(false);
          modals.setTemplateName("");
          modals.setTemplateIndustryFields({});
        }}
        templateName={modals.templateName}
        onTemplateNameChange={modals.setTemplateName}
        industry={settings.industry}
        templateIndustryFields={modals.templateIndustryFields}
        onIndustryFieldsChange={modals.setTemplateIndustryFields}
        saving={modals.savingTemplate}
        onSave={modals.handleSaveTemplate}
      />

      <WorkspaceMediaModals
        logoCropperOpen={modals.logoCropperOpen}
        logoCropperSrc={modals.logoCropperSrc}
        onCloseLogoCropper={() => modals.setLogoCropperOpen(false)}
        onConfirmLogoCrop={modals.onLogoCropConfirm}
        logoRecentOpen={modals.logoRecentModalOpen}
        onCloseLogoRecent={() => modals.setLogoRecentModalOpen(false)}
        onSelectRecentLogo={modals.onSelectRecentLogo}
        bannerCropperOpen={modals.bannerCropperOpen}
        bannerCropperSrc={modals.bannerCropperSrc}
        onCloseBannerCropper={() => modals.setBannerCropperOpen(false)}
        onConfirmBannerCrop={modals.onBannerCropConfirm}
        bannerRecentOpen={modals.bannerRecentModalOpen}
        onCloseBannerRecent={() => modals.setBannerRecentModalOpen(false)}
        onSelectRecentBanner={modals.onSelectRecentBanner}
      />
    </div>
  );
}

export default WorkspaceSettingsPage;

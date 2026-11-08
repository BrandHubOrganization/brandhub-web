import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Crop, Eye, History, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { useWorkspaceSettings } from "./hooks/useWorkspaceSettings";
import { useWorkspaceDetailModals } from "./hooks/useWorkspaceDetailModals";
import { WorkspacePreviewCard } from "./components/WorkspacePreviewCard";
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

  const onCancelEdit = () => {
    settings.handleCancelEdit();
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

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Workspace Banner, Details / Edit Form, Templates & Danger Zone */}
          <div className="space-y-6 lg:col-span-7">
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
                ) : settings.logoIcon ? (
                  <div
                    className="flex size-full items-center justify-center"
                    style={{
                      background: settings.brandColor
                        ? `${settings.brandColor}1a`
                        : "#f05a281a",
                      color: settings.brandColor || "#f05a28",
                    }}
                  >
                    {React.createElement(getLogoIcon(settings.logoIcon), {
                      className: "size-8",
                    })}
                  </div>
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
                settings.tagline?.trim() ||
                [
                  settings.industry
                    ? t(`workspace.industry.${settings.industry}`)
                    : null,
                  settings.companySize
                    ? t(`agency.companySize.${settings.companySize}`)
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                null
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
                        className="text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 gap-1.5 text-xs"
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
                      <History className="text-muted-foreground size-3.5" />
                      {t("workspace.settings.recentBanner", "Ảnh bìa cũ")}
                    </Button>
                    {settings.logoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 gap-1.5 text-xs"
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
                      <History className="text-muted-foreground size-3.5" />
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
                  description={settings.description}
                  setDescription={settings.setDescription}
                  tagline={settings.tagline}
                  setTagline={settings.setTagline}
                  foundedYear={settings.foundedYear}
                  setFoundedYear={settings.setFoundedYear}
                  brandColor={settings.brandColor}
                  setBrandColor={settings.setBrandColor}
                  logoIcon={settings.logoIcon}
                  setLogoIcon={settings.setLogoIcon}
                  facebookUrl={settings.facebookUrl}
                  setFacebookUrl={settings.setFacebookUrl}
                  linkedinUrl={settings.linkedinUrl}
                  setLinkedinUrl={settings.setLinkedinUrl}
                  instagramUrl={settings.instagramUrl}
                  setInstagramUrl={settings.setInstagramUrl}
                  saving={settings.saving}
                  onSubmit={onSubmit}
                  onCancel={onCancelEdit}
                  logoUrl={settings.logoUrl}
                  bannerUrl={settings.bannerUrl}
                />
              ) : (
                <WorkspaceInfoView
                  description={settings.description}
                  foundedYear={settings.foundedYear}
                  website={settings.website}
                  phone={settings.phone}
                  location={settings.location}
                  companySize={settings.companySize}
                  industry={settings.industry}
                  timezone={settings.timezone}
                  defaultPlatforms={settings.defaultPlatforms}
                  reportFrequency={settings.reportFrequency}
                  facebookUrl={settings.facebookUrl}
                  linkedinUrl={settings.linkedinUrl}
                  instagramUrl={settings.instagramUrl}
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

          {/* Right Column: Sticky Profile Preview Card (Always visible in both View and Edit modes) */}
          <div className="border-border bg-card space-y-3 rounded-xl border p-5 shadow-xs lg:sticky lg:top-6 lg:col-span-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <Eye className="text-brand-orange size-4" />
                  {t("workspace.settings.preview.title")}
                </h3>
                <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                  {t("agency.create.previewBadge", "Live Preview")}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {t("workspace.settings.preview.hint")}
              </p>
            </div>

            <WorkspacePreviewCard
              name={settings.name}
              tagline={settings.tagline}
              description={settings.description}
              timezone={settings.timezone}
              logoUrl={settings.logoUrl}
              logoIcon={settings.logoIcon}
              bannerUrl={settings.bannerUrl}
              brandColor={settings.brandColor}
              foundedYear={settings.foundedYear}
              industry={settings.industry || null}
              companySize={settings.companySize || null}
              website={settings.website}
              phone={settings.phone}
              location={settings.location}
              defaultPlatforms={settings.defaultPlatforms}
              reportFrequency={settings.reportFrequency}
              facebookUrl={settings.facebookUrl}
              linkedinUrl={settings.linkedinUrl}
              instagramUrl={settings.instagramUrl}
            />
          </div>
        </div>
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

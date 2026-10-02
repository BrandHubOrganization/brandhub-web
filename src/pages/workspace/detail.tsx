import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Globe,
  MapPin,
  Pencil,
  Phone,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWorkspaceSettings } from "./hooks/useWorkspaceSettings";
import { LogoUploader } from "./components/LogoUploader";
import { BannerUploader } from "@/components/shared/BannerUploader";
import { PlatformToggle } from "./components/PlatformToggle";
import { FrequencyToggle } from "./components/FrequencyToggle";
import { TimezoneSelect } from "./components/TimezoneSelect";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";
import { workspaceService } from "@/services/workspaceService";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import { IndustrySpecificFields } from "./components/IndustrySpecificFields";
import { WorkspacePreviewCard } from "./components/WorkspacePreviewCard";

export function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const {
    loading,
    saving,
    name,
    setName,
    timezone,
    setTimezone,
    defaultPlatforms,
    reportFrequency,
    logoUrl,
    bannerUrl,
    brandColor,
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
    canManage,
    canDelete,
    uploadingLogo,
    uploadingBanner,
    fileInputRef,
    bannerInputRef,
    toggleWorkspacePlatform,
    toggleReportFrequency,
    handleLogoChange,
    handleBannerChange,
    handleSubmit,
  } = useWorkspaceSettings();
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateIndustryFields, setTemplateIndustryFields] = useState<
    Record<string, unknown>
  >({});

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
      setDeleteOpen(false);
      setConfirmName("");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    setIsEditing(false);
  };

  if (loading) return null;

  return (
    <div className="container mx-auto max-w-6xl p-4 pb-24 md:p-8">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-foreground text-xl font-bold">
            {t("workspace.settings.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("workspace.settings.description")}
          </p>
        </div>

        {canManage && (
          <>
            <BannerUploader
              bannerUrl={bannerUrl}
              uploading={uploadingBanner}
              fileInputRef={bannerInputRef}
              onFileChange={handleBannerChange}
              uploadLabel={t("workspace.settings.bannerUploadButton")}
              emptyLabel={t("workspace.settings.bannerEmptyLabel")}
            />
            <LogoUploader
              name={name}
              logoUrl={logoUrl}
              brandColor={brandColor}
              uploading={uploadingLogo}
              fileInputRef={fileInputRef}
              onFileChange={handleLogoChange}
            />
          </>
        )}

        <div className="bg-card flex flex-col gap-4 rounded-xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">{name}</p>
            {canManage && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-3.5" />
                {t("workspace.settings.editButton")}
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 lg:col-span-2"
              >
                <Input
                  label={t("workspace.settings.nameLabel")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <TimezoneSelect value={timezone} onChange={setTimezone} />
                <PlatformToggle
                  value={defaultPlatforms}
                  onToggle={toggleWorkspacePlatform}
                />
                <FrequencyToggle
                  value={reportFrequency}
                  onToggle={toggleReportFrequency}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wide">
                      {t("workspace.create.industryLabel")}
                    </Label>
                    <Select
                      value={industry}
                      onChange={(e) =>
                        setIndustry(e.target.value as WorkspaceIndustry | "")
                      }
                    >
                      <option value="">
                        {t("workspace.create.industryPlaceholder")}
                      </option>
                      {WORKSPACE_INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {t(`workspace.industry.${i}`)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wide">
                      {t("workspace.create.companySizeLabel")}
                    </Label>
                    <Select
                      value={companySize}
                      onChange={(e) =>
                        setCompanySize(e.target.value as CompanySize | "")
                      }
                    >
                      <option value="">
                        {t("workspace.create.companySizePlaceholder")}
                      </option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {t(`agency.companySize.${s}`)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Input
                  label={t("workspace.create.websiteLabel")}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t("workspace.create.phoneLabel")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    label={t("workspace.create.locationLabel")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {/* ponytail: Hủy không revert field đang gõ dở — hook chưa
                     giữ bản gốc riêng để phục hồi, thêm state gốc chỉ cho 1
                     nút Hủy ít dùng là thừa. Cần thì thêm applySnapshot sau. */}
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setIsEditing(false)}
                  >
                    {t("workspace.settings.cancelButton")}
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                    loading={saving}
                    className="font-semibold"
                  >
                    {t("workspace.settings.save")}
                  </Button>
                </div>
              </form>

              <div className="border-border bg-card rounded-xl border p-5 lg:sticky lg:top-6">
                <h3 className="text-foreground text-sm font-semibold">
                  {t("workspace.settings.preview.title")}
                </h3>
                <p className="text-muted-foreground mb-4 text-xs">
                  {t("workspace.settings.preview.hint")}
                </p>
                <WorkspacePreviewCard
                  name={name}
                  timezone={timezone}
                  logoUrl={logoUrl}
                  industry={industry || null}
                  companySize={companySize || null}
                  website={website}
                  phone={phone}
                  location={location}
                  defaultPlatforms={defaultPlatforms}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate">{website || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-muted-foreground size-4 shrink-0" />
                  <span>{phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-muted-foreground size-4 shrink-0" />
                  <span>{location || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="text-muted-foreground size-4 shrink-0" />
                  <span>
                    {companySize ? t(`agency.companySize.${companySize}`) : "—"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("workspace.create.industryLabel")}:{" "}
                  </span>
                  {industry ? t(`workspace.industry.${industry}`) : "—"}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("workspace.settings.timezoneLabel")}:{" "}
                  </span>
                  {timezone}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide">
                  {t("workspace.settings.defaultPlatformsLabel")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {defaultPlatforms.length > 0
                    ? defaultPlatforms.map((p) => (
                        <span
                          key={p}
                          className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium capitalize"
                        >
                          {p}
                        </span>
                      ))
                    : "—"}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide">
                  {t("workspace.settings.reportFrequencyLabel")}
                </p>
                <span className="text-sm">
                  {reportFrequency
                    ? t(`workspace.reportFrequency.${reportFrequency}`)
                    : "—"}
                </span>
              </div>
            </>
          )}
        </div>

        {canManage && !isEditing && (
          <div className="flex max-w-sm gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateOpen(true)}
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

        {canDelete && !isEditing && (
          <div className="max-w-sm">
            <div className="bg-card rounded-xl border border-red-200 p-6 dark:border-red-900/50">
              <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <TriangleAlert className="size-4 text-rose-500" />
                {t("workspace.settings.danger.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-xs">
                {t("workspace.settings.danger.deleteHint")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
                onClick={() => setDeleteOpen(true)}
              >
                {t("workspace.settings.danger.deleteButton")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {templateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
            <h3 className="text-foreground text-sm font-semibold">
              {t("workspace.settings.template.dialogTitle")}
            </h3>
            <Input
              label={t("workspace.settings.template.nameLabel")}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t("workspace.settings.template.namePlaceholder")}
            />
            <IndustrySpecificFields
              industry={industry}
              value={templateIndustryFields}
              onChange={setTemplateIndustryFields}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTemplateOpen(false);
                  setTemplateName("");
                  setTemplateIndustryFields({});
                }}
              >
                {t("workspace.settings.danger.cancel")}
              </Button>
              <Button
                variant="orange"
                size="sm"
                loading={savingTemplate}
                disabled={!templateName.trim() || savingTemplate}
                onClick={handleSaveTemplate}
              >
                {t("workspace.settings.template.saveButton")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-rose-500" />
              <h3 className="text-foreground text-sm font-semibold">
                {t("workspace.settings.danger.confirmTitle")}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("workspace.settings.danger.confirmBody")}
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={name}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteOpen(false);
                  setConfirmName("");
                }}
              >
                {t("workspace.settings.danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                loading={deleting}
                disabled={confirmName !== name || deleting}
                onClick={handleDelete}
              >
                {t("workspace.settings.danger.confirmDelete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceSettingsPage;

import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceSettings } from "./hooks/useWorkspaceSettings";
import { LogoUploader } from "./components/LogoUploader";
import { PlatformToggle } from "./components/PlatformToggle";
import { FrequencyToggle } from "./components/FrequencyToggle";

export function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const {
    loading,
    saving,
    name,
    setName,
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
  } = useWorkspaceSettings();

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.settings.title")}
      description={t("workspace.settings.description")}
    >
      {canManage && (
        <LogoUploader
          name={name}
          logoUrl={logoUrl}
          uploading={uploadingLogo}
          fileInputRef={fileInputRef}
          onFileChange={handleLogoChange}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-xl border p-6"
      >
        <Input
          label={t("workspace.settings.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <PlatformToggle
          value={defaultPlatforms}
          onToggle={toggleWorkspacePlatform}
        />
        <FrequencyToggle
          value={reportFrequency}
          onToggle={toggleReportFrequency}
        />
        <Button
          variant="orange"
          type="submit"
          loading={saving}
          className="mt-1 font-semibold"
        >
          {t("workspace.settings.save")}
        </Button>
      </form>
    </PageWrapper>
  );
}

export default WorkspaceSettingsPage;

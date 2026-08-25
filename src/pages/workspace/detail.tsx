import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceSettings } from "./hooks/useWorkspaceSettings";
import { LogoUploader } from "./components/LogoUploader";
import { PlatformToggle } from "./components/PlatformToggle";
import { FrequencyToggle } from "./components/FrequencyToggle";
import { TimezoneSelect } from "./components/TimezoneSelect";

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
    canManage,
    uploadingLogo,
    fileInputRef,
    toggleWorkspacePlatform,
    toggleReportFrequency,
    handleLogoChange,
    handleSubmit,
  } = useWorkspaceSettings();
  const [deleteOpen, setDeleteOpen] = useState(false);

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
        <TimezoneSelect value={timezone} onChange={setTimezone} />
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

      {canManage && (
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
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(false)}
              >
                {t("workspace.settings.danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteOpen(false);
                  toast.success(t("workspace.settings.danger.deleteSuccess"));
                }}
              >
                {t("workspace.settings.danger.confirmDelete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default WorkspaceSettingsPage;

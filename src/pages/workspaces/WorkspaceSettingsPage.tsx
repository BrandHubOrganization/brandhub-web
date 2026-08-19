import * as React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";

export function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");
  const [timezone, setTimezone] = React.useState("");
  const [defaultPlatforms, setDefaultPlatforms] = React.useState("");
  const [reportFrequency, setReportFrequency] = React.useState("");

  React.useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getById(workspaceId)
      .then(({ data }) => {
        setName(data.data.name);
        setTimezone(data.data.settings.timezone ?? "");
        setDefaultPlatforms((data.data.settings.defaultPlatforms ?? []).join(", "));
        setReportFrequency(data.data.settings.reportFrequency ?? "");
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setSaving(true);
    try {
      await workspaceService.updateSettings(workspaceId, {
        name: name.trim(),
        timezone: timezone.trim() || undefined,
        defaultPlatforms: defaultPlatforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        reportFrequency: reportFrequency.trim() || undefined,
      });
      toast.success(t("workspace.settings.saveSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.settings.title")}
      description={t("workspace.settings.description")}
    >
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-lg border p-6"
      >
        <Input
          label={t("workspace.settings.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={t("workspace.settings.timezoneLabel")}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Asia/Ho_Chi_Minh"
        />
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("workspace.settings.defaultPlatformsLabel")}
          </Label>
          <Input
            value={defaultPlatforms}
            onChange={(e) => setDefaultPlatforms(e.target.value)}
            placeholder="facebook, instagram, tiktok"
          />
        </div>
        <Input
          label={t("workspace.settings.reportFrequencyLabel")}
          value={reportFrequency}
          onChange={(e) => setReportFrequency(e.target.value)}
          placeholder="weekly"
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

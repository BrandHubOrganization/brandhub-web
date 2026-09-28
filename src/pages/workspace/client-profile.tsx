import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Check } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { clientProfileService } from "@/services/clientProfileService";
import { workspaceService } from "@/services/workspaceService";
import { useClientProfileStore } from "@/store/clientProfileStore";
import { extractErrorMessage } from "@/utils/error";
import { Button } from "@/components/ui/button";
import type { ClientProfile } from "@/types/clientProfile";
import {
  ClientProfileForm,
  type ClientProfileFormValues,
} from "@/pages/client-profiles/components/ClientProfileForm";
import { ClientProfilePreview } from "@/pages/client-profiles/components/ClientProfilePreview";

// Hồ sơ thương hiệu GẮN VỚI workspace đang đứng (workspace_members.clientProfileId).
// currentClientProfile đã được Layout.tsx tự fetch sẵn khi memberRole === "CLIENT"
// (xem effect đọc activeWorkspace.clientProfileId).
// Trang này còn liệt kê các profile KHÁC user sở hữu (clientProfileService.listMine())
// để user đổi profile đại diện workspace này qua workspaceService.switchMyClientProfile.
export function WorkspaceClientProfilePage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const currentClientProfile = useClientProfileStore(
    (s) => s.currentClientProfile,
  );
  const setCurrentClientProfile = useClientProfileStore(
    (s) => s.setCurrentClientProfile,
  );
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [previewValues, setPreviewValues] =
    useState<ClientProfileFormValues | null>(null);
  const [myProfiles, setMyProfiles] = useState<ClientProfile[]>([]);

  useEffect(() => {
    clientProfileService
      .listMine()
      .then(({ data }) => setMyProfiles(data.data))
      .catch(() => setMyProfiles([]));
  }, []);

  const handleSubmit = async (
    data: Parameters<typeof clientProfileService.updateById>[1],
  ) => {
    if (!currentClientProfile) return;
    setSaving(true);
    try {
      const { data: res } = await clientProfileService.updateById(
        currentClientProfile.id,
        data,
      );
      setCurrentClientProfile(res.data);
      toast.success(t("clientProfile.saveSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("clientProfile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleSwitch = async (profile: ClientProfile) => {
    if (!workspaceId || profile.id === currentClientProfile?.id) return;
    setSwitching(profile.id);
    try {
      await workspaceService.switchMyClientProfile(workspaceId, profile.id);
      setCurrentClientProfile(profile);
      toast.success(t("clientProfile.workspace.switchSuccess"));
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("clientProfile.workspace.switchError")),
      );
    } finally {
      setSwitching(null);
    }
  };

  const otherProfiles = myProfiles.filter(
    (p) => p.id !== currentClientProfile?.id,
  );

  const switcher = otherProfiles.length > 0 && (
    <div className="border-border bg-card mb-6 rounded-xl border p-6">
      <h3 className="mb-1 text-sm font-semibold">
        {t("clientProfile.workspace.switchTitle")}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm">
        {t("clientProfile.workspace.switchDescription")}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {otherProfiles.map((p) => (
          <div
            key={p.id}
            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              {p.logoUrl ? (
                <img
                  src={p.logoUrl}
                  alt=""
                  className="size-9 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                  <Building2 className="text-muted-foreground size-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {p.displayName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {[p.tagline, p.industry, p.company]
                    .filter(Boolean)
                    .slice(0, 1)
                    .join(" · ") || t("clientProfile.workspace.noDetails")}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={switching === p.id}
              onClick={() => handleSwitch(p)}
            >
              {switching === p.id ? "…" : t("clientProfile.workspace.useThis")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  if (!currentClientProfile) {
    return (
      <PageWrapper
        title={t("nav.workspaceClientProfile")}
        description={t("clientProfile.workspace.description")}
      >
        {switcher}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <Building2 className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {t("clientProfile.workspace.empty")}
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={t("nav.workspaceClientProfile")}
      description={t("clientProfile.workspace.description")}
    >
      {switcher}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Check className="text-primary size-4" />
              {t("clientProfile.workspace.currentLabel")}
            </div>
            <ClientProfileForm
              key={currentClientProfile.id}
              initial={currentClientProfile}
              submitting={saving}
              submitLabel={t("clientProfile.save")}
              onSubmit={handleSubmit}
              onValuesChange={setPreviewValues}
            />
          </div>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 lg:sticky lg:top-6">
          <ClientProfilePreview values={previewValues} />
        </div>
      </div>
    </PageWrapper>
  );
}

export default WorkspaceClientProfilePage;

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CreateCustomPackageDialog } from "@/pages/media-package/components/CreateCustomPackageDialog";
import { MediaPackageCatalog } from "@/pages/media-package/components/MediaPackageCatalog";
import {
  MediaPackageErrorState,
  MediaPackageLoadingState,
} from "@/pages/media-package/components/MediaPackagePageState";
import { SelectedMediaPackage } from "@/pages/media-package/components/SelectedMediaPackage";
import { useWorkspaceMediaPackages } from "@/pages/media-package/hooks/useMediaPackages";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { mediaPackageService } from "@/pages/media-package/services/mediaPackageService";
import type { CreateCustomMediaPackageRequest } from "@/pages/media-package/types/mediaPackage";
import { extractErrorMessage } from "@/utils/error";
import { toast } from "sonner";

export default function WorkspaceMediaPackagePage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const {
    agencyPackages,
    selectedPackage,
    loading,
    error,
    selectingId,
    negotiating,
    approving,
    load,
    selectPackage,
    negotiateTerms,
    approvePackage,
  } = useWorkspaceMediaPackages(workspaceId);
  const selectedPackageId = selectedPackage?.mediaPackage.id ?? null;

  const currentMemberRole = useWorkspaceStore(
    (state) => state.currentMemberRole,
  );
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceList = useWorkspaceStore((state) => state.workspaceList);

  const effectiveRole =
    currentMemberRole ??
    (workspaceId
      ? workspaceList.find((w) => w.id === workspaceId)?.myRole
      : null) ??
    currentWorkspace?.myRole ??
    null;

  const canSelectPackages = effectiveRole === "CLIENT" || effectiveRole === null;
  const agencyId = workspaceId
    ? workspaceList.find((workspace) => workspace.id === workspaceId)?.agencyId
    : null;
  const canCreateCustom = effectiveRole === "MANAGER" && !!agencyId && !!workspaceId;

  const createCustomPackage = async (request: CreateCustomMediaPackageRequest) => {
    if (!agencyId || !workspaceId) return false;
    setCreatingCustom(true);
    try {
      await mediaPackageService.createCustom(agencyId, { ...request, workspaceId });
      await load();
      toast.success(t("mediaPackage.messages.customCreated"));
      return true;
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t("mediaPackage.errors.createCustom")));
      return false;
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <PageWrapper
      title={t("mediaPackage.workspacePage.title")}
      description={t("mediaPackage.workspacePage.description")}
    >
      {canCreateCustom && (
        <div className="mb-6 flex justify-end">
          <Button variant="orange" onClick={() => setCustomDialogOpen(true)}>
            <Plus className="size-4" />
            {t("mediaPackage.actions.createCustom")}
          </Button>
        </div>
      )}
      {loading && <MediaPackageLoadingState />}
      {!loading && error && (
        <MediaPackageErrorState message={error} onRetry={() => void load()} />
      )}
      {!loading && !error && (
        <div className="space-y-8">
          <SelectedMediaPackage
            selection={selectedPackage}
            workspaceId={workspaceId}
            onRefresh={() => void load()}
            onNegotiate={negotiateTerms}
            onApprove={approvePackage}
            negotiating={negotiating}
            approving={approving}
          />

          <MediaPackageCatalog
            title={t("mediaPackage.catalog.availableTitle")}
            description={t("mediaPackage.catalog.availableDescription")}
            packages={agencyPackages}
            selectedPackageId={selectedPackageId}
            canSelect={canSelectPackages}
            selectingId={selectingId}
            onSelect={(packageId) => void selectPackage(packageId)}
          />
        </div>
      )}
      {canCreateCustom && (
        <CreateCustomPackageDialog
          open={customDialogOpen}
          loading={creatingCustom}
          onOpenChange={setCustomDialogOpen}
          onSubmit={createCustomPackage}
        />
      )}
    </PageWrapper>
  );
}


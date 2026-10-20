import { useState } from "react";
import { ArrowLeft, ArrowLeftRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CreateCustomPackageForm } from "@/pages/media-package/components/CreateCustomPackageForm";
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
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editingTerms, setEditingTerms] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
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

  const canSelectPackages =
    effectiveRole === "CLIENT" || effectiveRole === null;
  const canChangePackage =
    canSelectPackages &&
    (!selectedPackage || selectedPackage.negotiationStatus === "DRAFT");
  const agencyId = workspaceId
    ? workspaceList.find((workspace) => workspace.id === workspaceId)?.agencyId
    : null;
  const canCreateCustom =
    effectiveRole === "MANAGER" && !!agencyId && !!workspaceId;

  const createCustomPackage = async (
    request: CreateCustomMediaPackageRequest,
  ) => {
    if (!agencyId || !workspaceId) return false;
    setCreatingCustom(true);
    try {
      await mediaPackageService.createCustom(agencyId, {
        ...request,
        workspaceId,
      });
      await load();
      toast.success(t("mediaPackage.messages.customCreated"));
      return true;
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t("mediaPackage.errors.createCustom")),
      );
      return false;
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <PageWrapper
      compact
      showGuideButton={false}
      title={t("mediaPackage.workspacePage.title")}
      actions={
        !createFormOpen &&
        !editingTerms && (
          <div className="flex flex-wrap gap-2">
            {selectedPackage && (
              <Button
                variant="outline"
                disabled={loading || !!selectingId}
                onClick={() => setShowCatalog((value) => !value)}
              >
                {showCatalog ? (
                  <ArrowLeft aria-hidden className="size-4" />
                ) : (
                  <ArrowLeftRight aria-hidden className="size-4" />
                )}
                {t(
                  showCatalog
                    ? "mediaPackage.compact.backSelected"
                    : canChangePackage
                      ? "mediaPackage.compact.changePackage"
                      : "mediaPackage.compact.browsePackages",
                )}
              </Button>
            )}
            {canCreateCustom && (
              <Button
                data-package-create
                variant="orange"
                onClick={() => setCreateFormOpen(true)}
              >
                <Plus aria-hidden className="size-4" />
                {t("mediaPackage.actions.createCustom")}
              </Button>
            )}
          </div>
        )
      }
    >
      {!createFormOpen && (
        <>
          {loading && <MediaPackageLoadingState />}
          {!loading && error && (
            <MediaPackageErrorState
              message={error}
              onRetry={() => void load()}
            />
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {(!showCatalog || !selectedPackage) && (
                <SelectedMediaPackage
                  key={selectedPackage?.workspaceMediaPackageId ?? "empty"}
                  selection={selectedPackage}
                  workspaceId={workspaceId}
                  onRefresh={() => void load()}
                  onNegotiate={negotiateTerms}
                  onApprove={approvePackage}
                  negotiating={negotiating}
                  approving={approving}
                  onEditingChange={setEditingTerms}
                />
              )}

              {(showCatalog || !selectedPackage) && (
                <div hidden={editingTerms}>
                  <MediaPackageCatalog
                    title={t("mediaPackage.catalog.availableTitle")}
                    description={t("mediaPackage.catalog.availableDescription")}
                    packages={agencyPackages}
                    selectedPackageId={selectedPackageId}
                    canSelect={canChangePackage}
                    selectingId={selectingId}
                    onSelect={(packageId) =>
                      void selectPackage(packageId).then((selected) => {
                        if (selected) setShowCatalog(false);
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
      {canCreateCustom && createFormOpen && (
        <CreateCustomPackageForm
          open={createFormOpen}
          loading={creatingCustom}
          onOpenChange={setCreateFormOpen}
          onSubmit={createCustomPackage}
        />
      )}
    </PageWrapper>
  );
}

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { MediaPackageCatalog } from "@/pages/media-package/components/MediaPackageCatalog";
import {
  MediaPackageErrorState,
  MediaPackageLoadingState,
} from "@/pages/media-package/components/MediaPackagePageState";
import { SelectedMediaPackage } from "@/pages/media-package/components/SelectedMediaPackage";
import { useWorkspaceMediaPackages } from "@/pages/media-package/hooks/useMediaPackages";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function WorkspaceMediaPackagePage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
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

  return (
    <PageWrapper
      title={t("mediaPackage.workspacePage.title")}
      description={t("mediaPackage.workspacePage.description")}
    >
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

          {agencyPackages.length > 0 && (
            <MediaPackageCatalog
              title={t("mediaPackage.catalog.availableTitle")}
              description={t("mediaPackage.catalog.availableDescription")}
              packages={agencyPackages}
              selectedPackageId={selectedPackageId}
              canSelect={canSelectPackages}
              selectingId={selectingId}
              onSelect={(packageId) => void selectPackage(packageId)}
            />
          )}
        </div>
      )}
    </PageWrapper>
  );
}


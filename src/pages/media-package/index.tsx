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

export default function WorkspaceMediaPackagePage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const {
    agencyPackages,
    selectedPackage,
    loading,
    error,
    selectingId,
    load,
    selectPackage,
  } = useWorkspaceMediaPackages(workspaceId);
  const selectedPackageId = selectedPackage?.mediaPackage.id ?? null;

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
          <SelectedMediaPackage selection={selectedPackage} />

          <MediaPackageCatalog
            title={t("mediaPackage.catalog.availableTitle")}
            description={t("mediaPackage.catalog.availableDescription")}
            packages={agencyPackages}
            selectedPackageId={selectedPackageId}
            canSelect
            selectingId={selectingId}
            onSelect={(packageId) => void selectPackage(packageId)}
          />
        </div>
      )}
    </PageWrapper>
  );
}

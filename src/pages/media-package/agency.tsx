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
import { useAgencyMediaPackages } from "@/pages/media-package/hooks/useMediaPackages";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

export default function AgencyMediaPackagePage() {
  const { t } = useTranslation();
  const { id: agencyId } = useParams<{ id: string }>();
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [sourceTemplate, setSourceTemplate] = useState<MediaPackage | null>(
    null,
  );
  const {
    templates,
    customPackages,
    loading,
    error,
    creatingCustom,
    updatingPackageId,
    load,
    createCustomPackage,
    updateAvailability,
  } = useAgencyMediaPackages(agencyId);

  const openCreateDialog = (template: MediaPackage | null = null) => {
    setSourceTemplate(template);
    setCustomDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCustomDialogOpen(open);
    if (!open) setSourceTemplate(null);
  };

  return (
    <PageWrapper
      title={t("mediaPackage.agencyPage.title")}
      description={t("mediaPackage.agencyPage.description")}
    >
      <div className="mb-6 flex justify-end">
        <Button variant="orange" onClick={() => openCreateDialog()}>
          <Plus className="size-4" />
          {t("mediaPackage.actions.createCustom")}
        </Button>
      </div>

      {loading && <MediaPackageLoadingState />}
      {!loading && error && (
        <MediaPackageErrorState message={error} onRetry={() => void load()} />
      )}
      {!loading && !error && (
        <div className="space-y-8">
          <MediaPackageCatalog
            title={t("mediaPackage.catalog.customTitle")}
            description={t("mediaPackage.catalog.agencyCustomDescription")}
            packages={customPackages}
            selectedPackageId={null}
            canSelect={false}
            selectingId={null}
            onSelect={() => undefined}
            onDuplicate={openCreateDialog}
            canManageAvailability
            updatingPackageId={updatingPackageId}
            onToggleAvailability={(mediaPackage) =>
              void updateAvailability(
                mediaPackage.id,
                !mediaPackage.availableToWorkspaces,
              )
            }
          />
          <MediaPackageCatalog
            title={t("mediaPackage.catalog.templatesTitle")}
            description={t(
              "mediaPackage.catalog.templatesManagementDescription",
            )}
            packages={templates}
            selectedPackageId={null}
            canSelect={false}
            selectingId={null}
            onSelect={() => undefined}
            canUseTemplate
            onUseTemplate={openCreateDialog}
          />
        </div>
      )}

      <CreateCustomPackageDialog
        key={sourceTemplate?.id ?? "blank-package"}
        open={customDialogOpen}
        sourceTemplate={sourceTemplate}
        loading={creatingCustom}
        onOpenChange={handleDialogOpenChange}
        onSubmit={createCustomPackage}
      />
    </PageWrapper>
  );
}

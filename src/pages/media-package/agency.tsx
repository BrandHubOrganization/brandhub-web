import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useAgencyMediaPackages } from "@/pages/media-package/hooks/useMediaPackages";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

export default function AgencyMediaPackagePage() {
  const { t } = useTranslation();
  const { id: agencyId } = useParams<{ id: string }>();
  const [createFormOpen, setCreateFormOpen] = useState(false);
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

  const openCreateForm = (template: MediaPackage | null = null) => {
    setSourceTemplate(template);
    setCreateFormOpen(true);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setCreateFormOpen(open);
    if (!open) setSourceTemplate(null);
  };

  return (
    <PageWrapper
      hideBanner
      title={t("mediaPackage.agencyPage.title")}
      description={t("mediaPackage.agencyPage.description")}
    >
      {!createFormOpen && (
        <>
          <div className="mb-6 flex justify-end">
            <Button
              data-package-create
              variant="orange"
              onClick={() => openCreateForm()}
            >
              <Plus className="size-4" />
              {t("mediaPackage.actions.createCustom")}
            </Button>
          </div>

          {loading && <MediaPackageLoadingState />}
          {!loading && error && (
            <MediaPackageErrorState
              message={error}
              onRetry={() => void load()}
            />
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
                onDuplicate={openCreateForm}
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
                onUseTemplate={openCreateForm}
              />
            </div>
          )}
        </>
      )}
      {createFormOpen && (
        <CreateCustomPackageForm
          key={sourceTemplate?.id ?? "blank-package"}
          open={createFormOpen}
          sourceTemplate={sourceTemplate}
          loading={creatingCustom}
          onOpenChange={handleCreateOpenChange}
          onSubmit={createCustomPackage}
        />
      )}
    </PageWrapper>
  );
}

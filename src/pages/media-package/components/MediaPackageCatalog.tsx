import { PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MediaPackageCard } from "@/pages/media-package/components/MediaPackageCard";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

interface MediaPackageCatalogProps {
  title: string;
  description: string;
  packages: MediaPackage[];
  selectedPackageId: string | null;
  canSelect: boolean;
  selectingId: string | null;
  onSelect: (packageId: string) => void;
  canUseTemplate?: boolean;
  canManageAvailability?: boolean;
  updatingPackageId?: string | null;
  onUseTemplate?: (mediaPackage: MediaPackage) => void;
  onToggleAvailability?: (mediaPackage: MediaPackage) => void;
}

export function MediaPackageCatalog({
  title,
  description,
  packages,
  selectedPackageId,
  canSelect,
  selectingId,
  onSelect,
  canUseTemplate,
  canManageAvailability,
  updatingPackageId,
  onUseTemplate,
  onToggleAvailability,
}: MediaPackageCatalogProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {packages.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-6 text-center">
          <PackageOpen className="text-muted-foreground mx-auto size-8" />
          <p className="text-muted-foreground mt-2 text-sm">
            {t("mediaPackage.catalog.empty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((mediaPackage) => (
            <MediaPackageCard
              key={mediaPackage.id}
              mediaPackage={mediaPackage}
              selected={selectedPackageId === mediaPackage.id}
              canSelect={canSelect}
              selecting={selectingId === mediaPackage.id}
              onSelect={onSelect}
              canUseTemplate={canUseTemplate}
              canManageAvailability={canManageAvailability}
              updatingAvailability={updatingPackageId === mediaPackage.id}
              onUseTemplate={onUseTemplate}
              onToggleAvailability={onToggleAvailability}
            />
          ))}
        </div>
      )}
    </section>
  );
}

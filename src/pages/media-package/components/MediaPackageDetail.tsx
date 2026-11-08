import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { InlineWorkArea } from "@/components/shared/InlineWorkArea";
import { PackageProposalView } from "@/pages/media-package/components/PackageProposalView";
import type { MediaPackage } from "../types/mediaPackage";

export function MediaPackageDetail({
  mediaPackage,
  onClose,
  actions,
}: {
  mediaPackage: MediaPackage;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <InlineWorkArea
      title={t("mediaPackage.proposal.viewTitle")}
      backLabel={t("mediaPackage.ui.backToPackages")}
      onBack={onClose}
      returnFocusTo={`[data-package-details="${CSS.escape(mediaPackage.id)}"]`}
    >
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
      <PackageProposalView mediaPackage={mediaPackage} />
    </InlineWorkArea>
  );
}

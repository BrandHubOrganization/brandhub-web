import { AlertTriangle, Cloud, HardDrive, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { MaterialItem } from "@/types/material";

export function MaterialBadges({ material }: { material: MaterialItem }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {material.draft && (
        <Badge
          variant="default"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1"
        >
          <Sparkles className="size-3" />
          {t("library.repository.aiDraftBadge")}
        </Badge>
      )}
      {material.storageProvider && (
        <Badge variant="outline" className="gap-1">
          {material.storageProvider === "USER_GDRIVE" ? (
            <>
              <Cloud className="size-3 text-blue-600" />
              {t("library.repository.storageDriveBadge")}
            </>
          ) : (
            <>
              <HardDrive className="size-3 text-emerald-600" />
              {t("library.repository.storageS3Badge")}
            </>
          )}
        </Badge>
      )}
      <Badge variant="secondary">
        {t(`library.repository.type${material.type}`)}
      </Badge>
      {material.rawWarning && (
        <Badge
          variant="outline"
          className="border-border text-foreground gap-1"
        >
          <AlertTriangle className="size-3" />
          {t("library.repository.rawWarningBadge")}
        </Badge>
      )}
      {material.purpose === "BRAND_REFERENCE" && (
        <Badge variant="secondary">
          {t("library.repository.purposeBrandReference")}
        </Badge>
      )}
      <Badge variant="outline">
        {t(
          material.visibility === "CLIENT"
            ? "library.repository.audienceClient"
            : "library.repository.audienceInternal",
        )}
      </Badge>
    </div>
  );
}

import {
  Cloud,
  Globe,
  HardDrive,
  Lock,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { MaterialItem } from "@/types/material";

export function MaterialBadges({
  material,
  compact = false,
}: {
  material: MaterialItem;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {material.draft && (
        <Badge
          variant="default"
          className="gap-1 rounded-lg border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 font-medium text-amber-700 dark:text-amber-300"
        >
          <Sparkles className="size-3" />
          {t("library.repository.aiDraftBadge")}
        </Badge>
      )}

      {!compact && material.storageProvider && (
        <Badge
          variant="outline"
          className="gap-1.5 rounded-lg border-border/80 bg-muted/30 px-2.5 py-0.5 font-medium text-foreground"
        >
          {material.storageProvider === "USER_GDRIVE" ? (
            <>
              <Cloud className="size-3 text-sky-600" />
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

      {!compact && (
        <Badge
          variant="secondary"
          className="rounded-lg px-2.5 py-0.5 font-medium"
        >
          {t(`library.repository.type${material.type}`)}
        </Badge>
      )}

      {material.purpose === "BRAND_REFERENCE" && (
        <Badge
          variant="secondary"
          className="rounded-lg px-2.5 py-0.5 font-medium"
        >
          {t("library.repository.purposeBrandReference")}
        </Badge>
      )}

      {!compact && (
        <Badge
          variant="outline"
          className="gap-1 rounded-lg border-border/80 bg-background px-2.5 py-0.5 font-medium text-muted-foreground"
        >
          {material.visibility === "CLIENT" ? (
            <Globe className="size-3 text-brand-orange" />
          ) : (
            <Lock className="size-3 text-muted-foreground" />
          )}
          {t(
            material.visibility === "CLIENT"
              ? "library.repository.audienceClient"
              : "library.repository.audienceInternal",
          )}
        </Badge>
      )}
    </div>
  );
}

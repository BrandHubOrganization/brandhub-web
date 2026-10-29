import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { MaterialItem } from "@/types/material";

export function MaterialBadges({ material }: { material: MaterialItem }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-1 text-xs">
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

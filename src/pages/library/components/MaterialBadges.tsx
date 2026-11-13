import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { MaterialItem } from "@/types/material";

export function MaterialBadges({
  material,
}: {
  material: MaterialItem;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  if (!material.draft) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <Badge
        variant="default"
        className="gap-1 rounded-lg border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 font-medium text-amber-700 dark:text-amber-300"
      >
        <Sparkles className="size-3" />
        {t("library.repository.aiDraftBadge")}
      </Badge>
    </div>
  );
}

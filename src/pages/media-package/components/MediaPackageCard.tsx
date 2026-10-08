import {
  Check,
  Clock3,
  Coins,
  Copy,
  Eye,
  EyeOff,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OfferingSummary } from "@/pages/media-package/components/OfferingSummary";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  formatPackageType,
  formatPackageValue,
} from "@/pages/media-package/lib/formatMediaPackage";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

interface MediaPackageCardProps {
  mediaPackage: MediaPackage;
  selected: boolean;
  canSelect: boolean;
  selecting: boolean;
  onSelect: (packageId: string) => void;
  canUseTemplate?: boolean;
  canManageAvailability?: boolean;
  updatingAvailability?: boolean;
  onUseTemplate?: (mediaPackage: MediaPackage) => void;
  onDuplicate?: (mediaPackage: MediaPackage) => void;
  onToggleAvailability?: (mediaPackage: MediaPackage) => void;
}

const TYPE_ICONS = {
  BY_DURATION: Clock3,
  BY_BUDGET: Coins,
  FULL_DELEGATION: PackageCheck,
} as const;

export function MediaPackageCard({
  mediaPackage,
  selected,
  canSelect,
  selecting,
  onSelect,
  canUseTemplate = false,
  canManageAvailability = false,
  updatingAvailability = false,
  onUseTemplate,
  onDuplicate,
  onToggleAvailability,
}: MediaPackageCardProps) {
  const { t, i18n } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const Icon = TYPE_ICONS[mediaPackage.type];

  return (
    <article className="border-border bg-card flex h-full flex-col rounded-xl border p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="outline">
            {mediaPackage.isTemplate
              ? t("mediaPackage.badges.template")
              : t("mediaPackage.badges.custom")}
          </Badge>
          {!mediaPackage.isTemplate && (
            <Badge
              variant={
                mediaPackage.availableToWorkspaces ? "APPROVED" : "secondary"
              }
            >
              {mediaPackage.availableToWorkspaces
                ? t("mediaPackage.badges.available")
                : t("mediaPackage.badges.hidden")}
            </Badge>
          )}
          {selected && (
            <Badge variant="APPROVED" className="gap-1">
              <Check className="size-3" />
              {t("mediaPackage.badges.selected")}
            </Badge>
          )}
        </div>
      </div>

      <Button variant="outline" className="mt-4 w-full" onClick={() => setDetailOpen(true)}>
        <Eye className="size-4" /> {i18n.language === "vi" ? "Xem chi tiết gói" : "View package details"}
      </Button>
      {onDuplicate && !mediaPackage.isTemplate && <Button variant="outline" className="mt-2 w-full"
        onClick={() => onDuplicate(mediaPackage)}><Copy className="size-4" />
        {i18n.language === "vi" ? "Tạo gói từ gói này" : "Create from this package"}</Button>}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{mediaPackage.name}</DialogTitle>
            <DialogDescription>{formatPackageType(mediaPackage.type, t)} · {formatPackageValue(mediaPackage, i18n.language, t)}</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm">{mediaPackage.scopeDescription || t("mediaPackage.catalog.noDescription")}</p>
          <OfferingSummary value={mediaPackage} />
          <p className="text-xs text-muted-foreground">{i18n.language === "vi" ? "Thời lượng" : "Duration"}: {mediaPackage.durationWeeks ?? "—"} {i18n.language === "vi" ? "tuần" : "weeks"}</p>
        </DialogContent>
      </Dialog>

      <div className="mt-4 flex-1">
        <p className="text-muted-foreground text-xs font-medium">
          {formatPackageType(mediaPackage.type, t)}
        </p>
        <h3 className="text-foreground mt-1 text-lg font-semibold">
          {mediaPackage.name}
        </h3>
        <p className="text-brand-orange mt-3 text-xl font-bold">
          {formatPackageValue(mediaPackage, i18n.language, t)}
        </p>
        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">
          {mediaPackage.scopeDescription ||
            t("mediaPackage.catalog.noDescription")}
        </p>
      </div>

      {canSelect && (
        <Button
          variant={selected ? "secondary" : "orange"}
          className="mt-5 w-full"
          loading={selecting}
          disabled={selected}
          onClick={() => onSelect(mediaPackage.id)}
        >
          {selected
            ? t("mediaPackage.actions.selected")
            : t("mediaPackage.actions.select")}
        </Button>
      )}
      {canUseTemplate && mediaPackage.isTemplate && (
        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() => onUseTemplate?.(mediaPackage)}
        >
          <Copy className="size-4" />
          {t("mediaPackage.actions.useTemplate")}
        </Button>
      )}
      {canManageAvailability && !mediaPackage.isTemplate && (
        <Button
          variant="outline"
          className="mt-5 w-full"
          loading={updatingAvailability}
          onClick={() => onToggleAvailability?.(mediaPackage)}
        >
          {mediaPackage.availableToWorkspaces ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          {mediaPackage.availableToWorkspaces
            ? t("mediaPackage.actions.hideFromWorkspaces")
            : t("mediaPackage.actions.showToWorkspaces")}
        </Button>
      )}
    </article>
  );
}

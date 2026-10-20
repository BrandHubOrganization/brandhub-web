import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPackageValue } from "../lib/formatMediaPackage";
import type { MediaPackage } from "../types/mediaPackage";

interface MediaPackageCardProps {
  mediaPackage: MediaPackage;
  selected: boolean;
  canSelect: boolean;
  selecting: boolean;
  onSelect: (packageId: string) => void;
  onViewDetails: (mediaPackage: MediaPackage) => void;
  canUseTemplate?: boolean;
  canManageAvailability?: boolean;
  updatingAvailability?: boolean;
  onUseTemplate?: (mediaPackage: MediaPackage) => void;
  onDuplicate?: (mediaPackage: MediaPackage) => void;
  onToggleAvailability?: (mediaPackage: MediaPackage) => void;
}

export function MediaPackageCard({
  mediaPackage,
  selected,
  canSelect,
  selecting,
  onSelect,
  onViewDetails,
  canUseTemplate = false,
  canManageAvailability = false,
  updatingAvailability = false,
  onUseTemplate,
  onDuplicate,
  onToggleAvailability,
}: MediaPackageCardProps) {
  const { t, i18n } = useTranslation();
  const deliverables = mediaPackage.offeringDetails?.deliverables ?? [];

  return (
    <article
      className={`bg-card flex h-full min-w-0 flex-col rounded-xl border p-5 ${selected ? "border-brand-orange ring-brand-orange ring-1" : "border-border"}`}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline">
          {t(
            mediaPackage.isTemplate
              ? "mediaPackage.badges.template"
              : "mediaPackage.badges.custom",
          )}
        </Badge>
        {!mediaPackage.isTemplate && (
          <Badge
            variant={
              mediaPackage.availableToWorkspaces ? "APPROVED" : "secondary"
            }
          >
            {t(
              mediaPackage.availableToWorkspaces
                ? "mediaPackage.badges.available"
                : "mediaPackage.badges.hidden",
            )}
          </Badge>
        )}
        {selected && (
          <Badge variant="APPROVED" className="gap-1">
            <Check className="size-3" aria-hidden="true" />
            {t("mediaPackage.badges.selected")}
          </Badge>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-foreground text-lg leading-snug font-semibold break-words">
          {mediaPackage.name}
        </h3>
        <p
          className={
            mediaPackage.budgetAmount == null
              ? "text-muted-foreground mt-3 text-sm font-medium"
              : "text-foreground mt-3 text-xl font-semibold tracking-tight"
          }
        >
          {formatPackageValue(mediaPackage, i18n.language, t)}
        </p>
        {mediaPackage.budgetAmount != null &&
          mediaPackage.durationWeeks != null && (
            <p className="text-muted-foreground mt-1 text-xs">
              {t("mediaPackage.values.duration", {
                count: mediaPackage.durationWeeks,
              })}
            </p>
          )}
        {mediaPackage.scopeDescription && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-6">
            {mediaPackage.scopeDescription}
          </p>
        )}
        {deliverables.length > 0 && (
          <ul className="border-border mt-4 space-y-2 border-t pt-4">
            {deliverables.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <Check
                  className="text-brand-orange mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words">
                  <span className="font-medium">
                    {item.quantity} {item.unit}
                  </span>{" "}
                  · {item.name}
                </span>
              </li>
            ))}
            {deliverables.length > 3 && (
              <li className="text-muted-foreground text-xs">
                {t("mediaPackage.ui.moreDeliverables", {
                  count: deliverables.length - 3,
                })}
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="border-border mt-5 space-y-2 border-t pt-4">
        {canSelect && (
          <Button
            variant={selected ? "secondary" : "orange"}
            className="w-full"
            loading={selecting}
            disabled={selected}
            onClick={() => onSelect(mediaPackage.id)}
          >
            {t(
              selected
                ? "mediaPackage.actions.selected"
                : "mediaPackage.actions.select",
            )}
          </Button>
        )}
        {canUseTemplate && mediaPackage.isTemplate && (
          <Button
            variant="orange"
            className="h-auto min-h-10 w-full whitespace-normal"
            onClick={() => onUseTemplate?.(mediaPackage)}
            data-package-create-from={mediaPackage.id}
          >
            <Copy className="size-4 shrink-0" aria-hidden="true" />
            {t("mediaPackage.actions.useTemplate")}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          data-package-details={mediaPackage.id}
          onClick={() => onViewDetails(mediaPackage)}
        >
          <Eye className="size-4" aria-hidden="true" />
          {t("mediaPackage.ui.viewDetail")}
        </Button>
        {onDuplicate && !mediaPackage.isTemplate && (
          <Button
            variant="ghost"
            className="h-auto min-h-10 w-full whitespace-normal"
            onClick={() => onDuplicate(mediaPackage)}
            data-package-create-from={mediaPackage.id}
          >
            <Copy className="size-4 shrink-0" aria-hidden="true" />
            {t("mediaPackage.ui.duplicate")}
          </Button>
        )}
        {canManageAvailability && !mediaPackage.isTemplate && (
          <Button
            variant="ghost"
            className="text-muted-foreground h-auto min-h-10 w-full whitespace-normal"
            loading={updatingAvailability}
            onClick={() => onToggleAvailability?.(mediaPackage)}
          >
            {mediaPackage.availableToWorkspaces ? (
              <EyeOff className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Eye className="size-4 shrink-0" aria-hidden="true" />
            )}
            {t(
              mediaPackage.availableToWorkspaces
                ? "mediaPackage.actions.hideFromWorkspaces"
                : "mediaPackage.actions.showToWorkspaces",
            )}
          </Button>
        )}
      </div>
    </article>
  );
}

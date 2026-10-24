import { Check, Copy, Eye, EyeOff, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const isSelectPrimary = canSelect;
  const isTemplatePrimary = !canSelect && Boolean(canUseTemplate && mediaPackage.isTemplate);

  const hasSecondaryActions =
    isSelectPrimary ||
    isTemplatePrimary ||
    Boolean(onDuplicate && !mediaPackage.isTemplate) ||
    Boolean(canManageAvailability && !mediaPackage.isTemplate);

  return (
    <article
      className={`bg-card flex h-full min-w-0 flex-col rounded-xl border p-5 transition-all duration-200 hover:shadow-sm ${
        selected
          ? "border-brand-orange ring-1 ring-brand-orange shadow-xs"
          : "border-border/80"
      }`}
    >
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs font-normal">
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
            className="text-xs"
          >
            {t(
              mediaPackage.availableToWorkspaces
                ? "mediaPackage.badges.available"
                : "mediaPackage.badges.hidden",
            )}
          </Badge>
        )}
        {selected && (
          <Badge variant="APPROVED" className="gap-1 text-xs">
            <Check className="size-3" aria-hidden="true" />
            {t("mediaPackage.badges.selected")}
          </Badge>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-foreground text-base font-semibold leading-snug break-words">
          {mediaPackage.name}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span
            className={
              mediaPackage.budgetAmount == null
                ? "text-muted-foreground text-sm font-medium"
                : "text-foreground text-xl font-bold tracking-tight"
            }
          >
            {formatPackageValue(mediaPackage, i18n.language, t)}
          </span>
          {mediaPackage.budgetAmount != null &&
            mediaPackage.durationWeeks != null && (
              <span className="text-muted-foreground text-xs font-normal">
                /{" "}
                {t("mediaPackage.values.duration", {
                  count: mediaPackage.durationWeeks,
                })}
              </span>
            )}
        </div>

        {mediaPackage.scopeDescription && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
            {mediaPackage.scopeDescription}
          </p>
        )}

        {deliverables.length > 0 && (
          <ul className="border-border/60 mt-4 space-y-2 border-t pt-3.5">
            {deliverables.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="bg-brand-orange/10 text-brand-orange flex size-4 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-2.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 truncate text-foreground">
                  <span className="font-semibold text-foreground">
                    {item.quantity} {item.unit}
                  </span>{" "}
                  · {item.name}
                </span>
              </li>
            ))}
            {deliverables.length > 3 && (
              <li className="text-muted-foreground pt-0.5 text-xs">
                {t("mediaPackage.ui.moreDeliverables", {
                  count: deliverables.length - 3,
                })}
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="border-border/60 mt-5 flex items-center gap-2 border-t pt-4">
        {isSelectPrimary ? (
          <Button
            variant={selected ? "secondary" : "orange"}
            className="flex-1 font-medium"
            loading={selecting}
            disabled={selected}
            onClick={() => onSelect(mediaPackage.id)}
          >
            {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
            {t(
              selected
                ? "mediaPackage.actions.selected"
                : "mediaPackage.actions.select",
            )}
          </Button>
        ) : isTemplatePrimary ? (
          <Button
            variant="orange"
            className="flex-1 font-medium"
            onClick={() => onUseTemplate?.(mediaPackage)}
            data-package-create-from={mediaPackage.id}
          >
            <Copy className="size-4 shrink-0" aria-hidden="true" />
            {t("mediaPackage.actions.useTemplate")}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 font-medium"
            data-package-details={mediaPackage.id}
            onClick={() => onViewDetails(mediaPackage)}
          >
            <Eye className="size-4 shrink-0" aria-hidden="true" />
            {t("mediaPackage.ui.viewDetail")}
          </Button>
        )}

        {hasSecondaryActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={t("mediaPackage.ui.actions", {
                  defaultValue: "Thao tác khác",
                })}
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(isSelectPrimary || isTemplatePrimary) && (
                <DropdownMenuItem
                  data-package-details={mediaPackage.id}
                  onClick={() => onViewDetails(mediaPackage)}
                  className="cursor-pointer gap-2"
                >
                  <Eye className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("mediaPackage.ui.viewDetail")}</span>
                </DropdownMenuItem>
              )}
              {isSelectPrimary &&
                canUseTemplate &&
                mediaPackage.isTemplate && (
                  <DropdownMenuItem
                    data-package-create-from={mediaPackage.id}
                    onClick={() => onUseTemplate?.(mediaPackage)}
                    className="cursor-pointer gap-2"
                  >
                    <Copy className="size-4 shrink-0" aria-hidden="true" />
                    <span>{t("mediaPackage.actions.useTemplate")}</span>
                  </DropdownMenuItem>
                )}
              {onDuplicate && !mediaPackage.isTemplate && (
                <DropdownMenuItem
                  data-package-create-from={mediaPackage.id}
                  onClick={() => onDuplicate(mediaPackage)}
                  className="cursor-pointer gap-2"
                >
                  <Copy className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("mediaPackage.ui.duplicate")}</span>
                </DropdownMenuItem>
              )}
              {canManageAvailability && !mediaPackage.isTemplate && (
                <DropdownMenuItem
                  disabled={updatingAvailability}
                  onClick={() => onToggleAvailability?.(mediaPackage)}
                  className="cursor-pointer gap-2"
                >
                  {mediaPackage.availableToWorkspaces ? (
                    <EyeOff className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {t(
                      mediaPackage.availableToWorkspaces
                        ? "mediaPackage.actions.hideFromWorkspaces"
                        : "mediaPackage.actions.showToWorkspaces",
                    )}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </article>
  );
}

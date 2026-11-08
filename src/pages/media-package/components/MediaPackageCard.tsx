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
  compact?: boolean;
  viewed?: boolean;
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
  compact = false,
  viewed,
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
  const isTemplatePrimary =
    !canSelect && Boolean(canUseTemplate && mediaPackage.isTemplate);

  const hasSecondaryActions =
    isSelectPrimary ||
    isTemplatePrimary ||
    Boolean(onDuplicate && !mediaPackage.isTemplate) ||
    Boolean(canManageAvailability && !mediaPackage.isTemplate);

  return (
    <article
      className={`relative flex min-w-0 flex-col rounded-xl border transition-[background-color,border-color,box-shadow] duration-160 hover:shadow-sm motion-reduce:transition-none ${compact ? "border-l-4 p-4 pl-3" : "h-full p-5"} ${compact && (viewed === true || (selected && viewed !== false)) ? "bg-brand-orange-soft" : "bg-card"} ${
        viewed === true || (selected && viewed !== false)
          ? compact
            ? "border-brand-orange border-l-4 pl-3"
            : "border-brand-orange ring-brand-orange shadow-xs ring-1"
          : compact
            ? "border-border/80 border-l-transparent"
            : "border-border/80"
      }`}
    >
      <button
        type="button"
        className="focus-visible:ring-ring absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-pressed={viewed}
        data-package-details={mediaPackage.id}
        aria-label={t("mediaPackage.ui.openPackage", {
          name: mediaPackage.name,
        })}
        onClick={() => onViewDetails(mediaPackage)}
      />
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        {!compact && (
          <Badge variant="outline" className="text-xs font-normal">
            {t(
              mediaPackage.isTemplate
                ? "mediaPackage.badges.template"
                : "mediaPackage.badges.custom",
            )}
          </Badge>
        )}
        {!compact && !mediaPackage.isTemplate && (
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
            {t(
              compact
                ? "mediaPackage.actions.selected"
                : "mediaPackage.badges.selected",
            )}
          </Badge>
        )}
        {viewed && (
          <Badge
            variant="outline"
            className="border-brand-orange/30 bg-brand-orange-soft text-brand-orange text-xs"
          >
            {t("mediaPackage.workspace.viewing")}
          </Badge>
        )}
      </div>

      <div className="flex-1">
        <h3
          className={`text-foreground leading-snug font-semibold break-words ${compact ? "text-sm" : "text-base"}`}
        >
          {mediaPackage.name}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span
            className={
              mediaPackage.budgetAmount == null
                ? "text-muted-foreground text-sm font-medium"
                : compact
                  ? "text-foreground text-base font-semibold tracking-tight"
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

        {!compact && mediaPackage.scopeDescription && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
            {mediaPackage.scopeDescription}
          </p>
        )}

        {!compact && deliverables.length > 0 && (
          <ul className="border-border/60 mt-4 space-y-2 border-t pt-3.5">
            {deliverables.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="text-muted-foreground flex items-center gap-2 text-xs"
              >
                <span className="bg-brand-orange/10 text-brand-orange flex size-4 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-2.5" aria-hidden="true" />
                </span>
                <span className="text-foreground min-w-0 truncate">
                  <span className="text-foreground font-semibold">
                    {item.quantity}{" "}
                    {item.serviceType === "PRESS_RECOMMENDATION"
                      ? t("mediaPackage.offering.pressArticleUnit", {
                          count: item.quantity,
                        })
                      : item.unit}
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

      {!compact && (
        <div className="border-border/60 relative z-10 mt-5 flex items-center gap-2 border-t pt-4">
          {isSelectPrimary ? (
            <Button
              variant={selected ? "secondary" : "orange"}
              className="flex-1 font-medium"
              loading={selecting}
              disabled={selected}
              onClick={() => onSelect(mediaPackage.id)}
            >
              {selected && (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              )}
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
                  className="text-muted-foreground hover:text-foreground size-9 shrink-0"
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
      )}
    </article>
  );
}

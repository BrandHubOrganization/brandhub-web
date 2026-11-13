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
import { stripRichTextHtml } from "@/components/ui/rich-text-input";
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

  const isHighlighted = viewed === true || (selected && viewed !== false);

  return (
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer motion-reduce:transition-none ${compact ? "border-l-4 p-4 pl-3" : "h-full p-5"} ${compact && isHighlighted ? "bg-brand-orange-soft" : "bg-card"} ${
        isHighlighted
          ? compact
            ? "border-brand-orange border-l-4 pl-3"
            : "border-brand-orange/80 ring-brand-orange/30 shadow-brand-orange/10 shadow-md ring-2"
          : compact
            ? "border-border/80 border-l-transparent hover:shadow-xs"
            : "border-border/80 hover:border-brand-orange/40 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      {!compact && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-1 transition-opacity duration-200 ${
            isHighlighted
              ? "from-brand-orange via-amber-400 to-brand-orange/60 bg-gradient-to-r opacity-100"
              : "from-brand-orange/60 via-amber-400/50 to-transparent bg-gradient-to-r opacity-0 group-hover:opacity-100"
          }`}
        />
      )}
      <button
        type="button"
        className="focus-visible:ring-ring absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-pressed={viewed}
        data-package-details={mediaPackage.id}
        aria-label={t("mediaPackage.ui.openPackage", {
          name: mediaPackage.name,
        })}
        onClick={() => onViewDetails(mediaPackage)}
      />
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {!compact && (
          <Badge
            variant="outline"
            className="border-border/80 bg-muted/40 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
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
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
            {t(
              mediaPackage.availableToWorkspaces
                ? "mediaPackage.badges.available"
                : "mediaPackage.badges.hidden",
            )}
          </Badge>
        )}
        {selected && (
          <Badge
            variant="APPROVED"
            className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
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
            className="border-brand-orange/30 bg-brand-orange-soft text-brand-orange rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
            {t("mediaPackage.workspace.viewing")}
          </Badge>
        )}
      </div>

      <div className="flex-1">
        <h3
          className={`text-foreground leading-snug font-bold tracking-tight break-words ${compact ? "text-sm" : "text-[17px]"}`}
        >
          {mediaPackage.name}
        </h3>

        <div
          className={
            compact
              ? "mt-2 flex items-baseline gap-2"
              : `mt-3 flex flex-wrap items-baseline justify-between gap-2 rounded-xl border px-3.5 py-2.5 ${
                  isHighlighted
                    ? "border-brand-orange/20 from-brand-orange/[0.08] bg-gradient-to-r to-amber-500/[0.04]"
                    : "border-border/60 bg-muted/35"
                }`
          }
        >
          <span
            className={
              mediaPackage.budgetAmount == null
                ? "text-muted-foreground text-sm font-medium"
                : compact
                  ? "text-foreground text-base font-semibold tracking-tight tabular-nums"
                  : "text-foreground text-xl font-extrabold tracking-tight tabular-nums"
            }
          >
            {formatPackageValue(mediaPackage, i18n.language, t)}
          </span>
          {mediaPackage.budgetAmount != null &&
            mediaPackage.durationWeeks != null && (
              <span className="text-muted-foreground text-xs font-medium">
                /{" "}
                {t("mediaPackage.values.duration", {
                  count: mediaPackage.durationWeeks,
                })}
              </span>
            )}
        </div>

        {!compact && mediaPackage.scopeDescription && (
          <p className="text-muted-foreground mt-3 line-clamp-2 text-xs leading-relaxed">
            {stripRichTextHtml(mediaPackage.scopeDescription)}
          </p>
        )}

        {!compact && deliverables.length > 0 && (
          <ul className="border-border/60 mt-3.5 space-y-2 border-t pt-3.5">
            {deliverables.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="text-muted-foreground flex items-center gap-2.5 text-xs"
              >
                <span className="bg-brand-orange/12 text-brand-orange flex size-4.5 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-2.5 stroke-[2.5]" aria-hidden="true" />
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
                  <span className="text-muted-foreground">· {item.name}</span>
                </span>
              </li>
            ))}
            {deliverables.length > 3 && (
              <li className="pt-1">
                <span className="bg-muted/70 text-muted-foreground inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium">
                  {t("mediaPackage.ui.moreDeliverables", {
                    count: deliverables.length - 3,
                  })}
                </span>
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
              className="flex-1 rounded-xl font-semibold"
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
              className="flex-1 rounded-xl font-semibold"
              onClick={() => onUseTemplate?.(mediaPackage)}
              data-package-create-from={mediaPackage.id}
            >
              <Copy className="size-4 shrink-0" aria-hidden="true" />
              {t("mediaPackage.actions.useTemplate")}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="hover:border-brand-orange/50 hover:bg-brand-orange-soft/50 flex-1 rounded-xl font-semibold"
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
                  className="text-muted-foreground hover:text-foreground size-9 shrink-0 rounded-xl"
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

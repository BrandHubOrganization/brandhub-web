import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import type { MaterialFilters, MaterialStorageUsage } from "@/types/material";

interface Props {
  workspace: string;
  role: string | null;
  search: string;
  filters: MaterialFilters;
  usage?: MaterialStorageUsage;
  onSearch: (search: string) => void;
  onChange: (filters: MaterialFilters) => void;
}

export function MaterialToolbar({
  workspace,
  role,
  search,
  filters,
  usage,
  onSearch,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const staff = role === "OWNER" || role === "MANAGER" || role === "CREATOR";
  const profiles = useMaterialUploadProfiles(workspace, false, staff);
  const label = (key: string) => t(`library.repository.${key}`);
  const advancedCount = [
    filters.type,
    filters.purpose,
    filters.clientProfileId,
  ].filter(Boolean).length;
  return (
    <div className="border-border bg-card space-y-2.5 rounded-xl border p-2.5 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1">
          <Input
            iconPrefix={<Search className="size-3.5" />}
            aria-label={label("searchPlaceholder")}
            placeholder={label("searchPlaceholder")}
            value={search}
            maxLength={100}
            className="bg-muted/40 h-8 rounded-lg pr-8 text-xs"
            onChange={(event) => onSearch(event.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 size-8"
              aria-label={label("clearSearch")}
              onClick={() => onSearch("")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Media Type Pills */}
        <div
          className="bg-muted/50 flex flex-wrap items-center gap-0.5 rounded-lg p-0.5"
          role="group"
          aria-label={label("mediaKind")}
        >
          {([undefined, "IMAGE", "VIDEO", "FILE"] as const).map((kind) => (
            <Button
              key={kind ?? "all"}
              variant={filters.mediaKind === kind ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 rounded-md px-2.5 text-xs ${
                filters.mediaKind === kind
                  ? "bg-background text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={filters.mediaKind === kind}
              onClick={() => onChange({ ...filters, mediaKind: kind })}
            >
              {label(
                kind === "IMAGE"
                  ? "filterImage"
                  : kind === "VIDEO"
                    ? "filterVideo"
                    : kind === "FILE"
                      ? "filterFile"
                      : "filterAll",
              )}
            </Button>
          ))}
        </div>

        {/* Sort Select */}
        <Select
          wrapperClassName="w-auto"
          className="h-8 min-w-32 rounded-lg text-xs"
          aria-label={label("sortLabel")}
          value={filters.sort ?? "newest"}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as MaterialFilters["sort"],
            })
          }
        >
          <option value="newest">{t("library.media.sortNewest")}</option>
          <option value="oldest">{t("library.media.sortOldest")}</option>
          <option value="name_asc">
            {t("materials.repository.sortNameAsc")}
          </option>
          <option value="name_desc">
            {t("materials.repository.sortNameDesc")}
          </option>
        </Select>
      </div>

      {/* Expandable Advanced Filters */}
      <details className="group">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium focus-visible:ring-2">
          <SlidersHorizontal className="size-3.5" />
          {t("library.simple.filters")}
          {advancedCount > 0 && (
            <span className="bg-brand-orange/15 text-brand-orange py-0.2 rounded-full px-1.5 text-[10px] font-bold">
              {advancedCount}
            </span>
          )}
        </summary>
        <div className="border-border mt-2 grid grid-cols-1 gap-2.5 border-t pt-2.5 sm:grid-cols-3">
          <Select
            className="h-8 text-xs"
            aria-label={label("processingTypeLabel")}
            value={filters.type ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                type:
                  (event.target.value as MaterialFilters["type"]) || undefined,
              })
            }
          >
            <option value="">{label("typeAll")}</option>
            {["RAW", "RETOUCHED", "WATERMARKED"].map((type) => (
              <option key={type} value={type}>
                {label(`type${type}`)}
              </option>
            ))}
          </Select>
          <Select
            className="h-8 text-xs"
            aria-label={label("purposeLabel")}
            value={filters.purpose ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                purpose:
                  (event.target.value as MaterialFilters["purpose"]) ||
                  undefined,
              })
            }
          >
            <option value="">{label("purposeAll")}</option>
            <option value="MATERIAL">{label("purposeMaterial")}</option>
            <option value="BRAND_REFERENCE">
              {label("purposeBrandReference")}
            </option>
          </Select>
          {staff && (
            <Select
              className="h-8 text-xs"
              aria-label={label("clientLabel")}
              value={filters.clientProfileId ?? ""}
              disabled={profiles.isPending || profiles.isError}
              onChange={(event) =>
                onChange({
                  ...filters,
                  clientProfileId: event.target.value || undefined,
                })
              }
            >
              <option value="">{label("clientAll")}</option>
              {profiles.data?.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {advancedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                onChange({ mediaKind: filters.mediaKind, sort: filters.sort })
              }
            >
              <X className="size-3.5" />
              {label("resetFilters")}
            </Button>
          )}
        </div>
      </details>

      {staff && profiles.isError && (
        <p className="text-muted-foreground text-xs">
          {label("profilesUnavailable")}
        </p>
      )}
      {staff && usage?.isQuotaExceeded && (
        <p
          role="status"
          className="bg-muted text-foreground rounded-md p-2.5 text-xs"
        >
          {label("quotaReadOnlyNotice")}
        </p>
      )}
    </div>
  );
}

import { PackageOpen, Search } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/shared/HelpHint";
import { MediaPackageCard } from "./MediaPackageCard";
import { MediaPackageDetail } from "@/pages/media-package/components/MediaPackageDetail";
import type { MediaPackage } from "../types/mediaPackage";

interface MediaPackageCatalogProps {
  title: string;
  description: string;
  packages: MediaPackage[];
  selectedPackageId: string | null;
  canSelect: boolean;
  selectingId: string | null;
  onSelect: (packageId: string) => void;
  canUseTemplate?: boolean;
  canManageAvailability?: boolean;
  updatingPackageId?: string | null;
  onUseTemplate?: (mediaPackage: MediaPackage) => void;
  onDuplicate?: (mediaPackage: MediaPackage) => void;
  onToggleAvailability?: (mediaPackage: MediaPackage) => void;
}

export function MediaPackageCatalog(props: MediaPackageCatalogProps) {
  const { title, description, packages, canManageAvailability } = props;
  const { t } = useTranslation();
  const id = useId();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = packages.find((item) => item.id === detailId);
  const filtered = packages.filter(
    (item) =>
      `${item.name} ${item.scopeDescription ?? ""}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()) &&
      (availability === "all" ||
        item.availableToWorkspaces === (availability === "available")),
  );
  if (detail)
    return (
      <MediaPackageDetail
        mediaPackage={detail}
        onClose={() => setDetailId(null)}
        actions={
          <>
            {props.canSelect && (
              <Button
                variant="orange"
                loading={props.selectingId === detail.id}
                disabled={props.selectedPackageId === detail.id}
                onClick={() => props.onSelect(detail.id)}
              >
                {t(
                  props.selectedPackageId === detail.id
                    ? "mediaPackage.actions.selected"
                    : "mediaPackage.actions.select",
                )}
              </Button>
            )}
            {props.canUseTemplate && detail.isTemplate && (
              <Button
                variant="orange"
                onClick={() => props.onUseTemplate?.(detail)}
              >
                {t("mediaPackage.actions.useTemplate")}
              </Button>
            )}
            {props.onDuplicate && !detail.isTemplate && (
              <Button
                variant="outline"
                onClick={() => props.onDuplicate?.(detail)}
              >
                {t("mediaPackage.ui.duplicate")}
              </Button>
            )}
          </>
        }
      />
    );
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-center gap-1">
        <h2 id={id} className="text-foreground text-lg font-semibold">
          {title}
        </h2>
        <HelpHint label={title}>{description}</HelpHint>
      </div>
      {packages.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            wrapperClassName="min-w-0 flex-1 sm:max-w-md"
            aria-label={t("mediaPackage.ui.search")}
            placeholder={t("mediaPackage.ui.search")}
            iconPrefix={<Search className="size-4" aria-hidden="true" />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(12);
            }}
          />
          {canManageAvailability && (
            <Select
              wrapperClassName="min-w-0 sm:w-64 sm:shrink-0"
              aria-label={t("mediaPackage.ui.availability")}
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setVisibleCount(12);
              }}
            >
              <option value="all">{t("mediaPackage.ui.allPackages")}</option>
              <option value="available">
                {t("mediaPackage.ui.availableOption")}
              </option>
              <option value="hidden">
                {t("mediaPackage.ui.hiddenOption")}
              </option>
            </Select>
          )}
          <p
            role="status"
            className="text-muted-foreground shrink-0 text-xs sm:text-sm whitespace-nowrap sm:ml-auto"
          >
            {t("mediaPackage.ui.resultCount", { count: filtered.length })}
          </p>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed px-6 py-10 text-center">
          <PackageOpen
            className="text-muted-foreground mx-auto size-8"
            aria-hidden="true"
          />
          <p className="text-muted-foreground mt-3 text-sm">
            {t(
              packages.length
                ? "mediaPackage.ui.noResults"
                : "mediaPackage.catalog.empty",
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, visibleCount).map((mediaPackage) => (
            <MediaPackageCard
              key={mediaPackage.id}
              mediaPackage={mediaPackage}
              selected={props.selectedPackageId === mediaPackage.id}
              canSelect={props.canSelect}
              selecting={props.selectingId === mediaPackage.id}
              onSelect={props.onSelect}
              onViewDetails={(item) => setDetailId(item.id)}
              canUseTemplate={props.canUseTemplate}
              canManageAvailability={canManageAvailability}
              updatingAvailability={props.updatingPackageId === mediaPackage.id}
              onUseTemplate={props.onUseTemplate}
              onDuplicate={props.onDuplicate}
              onToggleAvailability={props.onToggleAvailability}
            />
          ))}
        </div>
      )}
      {filtered.length > visibleCount && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((count) => count + 12)}
          >
            {t("mediaPackage.ui.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}

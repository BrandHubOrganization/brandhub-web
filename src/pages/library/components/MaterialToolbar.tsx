import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import type { MaterialFilters, MaterialStorageUsage } from "@/types/material";
import { formatFileSize } from "@/lib/utils";

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
  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-3">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
        <Input
          aria-label={label("searchPlaceholder")}
          placeholder={label("searchPlaceholder")}
          value={search}
          maxLength={100}
          className="pr-10 pl-9"
          onChange={(event) => onSearch(event.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0"
            aria-label={label("clearSearch")}
            onClick={() => onSearch("")}
          >
            <X />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Select
          aria-label={label("mediaKind")}
          value={filters.mediaKind ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              mediaKind:
                (event.target.value as MaterialFilters["mediaKind"]) ||
                undefined,
            })
          }
        >
          <option value="">{label("filterAll")}</option>
          <option value="IMAGE">{label("filterImage")}</option>
          <option value="VIDEO">{label("filterVideo")}</option>
          <option value="FILE">{label("filterFile")}</option>
        </Select>
        <Select
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
          aria-label={label("purposeLabel")}
          value={filters.purpose ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              purpose:
                (event.target.value as MaterialFilters["purpose"]) || undefined,
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
        <Select
          aria-label={label("sortLabel")}
          value={filters.sort ?? "newest"}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as "newest" | "oldest",
            })
          }
        >
          <option value="newest">{t("library.media.sortNewest")}</option>
          <option value="oldest">{t("library.media.sortOldest")}</option>
        </Select>
      </div>
      {staff && profiles.isError && (
        <p className="text-muted-foreground text-sm">
          {label("profilesUnavailable")}
        </p>
      )}
      {staff && usage?.agencyUsedBytes != null && (
        <p className="text-muted-foreground text-xs">
          {usage.storageMode === "CUSTOMER_DRIVE_FIRST"
            ? t("library.drive.s3Usage")
            : label("storageUsage")}
          : {formatFileSize(Number(usage.agencyUsedBytes))} /{" "}
          {formatFileSize(Number(usage.agencyQuotaBytes))}
        </p>
      )}
      {staff && usage?.isQuotaExceeded && (
        <p
          role="status"
          className="bg-muted text-foreground rounded-md p-3 text-sm"
        >
          {label("quotaReadOnlyNotice")}
        </p>
      )}
    </div>
  );
}

import { PackageShareActions } from "@/pages/media-package/components/PackageShareActions";
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpDown,
  ArrowUpZA,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Film,
  Layers,
  LayoutGrid,
  Mail,
  Megaphone,
  Newspaper,
  PackageOpen,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { Pagination } from "@/components/ui/pagination";
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
  onEdit?: (mediaPackage: MediaPackage) => void;
  shareAgencyId?: string;
  onToggleAvailability?: (mediaPackage: MediaPackage) => void;
}

/** Check if a package matches a selected category filter. */
function matchesCategory(pkg: MediaPackage, cat: string): boolean {
  if (!cat || cat === "all") return true;
  if (pkg.offeringModel === cat) return true;

  const deliverables = pkg.offeringDetails?.deliverables ?? [];
  const text = `${pkg.name} ${pkg.scopeDescription ?? ""}`.toLowerCase();

  switch (cat) {
    case "SOCIAL_POST":
      return (
        deliverables.some((d) => d.serviceType === "SOCIAL_POST") ||
        text.includes("mạng xã hội") ||
        text.includes("social") ||
        text.includes("bài đăng") ||
        text.includes("thương hiệu") ||
        text.includes("ra mắt")
      );
    case "EVENT":
      return (
        deliverables.some(
          (d) =>
            d.serviceType === "EVENT_PLANNING" ||
            d.serviceType === "WORKSHOP_SUPPORT" ||
            d.serviceType === "LIVESTREAM_PREPARATION",
        ) ||
        text.includes("sự kiện") ||
        text.includes("hội thảo") ||
        text.includes("workshop") ||
        text.includes("livestream")
      );
    case "PRESS":
      return (
        deliverables.some((d) => d.serviceType === "PRESS_RECOMMENDATION") ||
        text.includes("báo điện tử") ||
        text.includes("báo chí") ||
        text.includes("pr")
      );
    case "VIDEO":
      return (
        deliverables.some((d) => d.serviceType === "SHORT_VIDEO") ||
        text.includes("video") ||
        text.includes("reels") ||
        text.includes("tiktok")
      );
    case "KOL":
      return (
        deliverables.some((d) => d.serviceType === "KOL_BOOKING") ||
        text.includes("kol") ||
        text.includes("koc") ||
        text.includes("influencer")
      );
    case "EMAIL":
      return (
        deliverables.some((d) => d.serviceType === "EMAIL_NEWSLETTER") ||
        text.includes("email") ||
        text.includes("bản tin") ||
        text.includes("newsletter")
      );
    case "CAMPAIGN":
      return (
        pkg.offeringModel === "CAMPAIGN" ||
        text.includes("chiến dịch") ||
        text.includes("campaign")
      );
    case "RETAINER":
      return (
        pkg.offeringModel === "RETAINER" ||
        text.includes("định kỳ") ||
        text.includes("tháng") ||
        text.includes("retainer")
      );
    case "DELIVERABLE_BUNDLE":
      return (
        pkg.offeringModel === "DELIVERABLE_BUNDLE" ||
        text.includes("sản lượng") ||
        text.includes("bộ ")
      );
    default:
      return true;
  }
}

export function MediaPackageCatalog(props: MediaPackageCatalogProps) {
  const { title, description, packages, canManageAvailability } = props;
  const { t } = useTranslation();
  const id = useId();

  // Search & Filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [availability, setAvailability] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Detail Drawer/Modal
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = packages.find((item) => item.id === detailId);

  // Check if any filters are active
  const hasActiveFilters =
    query.trim() !== "" ||
    category !== "all" ||
    sortBy !== "default" ||
    (canManageAvailability && availability !== "all");

  const handleResetFilters = () => {
    setQuery("");
    setCategory("all");
    setSortBy("default");
    setAvailability("all");
    setPage(1);
  };

  // Base Category Definitions
  const baseCategories = useMemo(
    () => [
      {
        value: "all",
        label: t("mediaPackage.ui.categories.all", "Tất cả danh mục"),
        icon: <LayoutGrid className="size-4" />,
      },
      {
        value: "SOCIAL_POST",
        label: t("mediaPackage.ui.categories.social", "Mạng xã hội"),
        icon: <Share2 className="size-4" />,
      },
      {
        value: "EVENT",
        label: t("mediaPackage.ui.categories.event", "Sự kiện & Hội thảo"),
        icon: <Calendar className="size-4" />,
      },
      {
        value: "PRESS",
        label: t("mediaPackage.ui.categories.press", "Báo chí & PR"),
        icon: <Newspaper className="size-4" />,
      },
      {
        value: "VIDEO",
        label: t("mediaPackage.ui.categories.video", "Video & Sáng tạo"),
        icon: <Film className="size-4" />,
      },
      {
        value: "KOL",
        label: t("mediaPackage.ui.categories.kol", "Booking KOL / KOC"),
        icon: <Users className="size-4" />,
      },
      {
        value: "EMAIL",
        label: t("mediaPackage.ui.categories.email", "Email Marketing"),
        icon: <Mail className="size-4" />,
      },
      {
        value: "CAMPAIGN",
        label: t("mediaPackage.ui.categories.campaign", "Gói theo chiến dịch"),
        icon: <Megaphone className="size-4" />,
      },
      {
        value: "RETAINER",
        label: t("mediaPackage.ui.categories.retainer", "Gói định kỳ (Retainer)"),
        icon: <Clock className="size-4" />,
      },
      {
        value: "DELIVERABLE_BUNDLE",
        label: t("mediaPackage.ui.categories.bundle", "Gói theo sản lượng"),
        icon: <Layers className="size-4" />,
      },
    ],
    [t],
  );

  // Category counts based on all available packages in this catalog
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: packages.length };
    for (const opt of baseCategories) {
      if (opt.value === "all") continue;
      counts[opt.value] = packages.filter((pkg) =>
        matchesCategory(pkg, opt.value),
      ).length;
    }
    return counts;
  }, [packages, baseCategories]);

  // Only show categories that have items in the current packages list (or currently selected)
  const availableCategoryOptions: SelectMenuOption[] = useMemo(() => {
    return baseCategories
      .filter(
        (opt) =>
          opt.value === "all" ||
          opt.value === category ||
          (categoryCounts[opt.value] ?? 0) > 0,
      )
      .map((opt) => {
        const count = categoryCounts[opt.value] ?? 0;
        return {
          value: opt.value,
          label: opt.value === "all" ? `${opt.label} (${packages.length})` : `${opt.label} (${count})`,
          icon: opt.icon,
        };
      });
  }, [baseCategories, category, categoryCounts, packages.length]);

  // Sort Options
  const sortOptions: SelectMenuOption[] = useMemo(
    () => [
      {
        value: "default",
        label: t("mediaPackage.ui.sort.default", "Sắp xếp: Mặc định"),
        icon: <ArrowUpDown className="size-4" />,
      },
      {
        value: "price_asc",
        label: t("mediaPackage.ui.sort.priceAsc", "Giá: Thấp → Cao"),
        icon: <ArrowUp className="size-4 text-emerald-500" />,
      },
      {
        value: "price_desc",
        label: t("mediaPackage.ui.sort.priceDesc", "Giá: Cao → Thấp"),
        icon: <ArrowDown className="size-4 text-rose-500" />,
      },
      {
        value: "duration_asc",
        label: t("mediaPackage.ui.sort.durationAsc", "Thời lượng: Ngắn → Dài"),
        icon: <Clock className="size-4" />,
      },
      {
        value: "duration_desc",
        label: t("mediaPackage.ui.sort.durationDesc", "Thời lượng: Dài → Ngắn"),
        icon: <Clock className="size-4" />,
      },
      {
        value: "name_asc",
        label: t("mediaPackage.ui.sort.nameAsc", "Tên: A → Z"),
        icon: <ArrowDownAZ className="size-4" />,
      },
      {
        value: "name_desc",
        label: t("mediaPackage.ui.sort.nameDesc", "Tên: Z → A"),
        icon: <ArrowUpZA className="size-4" />,
      },
      {
        value: "newest",
        label: t("mediaPackage.ui.sort.newest", "Mới nhất"),
        icon: <Sparkles className="size-4 text-brand-orange" />,
      },
    ],
    [t],
  );

  // Filtered packages
  const filtered = useMemo(() => {
    return packages.filter((item) => {
      // Search text match
      const matchesQuery =
        !query.trim() ||
        `${item.name} ${item.scopeDescription ?? ""}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase());

      // Availability filter
      const matchesAvailability =
        !canManageAvailability ||
        availability === "all" ||
        item.availableToWorkspaces === (availability === "available");

      // Category filter
      const matchesCat = matchesCategory(item, category);

      return matchesQuery && matchesAvailability && matchesCat;
    });
  }, [packages, query, availability, canManageAvailability, category]);

  // Sorted packages
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc": {
          const priceA = a.budgetAmount ?? Infinity;
          const priceB = b.budgetAmount ?? Infinity;
          return priceA - priceB;
        }
        case "price_desc": {
          const priceA = a.budgetAmount ?? -Infinity;
          const priceB = b.budgetAmount ?? -Infinity;
          return priceB - priceA;
        }
        case "duration_asc": {
          const durA = a.durationWeeks ?? Infinity;
          const durB = b.durationWeeks ?? Infinity;
          return durA - durB;
        }
        case "duration_desc": {
          const durA = a.durationWeeks ?? -Infinity;
          const durB = b.durationWeeks ?? -Infinity;
          return durB - durA;
        }
        case "name_asc":
          return a.name.localeCompare(b.name, "vi");
        case "name_desc":
          return b.name.localeCompare(a.name, "vi");
        case "newest": {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }
        default:
          return 0;
      }
    });
  }, [filtered, sortBy]);

  // Pagination calculation
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginated = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return sorted.slice(startIndex, startIndex + pageSize);
  }, [sorted, safePage, pageSize]);

  if (detail) {
    return (
      <MediaPackageDetail
        mediaPackage={detail}
        onClose={() => setDetailId(null)}
        actions={
          <>
            {props.onEdit && !detail.isTemplate && (
              <Button variant="outline" onClick={() => props.onEdit?.(detail)}>
                {t("mediaPackage.workspace.edit")}
              </Button>
            )}
            {props.shareAgencyId && !detail.isTemplate && (
              <PackageShareActions
                basePath={`/api/v1/agencies/${props.shareAgencyId}/media-packages/${detail.id}`}
              />
            )}
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
  }

  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-center gap-1">
        <h2 id={id} className="text-foreground text-lg font-semibold">
          {title}
        </h2>
        {description && <HelpHint label={title}>{description}</HelpHint>}
      </div>

      {packages.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search box */}
          <Input
            wrapperClassName="min-w-0 flex-1 lg:max-w-xs"
            aria-label={t("mediaPackage.ui.search")}
            placeholder={t("mediaPackage.ui.search")}
            iconPrefix={<Search className="size-4" aria-hidden="true" />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />

          {/* Controls: Category, Sort, Availability, Reset, Count */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Category Filter */}
            <SelectMenu
              ariaLabel={t("mediaPackage.ui.categoryFilter", "Lọc theo danh mục")}
              value={category}
              onChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
              className="h-9 min-w-40 text-xs"
              options={availableCategoryOptions}
            />

            {/* Sort Dropdown */}
            <SelectMenu
              ariaLabel={t("mediaPackage.ui.sortBy", "Sắp xếp theo")}
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
              className="h-9 min-w-36 text-xs"
              options={sortOptions}
            />

            {/* Availability Filter (for agency custom packages) */}
            {canManageAvailability && (
              <SelectMenu
                ariaLabel={t("mediaPackage.ui.availability")}
                value={availability}
                onChange={(val) => {
                  setAvailability(val);
                  setPage(1);
                }}
                className="h-9 min-w-36 text-xs"
                options={[
                  {
                    value: "all",
                    label: t("mediaPackage.ui.allPackages"),
                    icon: <Layers className="size-4" />,
                  },
                  {
                    value: "available",
                    label: t("mediaPackage.ui.availableOption"),
                    icon: <Eye className="size-4 text-emerald-500" />,
                  },
                  {
                    value: "hidden",
                    label: t("mediaPackage.ui.hiddenOption"),
                    icon: <EyeOff className="size-4 text-muted-foreground" />,
                  },
                ]}
              />
            )}

            {/* Quick Reset Button when filters are active */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground h-9 px-2 text-xs"
                title={t("mediaPackage.ui.resetFilters", "Đặt lại bộ lọc")}
              >
                <RotateCcw className="mr-1 size-3.5" />
                {t("mediaPackage.ui.resetFilters", "Đặt lại")}
              </Button>
            )}

            {/* Result count */}
            <p
              role="status"
              className="text-muted-foreground shrink-0 text-xs whitespace-nowrap sm:text-sm lg:ml-auto"
            >
              {t("mediaPackage.ui.resultCount", { count: totalItems })}
            </p>
          </div>
        </div>
      )}

      {totalItems === 0 ? (
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
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-4"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              {t("mediaPackage.ui.resetFilters", "Đặt lại bộ lọc")}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((mediaPackage) => (
              <div key={mediaPackage.id} className="flex min-w-0 flex-col gap-2">
                <MediaPackageCard
                  mediaPackage={mediaPackage}
                  selected={props.selectedPackageId === mediaPackage.id}
                  canSelect={props.canSelect}
                  selecting={props.selectingId === mediaPackage.id}
                  onSelect={props.onSelect}
                  onViewDetails={(item) => setDetailId(item.id)}
                  canUseTemplate={props.canUseTemplate}
                  canManageAvailability={canManageAvailability}
                  updatingAvailability={
                    props.updatingPackageId === mediaPackage.id
                  }
                  onUseTemplate={props.onUseTemplate}
                  onDuplicate={props.onDuplicate}
                  onToggleAvailability={props.onToggleAvailability}
                />
                {props.onEdit && !mediaPackage.isTemplate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => props.onEdit?.(mediaPackage)}
                  >
                    {t("mediaPackage.workspace.edit")}
                  </Button>
                )}
                {props.shareAgencyId && !mediaPackage.isTemplate && (
                  <PackageShareActions
                    basePath={`/api/v1/agencies/${props.shareAgencyId}/media-packages/${mediaPackage.id}`}
                  />
                )}
              </div>
            ))}
          </div>

          <Pagination
            page={safePage}
            size={pageSize}
            total={totalItems}
            totalPages={totalPages}
            pageSizeOptions={[6, 9, 12, 18]}
            itemLabel={t("mediaPackage.ui.packageLabel", "gói")}
            onPageChange={(newPage) => setPage(newPage)}
            onSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            className="pt-2"
          />
        </>
      )}
    </section>
  );
}

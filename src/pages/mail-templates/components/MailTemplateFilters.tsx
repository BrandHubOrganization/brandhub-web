import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Clock,
  FileText,
  History,
  Layers,
  LayoutGrid,
  MailX,
  Megaphone,
  Plus,
  Search,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import type { MailTemplateCategory, MailTemplateSort } from "../types";

export interface MailTemplateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: MailTemplateCategory;
  onCategoryChange: (category: MailTemplateCategory) => void;
  categoryCounts: Record<MailTemplateCategory, number>;
  sort: MailTemplateSort;
  onSortChange: (sort: MailTemplateSort) => void;
  workspaceId: string;
  onCreateTemplate: () => void;
}

const CATEGORIES: { id: MailTemplateCategory; icon: LucideIcon }[] = [
  { id: "ALL", icon: LayoutGrid },
  { id: "SYSTEM_DEFAULT", icon: Layers },
  { id: "CUSTOM", icon: FileText },
  { id: "CAMPAIGN_BROADCAST", icon: Megaphone },
  { id: "WORKSPACE_MANAGER", icon: Users },
];

export function MailTemplateFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categoryCounts,
  sort,
  onSortChange,
  workspaceId,
  onCreateTemplate,
}: MailTemplateFiltersProps) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const sortOptions: SelectMenuOption[] = [
    {
      value: "CREATED_DESC",
      label: t("mailTemplate.sort.createdDesc"),
      icon: <Clock className="size-3.5" />,
    },
    {
      value: "CREATED_ASC",
      label: t("mailTemplate.sort.createdAsc"),
      icon: <Clock className="size-3.5" />,
    },
    {
      value: "NAME_ASC",
      label: t("mailTemplate.sort.nameAsc"),
      icon: <ArrowDownAZ className="size-3.5" />,
    },
    {
      value: "NAME_DESC",
      label: t("mailTemplate.sort.nameDesc"),
      icon: <ArrowUpZA className="size-3.5" />,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Top row: Search + Sort controls on left, Action buttons on right */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search bar with clear button */}
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 select-none" />
            <Input
              aria-label={t("mailTemplate.search")}
              placeholder={t("mailTemplate.search")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="bg-card h-9 w-full pl-9 pr-8 text-xs sm:text-sm"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={t("mailTemplate.clearSearch")}
                className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sort SelectMenu */}
          <SelectMenu
            ariaLabel={t("mailTemplate.sort.label")}
            value={sort}
            onChange={(val) => onSortChange(val as MailTemplateSort)}
            options={sortOptions}
            className="h-9 w-44"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/workspaces/${workspaceId}/mail-templates/suppressions`}>
              <MailX className="size-4" />
              <span>{t("mailTemplate.suppressions.link")}</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/workspaces/${workspaceId}/mail-templates/batches`}>
              <History className="size-4" />
              <span>{t("mailTemplate.batches.title")}</span>
            </Link>
          </Button>
          <Button
            variant="orange"
            size="sm"
            onClick={onCreateTemplate}
          >
            <Plus className="size-4" />
            <span>{t("mailTemplate.create")}</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Category Pills with Badge counts */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
        {CATEGORIES.map(({ id: catId, icon: Icon }) => {
          const isActive = category === catId;
          const count = categoryCounts[catId] ?? 0;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => onCategoryChange(catId)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{t(`mailTemplate.categories.${catId}`)}</span>
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-card text-muted-foreground border border-border/50"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

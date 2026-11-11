import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
  CategoryItem,
  ExtraFieldItem,
  FilterCategory,
  TaskFilterCategorySidebarProps,
} from "./types";

export type { CategoryItem, ExtraFieldItem, TaskFilterCategorySidebarProps };

export function TaskFilterCategorySidebar({
  categories,
  activeCategory,
  onSelectCategory,
  availableExtraFields,
  onAddField,
  onRemoveField,
  activeFilterCount,
  onClearFilters,
}: TaskFilterCategorySidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between bg-muted/20">
      <div className="flex flex-col py-1.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCategory(cat.id);
                }
              }}
              className={cn(
                "group flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer select-none border-l-2",
                isActive
                  ? "border-brand-orange bg-muted/60 font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground font-normal",
              )}
            >
              <span className="truncate">{cat.label}</span>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {cat.count > 0 && (
                  <span className="bg-brand-orange text-white inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                    {cat.count}
                  </span>
                )}
                {cat.removable && onRemoveField && (
                  <button
                    type="button"
                    title={t("tasks.timelineGrid.removeField", {
                      defaultValue: "Xóa trường khỏi bộ lọc",
                    })}
                    aria-label={t("tasks.timelineGrid.removeField", {
                      defaultValue: "Xóa trường khỏi bộ lọc",
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveField(cat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer inline-flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* + Add field Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={availableExtraFields.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="size-3.5 text-muted-foreground" />
              <span>
                {t("tasks.timelineGrid.addField", {
                  defaultValue: "Thêm trường",
                })}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-48 bg-card border-border shadow-lg">
            {availableExtraFields.map((field) => (
              <DropdownMenuItem
                key={field.id}
                onClick={() => onAddField(field.id)}
                className="flex items-center gap-2 text-xs cursor-pointer text-foreground hover:bg-muted"
              >
                {field.icon}
                <span>{field.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear All Footer */}
      <div className="border-t border-border p-2 bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          disabled={activeFilterCount === 0}
          onClick={onClearFilters}
          className="h-7 w-full justify-start px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
        >
          {t("tasks.timelineGrid.clearAll", {
            defaultValue: "Clear all",
          })}
        </Button>
      </div>
    </div>
  );
}
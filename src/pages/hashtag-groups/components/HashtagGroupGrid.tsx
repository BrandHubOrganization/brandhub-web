import { Plus, Hash, Edit2, Trash2, Loader2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HashtagGroup } from "@/types/hashtagGroup";
import { useTranslation } from "react-i18next";

interface Props {
  groups: HashtagGroup[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (group: HashtagGroup) => void;
  onDelete: (group: HashtagGroup) => void;
}

export function HashtagGroupGrid({
  groups,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 py-20">
        <Loader2 className="text-brand-orange size-8 animate-spin" />
        <p className="text-xs font-medium">{t("hashtagGroups.loading")}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="border-border bg-card mx-auto my-8 flex max-w-lg flex-col items-center justify-center space-y-4 rounded-xl border p-12 text-center shadow-xs">
        <div className="bg-brand-orange-soft text-brand-orange rounded-xl p-4">
          <FileQuestion className="size-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-foreground text-base font-bold">
            {t("hashtagGroups.grid.emptyTitle")}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("hashtagGroups.grid.emptyDescription")}
          </p>
        </div>
        <Button
          type="button"
          onClick={onCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <Plus className="mr-1 size-4" />
          <span>{t("hashtagGroups.grid.createFirstButton")}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div
          key={group.id}
          className="hover:border-brand-orange/40 group border-border bg-card flex flex-col justify-between space-y-4 rounded-xl border p-5 shadow-xs transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-brand-orange-soft text-brand-orange shrink-0 rounded-lg p-1.5">
                  <Hash className="size-4" />
                </div>
                <h3 className="group-hover:text-brand-orange text-foreground truncate text-sm font-semibold transition-colors">
                  {group.name}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(group)}
                  title={t("hashtagGroups.grid.editGroup")}
                  className="hover:text-brand-orange text-muted-foreground size-8 cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(group)}
                  title={t("hashtagGroups.grid.deleteGroup")}
                  className="text-muted-foreground size-8 cursor-pointer hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xs text-muted-foreground flex items-center justify-between">
                <span>
                  {t("hashtagGroups.grid.tagCount", { count: group.count })}
                </span>
              </div>

              <div className="border-border bg-muted flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border p-3">
                {group.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-orange-soft text-brand-orange border-brand-orange/10 rounded-xl border px-2 py-0.5 font-mono text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

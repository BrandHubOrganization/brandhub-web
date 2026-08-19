import { Plus, Hash, Edit2, Trash2, Loader2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HashtagGroup } from "@/types/hashtagGroup";

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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-20 text-zinc-400">
        <Loader2 className="text-brand-orange h-8 w-8 animate-spin" />
        <p className="text-xs font-medium">Đang tải nhóm hashtag...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="bg-brand-orange-soft text-brand-orange rounded-2xl p-4">
          <FileQuestion className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-foreground text-base font-bold">
            Chưa Có Nhóm Hashtag Nào
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Tạo các bộ hashtag dùng chung theo chủ đề để tăng tốc độ sáng tạo
            bài đăng.
          </p>
        </div>
        <Button
          type="button"
          onClick={onCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span>Tạo Nhóm Hashtag Đầu Tiên</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div
          key={group.id}
          className="hover:border-brand-orange/40 group flex flex-col justify-between space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-brand-orange-soft text-brand-orange shrink-0 rounded-lg p-1.5">
                  <Hash className="h-4 w-4" />
                </div>
                <h3 className="group-hover:text-brand-orange truncate text-sm font-semibold text-zinc-900 transition-colors dark:text-zinc-100">
                  {group.name}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(group)}
                  title="Chỉnh sửa nhóm"
                  className="hover:text-brand-orange dark:hover:text-brand-orange h-8 w-8 cursor-pointer text-zinc-400"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(group)}
                  title="Xóa nhóm"
                  className="h-8 w-8 cursor-pointer text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>
                  Số lượng:{" "}
                  <strong className="font-mono text-zinc-700 dark:text-zinc-300">
                    {group.count}
                  </strong>{" "}
                  tags
                </span>
              </div>

              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                {group.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-orange-soft text-brand-orange border-brand-orange/10 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold"
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

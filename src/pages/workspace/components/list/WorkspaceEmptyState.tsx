import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceEmptyStateProps {
  type: "no_workspaces" | "no_results";
  onClearFilters?: () => void;
}

export function WorkspaceEmptyState({
  type,
  onClearFilters,
}: WorkspaceEmptyStateProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (type === "no_workspaces") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center bg-card/40">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
          <Briefcase className="size-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            {t("workspace.list.emptyTitle", "Chưa có workspace nào")}
          </p>
          <p className="text-muted-foreground text-xs mt-1 max-w-sm">
            {t(
              "workspace.list.emptyDescription",
              "Bạn chưa tham gia không gian làm việc nào. Hãy tạo workspace mới để bắt đầu.",
            )}
          </p>
        </div>
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white shadow-xs text-xs"
          onClick={() => navigate("/workspaces/create")}
        >
          <Plus className="size-3.5" />
          {t("workspace.list.createButton", "Tạo workspace mới")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center bg-card/40">
      <Search className="size-8 text-muted-foreground/60" />
      <p className="text-sm font-semibold text-foreground">
        {t("workspace.list.noResults", "Không tìm thấy workspace nào")}
      </p>
      <p className="text-xs text-muted-foreground max-w-sm">
        {t(
          "workspace.list.noResultsHint",
          "Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để xem danh sách đầy đủ.",
        )}
      </p>
      {onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-2 text-xs cursor-pointer"
        >
          {t("workspace.list.clearFilter", "Xóa bộ lọc")}
        </Button>
      )}
    </div>
  );
}

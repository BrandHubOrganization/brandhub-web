import PageWrapper from "@/components/layout/PageWrapper";
import { HashtagGroupFormModal } from "@/pages/hashtag-groups/components/HashtagGroupFormModal";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useHashtagGroups } from "./hooks/useHashtagGroups";
import { HashtagGroupGrid } from "./components/HashtagGroupGrid";

export function HashtagGroupsPage() {
  const {
    groups,
    search,
    setSearch,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    editingGroup,
    deletingGroup,
    setDeletingGroup,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleConfirmDelete,
  } = useHashtagGroups();

  return (
    <PageWrapper
      title="Quản Lý Nhóm Hashtags"
      description="Quản lý và nhóm các từ khóa Hashtag theo chủ đề để chèn nhanh vào bài viết."
      actions={
        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span>Tạo Nhóm Mới</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:flex-row dark:border-zinc-800 dark:bg-zinc-900">
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nhóm theo tên hoặc hashtag..."
              className="text-xs"
            />
          </div>

          <div className="self-end text-xs font-medium text-zinc-500 sm:self-center dark:text-zinc-400">
            Hiển thị{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {groups.length}
            </strong>{" "}
            nhóm hashtag
          </div>
        </div>

        <HashtagGroupGrid
          groups={groups}
          isLoading={isLoading}
          onCreate={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={setDeletingGroup}
        />
      </div>

      <HashtagGroupFormModal
        isOpen={isFormOpen}
        initialData={editingGroup}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title={`Xóa Nhóm Hashtag "${deletingGroup?.name}"?`}
        description="Bạn có chắc chắn muốn xóa nhóm hashtag này không? Thao tác này không thể hoàn tác."
        confirmText="Xóa Nhóm"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageWrapper>
  );
}

export default HashtagGroupsPage;

import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { HashtagGroupFormModal } from '@/components/hashtag/HashtagGroupFormModal';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockHashtagGroupService } from '@/services/mockHashtagGroupService';
import type { HashtagGroup } from '@/types/hashtagGroup';
import { Search, Plus, Hash, Edit2, Trash2, Loader2, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';

export function HashtagGroupsPage() {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);

  // Delete Confirm State
  const [deletingGroup, setDeletingGroup] = useState<HashtagGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockHashtagGroupService.getGroups(search);
      setGroups(data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách nhóm Hashtag');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (group: HashtagGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  // Submit Create / Edit Form
  const handleFormSubmit = async (payload: { name: string; hashtags: string[] }) => {
    if (editingGroup) {
      await mockHashtagGroupService.updateGroup(editingGroup.id, payload);
      toast.success(`Đã cập nhật nhóm hashtag "${payload.name}"!`);
    } else {
      await mockHashtagGroupService.createGroup(payload);
      toast.success(`Đã tạo mới nhóm hashtag "${payload.name}"!`);
    }
    fetchGroups();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;
    setIsDeleting(true);
    try {
      await mockHashtagGroupService.deleteGroup(deletingGroup.id);
      toast.success(`Đã xóa nhóm hashtag "${deletingGroup.name}"!`);
      setDeletingGroup(null);
      fetchGroups();
    } catch (err) {
      toast.error('Lỗi khi xóa nhóm hashtag');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageWrapper
      title="Quản Lý Nhóm Hashtags"
      description="Quản lý và nhóm các từ khóa Hashtag theo chủ đề để chèn nhanh vào bài viết."
      actions={
        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white font-semibold text-xs"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Tạo Nhóm Mới</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Control Bar: Search & Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nhóm theo tên hoặc hashtag..."
              className="text-xs"
            />
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium self-end sm:self-center">
            Hiển thị <strong className="text-zinc-900 dark:text-zinc-100">{groups.length}</strong> nhóm hashtag
          </div>
        </div>

        {/* Groups Grid Cards */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Đang tải nhóm hashtag...</p>
          </div>
        ) : groups.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileQuestion className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Chưa Có Nhóm Hashtag Nào
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Tạo các bộ hashtag dùng chung theo chủ đề để tăng tốc độ sáng tạo bài đăng.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Tạo Nhóm Hashtag Đầu Tiên</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Header: Title & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {group.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(group)}
                        title="Chỉnh sửa nhóm"
                        className="h-8 w-8 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingGroup(group)}
                        title="Xóa nhóm"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Count Badge & Tag Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Số lượng: <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{group.count}</strong> tags</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 max-h-32 overflow-y-auto">
                      {group.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200/60 dark:border-zinc-700 shadow-2xs"
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
        )}
      </div>

      {/* Form Modal */}
      <HashtagGroupFormModal
        isOpen={isFormOpen}
        initialData={editingGroup}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
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

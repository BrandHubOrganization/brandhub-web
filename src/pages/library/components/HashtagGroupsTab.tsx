import React, { useEffect, useState } from 'react';
import type { HashtagGroup } from '@/types/contentLibrary';
import { mockContentLibraryService } from '@/services/mockContentLibraryService';
import { Hash, Copy, Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const HashtagGroupsTab: React.FC = () => {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await mockContentLibraryService.getHashtagGroups();
      setGroups(data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách Hashtag Groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCopyGroup = (group: HashtagGroup) => {
    const textToCopy = group.tags.join(' ');
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(group.id);
    toast.success(`Đã copy nhóm hashtag "${group.name}"!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenModal = (group?: HashtagGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
      setTagsInput(group.tags.join(' '));
    } else {
      setEditingGroup(null);
      setGroupName('');
      setTagsInput('');
    }
    setIsModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !tagsInput.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và hashtag');
      return;
    }

    const tagsArray = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSaving(true);
    try {
      if (editingGroup) {
        const updated = await mockContentLibraryService.updateHashtagGroup(editingGroup.id, groupName, tagsArray);
        setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        toast.success('Cập nhật nhóm Hashtag thành công!');
      } else {
        const created = await mockContentLibraryService.createHashtagGroup(groupName, tagsArray);
        setGroups((prev) => [created, ...prev]);
        toast.success('Tạo nhóm Hashtag mới thành công!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Lỗi khi lưu nhóm Hashtag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm hashtag "${name}"?`)) {
      try {
        await mockContentLibraryService.deleteHashtagGroup(id);
        setGroups((prev) => prev.filter((g) => g.id !== id));
        toast.success('Đã xóa nhóm Hashtag');
      } catch (err) {
        toast.error('Lỗi khi xóa nhóm Hashtag');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Hash className="w-4 h-4 text-brand-orange" />
            Nhóm Hashtag Đã Lưu ({groups.length})
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Quản lý các bộ hashtag định sẵn và copy nhanh vào bài đăng
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Nhóm Hashtag</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Đang tải nhóm hashtag...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <Hash className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Chưa có nhóm hashtag nào. Nhấn "Tạo Nhóm Hashtag" để thêm mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-brand-orange/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 group-hover:text-brand-orange transition-colors">
                    <Tag className="w-3.5 h-3.5 text-brand-orange" />
                    {group.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(group)}
                      className="p-1 text-zinc-400 hover:text-brand-orange dark:hover:text-brand-orange rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Sửa nhóm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hashtag List Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4 max-h-32 overflow-y-auto">
                  {group.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-brand-orange-soft text-brand-orange border border-brand-orange/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copy Action Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">{group.tags.length} hashtags</span>
                <button
                  onClick={() => handleCopyGroup(group)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === group.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Đã Copy</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Group</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {editingGroup ? 'Chỉnh Sửa Nhóm Hashtag' : 'Tạo Nhóm Hashtag Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên nhóm Hashtag
                </label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ví dụ: Fashion Summer 2026"
                  className="rounded-xl border-zinc-200 bg-zinc-50 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Danh sách Hashtags (cách nhau bởi dấu cách hoặc phẩy)
                </label>
                <Textarea
                  rows={4}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="#fashion #summer #style #ootd"
                  className="rounded-xl border-zinc-200 bg-zinc-50 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu Nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

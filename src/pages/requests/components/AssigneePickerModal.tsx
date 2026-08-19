import React, { useState } from 'react';
import type { Assignee } from '@/types/contentRequest';
import { MOCK_CREATORS } from '@/services/mockContentRequestService';
import { X, Search, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AssigneePickerModalProps {
  isOpen: boolean;
  requestTitle: string;
  currentAssignee?: Assignee;
  onClose: () => void;
  onConfirm: (assigneeId: string) => Promise<void>;
}

export const AssigneePickerModal: React.FC<AssigneePickerModalProps> = ({
  isOpen,
  requestTitle,
  currentAssignee,
  onClose,
  onConfirm,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentAssignee?.id || '');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredCreators = MOCK_CREATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error('Vui lòng chọn nhân sự đảm nhận bài viết');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedId);
      onClose();
    } catch (err) {
      toast.error('Lỗi khi phân công nhân sự');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-orange dark:text-brand-orange/80" />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Phân Công Nhân Sự Sáng Tạo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Gán Creator cho yêu cầu: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{requestTitle}</span>
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email Creator..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        {/* Creators List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {filteredCreators.map((creator) => {
            const isSelected = selectedId === creator.id;
            return (
              <div
                key={creator.id}
                onClick={() => setSelectedId(creator.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-brand-orange-soft dark:bg-brand-orange/20 border-brand-orange/50 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {creator.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {creator.email}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gán...' : 'Xác nhận gán'}
          </button>
        </div>
      </div>
    </div>
  );
};

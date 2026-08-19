import React, { useState } from "react";
import type { Assignee } from "@/types/contentRequest";
import { MOCK_CREATORS } from "@/services/mockContentRequestService";
import { X, Search, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>(
    currentAssignee?.id || "",
  );
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredCreators = MOCK_CREATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error("Vui lòng chọn nhân sự đảm nhận bài viết");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedId);
      onClose();
    } catch (err) {
      toast.error("Lỗi khi phân công nhân sự");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-card border-border w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserPlus className="text-brand-orange dark:text-brand-orange/80 size-5" />
            <h3 className="text-foreground text-sm font-semibold">
              Phân Công Nhân Sự Sáng Tạo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-muted-foreground text-xs">
          Gán Creator cho yêu cầu:{" "}
          <span className="text-foreground font-semibold">{requestTitle}</span>
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email Creator..."
            className="bg-muted text-foreground focus:ring-brand-orange/20 w-full rounded-xl border border-zinc-200 py-2 pr-4 pl-9 text-xs focus:ring-2 focus:outline-hidden dark:border-zinc-700"
          />
        </div>

        {/* Creators List */}
        <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {filteredCreators.map((creator) => {
            const isSelected = selectedId === creator.id;
            return (
              <div
                key={creator.id}
                onClick={() => setSelectedId(creator.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "bg-brand-orange-soft dark:bg-brand-orange/20 border-brand-orange/50 shadow-xs"
                    : "border-zinc-100 bg-white hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="size-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                  <div>
                    <h4 className="text-foreground text-xs font-semibold">
                      {creator.name}
                    </h4>
                    <span className="text-muted-foreground text-3xs font-mono">
                      {creator.email}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="bg-brand-orange flex size-5 items-center justify-center rounded-full text-white">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? t("requests.assigneePicker.assigning")
              : t("requests.assigneePicker.confirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

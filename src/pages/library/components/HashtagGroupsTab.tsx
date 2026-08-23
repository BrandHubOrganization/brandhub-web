import React, { useEffect, useState } from "react";
import type { HashtagGroup } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mockContentLibraryService";
import { Hash, Copy, Plus, Edit2, Trash2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const HashtagGroupsTab: React.FC = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await mockContentLibraryService.getHashtagGroups();
      setGroups(data);
    } catch (err) {
      toast.error(t("hashtagGroups.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCopyGroup = (group: HashtagGroup) => {
    const textToCopy = group.tags.join(" ");
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(group.id);
    toast.success(t("hashtagGroups.copySuccess", { name: group.name }));
    setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DURATION_MS);
  };

  const handleOpenModal = (group?: HashtagGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
      setTagsInput(group.tags.join(" "));
    } else {
      setEditingGroup(null);
      setGroupName("");
      setTagsInput("");
    }
    setIsModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !tagsInput.trim()) {
      toast.error(t("hashtagGroups.validationError"));
      return;
    }

    const tagsArray = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSaving(true);
    try {
      if (editingGroup) {
        const updated = await mockContentLibraryService.updateHashtagGroup(
          editingGroup.id,
          groupName,
          tagsArray,
        );
        setGroups((prev) =>
          prev.map((g) => (g.id === updated.id ? updated : g)),
        );
        toast.success(t("hashtagGroups.updateSuccess"));
      } else {
        const created = await mockContentLibraryService.createHashtagGroup(
          groupName,
          tagsArray,
        );
        setGroups((prev) => [created, ...prev]);
        toast.success(t("hashtagGroups.createSuccess"));
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(t("hashtagGroups.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (window.confirm(t("hashtagGroups.deleteConfirm", { name }))) {
      try {
        await mockContentLibraryService.deleteHashtagGroup(id);
        setGroups((prev) => prev.filter((g) => g.id !== id));
        toast.success(t("hashtagGroups.deleteSuccess"));
      } catch (err) {
        toast.error(t("hashtagGroups.deleteError"));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Hash className="text-brand-orange size-4" />
            {t("hashtagGroups.headerCount", { count: groups.length })}
          </h3>
          <p className="text-muted-foreground text-xs">
            {t("hashtagGroups.headerDescription")}
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="size-4" />
          <span>{t("hashtagGroups.createButton")}</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400">
          {t("hashtagGroups.loading")}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <Hash className="mx-auto mb-2 size-10 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs text-zinc-500">
            {t("hashtagGroups.emptyState")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="hover:border-brand-orange/40 group flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="group-hover:text-brand-orange flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors dark:text-zinc-100">
                    <Tag className="text-brand-orange size-3.5" />
                    {group.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(group)}
                      className="hover:text-brand-orange dark:hover:text-brand-orange cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title={t("hashtagGroups.editTooltip")}
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      title={t("hashtagGroups.deleteTooltip")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hashtag List Badges */}
                <div className="mb-4 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                  {group.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-brand-orange-soft text-brand-orange border-brand-orange/10 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copy Action Footer */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                <span className="text-2xs font-mono text-zinc-400">
                  {t("hashtagGroups.hashtagsCount", {
                    count: group.tags.length,
                  })}
                </span>
                <button
                  onClick={() => handleCopyGroup(group)}
                  className="hover:bg-brand-orange dark:hover:bg-brand-orange flex cursor-pointer items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:text-white dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {copiedId === group.id ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>{t("hashtagGroups.copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>{t("hashtagGroups.copyGroupButton")}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-foreground text-sm font-semibold">
                {editingGroup
                  ? t("hashtagGroups.editModalTitle")
                  : t("hashtagGroups.createModalTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("hashtagGroups.nameFieldLabel")}
                </label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t("hashtagGroups.namePlaceholder")}
                  className="rounded-xl border-zinc-200 bg-zinc-50 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("hashtagGroups.tagsFieldLabel")}
                </label>
                <Textarea
                  rows={4}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t("hashtagGroups.tagsPlaceholder")}
                  className="rounded-xl border-zinc-200 bg-zinc-50 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {t("hashtagGroups.cancelButton")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSaving
                    ? t("hashtagGroups.saving")
                    : t("hashtagGroups.saveButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

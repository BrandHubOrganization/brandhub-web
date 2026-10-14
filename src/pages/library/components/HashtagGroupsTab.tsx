import React, { useEffect, useState } from "react";
import type { HashtagGroup } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mock/mockContentLibraryService";
import { Hash, Copy, Plus, Edit2, Trash2, Check, X, Tag, Search } from "lucide-react";
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
    } catch {
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
    } catch {
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
      } catch {
        toast.error(t("hashtagGroups.deleteError"));
      }
    }
  };

  const [search, setSearch] = useState("");

  const filteredGroups = groups.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhóm hashtag theo tên hoặc từ khóa (#tag)..."
            className="border-border bg-muted text-foreground placeholder-muted-foreground rounded-xl pr-4 pl-9 text-xs"
          />
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="size-4" />
          <span>{t("hashtagGroups.createButton")}</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-muted-foreground py-12 text-center text-xs">
          {t("hashtagGroups.loading")}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-8 py-12 text-center">
          <Hash className="text-muted-foreground mx-auto mb-2 size-10" />
          <p className="text-muted-foreground text-xs">
            {t("hashtagGroups.emptyState")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="hover:border-brand-orange/40 border-border bg-card group flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    {group.category && (
                      <span className="bg-brand-orange/10 text-brand-orange mb-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {group.category}
                      </span>
                    )}
                    <h4 className="group-hover:text-brand-orange text-foreground flex items-center gap-1.5 text-sm font-semibold transition-colors">
                      <Tag className="text-brand-orange size-3.5" />
                      {group.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(group)}
                      className="hover:text-brand-orange text-muted-foreground hover:bg-muted cursor-pointer rounded-lg p-1 transition-colors"
                      title={t("hashtagGroups.editTooltip")}
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="text-muted-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
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
              <div className="border-border flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-muted-foreground font-mono">
                    {t("hashtagGroups.hashtagsCount", {
                      count: group.tags.length,
                    })}
                  </span>
                  {group.usageCount && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.2 text-[10px] font-medium">
                      {group.usageCount} lượt dùng
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCopyGroup(group)}
                  className="hover:bg-brand-orange dark:hover:bg-brand-orange bg-muted text-foreground flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors hover:text-white"
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
          <div className="border-border bg-card w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground text-sm font-semibold">
                {editingGroup
                  ? t("hashtagGroups.editModalTitle")
                  : t("hashtagGroups.createModalTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="text-foreground mb-1 block text-xs font-semibold">
                  {t("hashtagGroups.nameFieldLabel")}
                </label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t("hashtagGroups.namePlaceholder")}
                  className="border-border bg-muted text-foreground rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-foreground mb-1 block text-xs font-semibold">
                  {t("hashtagGroups.tagsFieldLabel")}
                </label>
                <Textarea
                  rows={4}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t("hashtagGroups.tagsPlaceholder")}
                  className="border-border bg-muted text-foreground rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border-border text-foreground cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium"
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

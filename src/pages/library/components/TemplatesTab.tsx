import React, { useEffect, useState } from "react";
import type { PostTemplate, HashtagGroup } from "@/types/contentLibrary";
import { mockContentLibraryService } from "@/services/mock/mockContentLibraryService";
import { FileText, ArrowRight, Plus, Trash2, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export const TemplatesTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedHgId, setSelectedHgId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplData, hgData] = await Promise.all([
        mockContentLibraryService.getTemplates(),
        mockContentLibraryService.getHashtagGroups(),
      ]);
      setTemplates(tplData);
      setHashtagGroups(hgData);
    } catch (err) {
      toast.error(t("library.templates.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUseTemplate = (tpl: PostTemplate) => {
    const fullCaption = tpl.hashtagGroup
      ? `${tpl.caption}\n\n${tpl.hashtagGroup.tags.join(" ")}`
      : tpl.caption;

    // Navigate to /editor passing pre-fill state
    navigate("/editor", {
      state: {
        prefilledCaption: fullCaption,
        templateTitle: tpl.title,
      },
    });

    toast.success(t("library.templates.useSuccess", { title: tpl.title }));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) {
      toast.error(t("library.templates.validationError"));
      return;
    }

    setIsSaving(true);
    try {
      const created = await mockContentLibraryService.createTemplate(
        title,
        caption,
        selectedHgId || undefined,
      );
      setTemplates((prev) => [created, ...prev]);
      toast.success(t("library.templates.createSuccess"));
      setIsModalOpen(false);
      setTitle("");
      setCaption("");
      setSelectedHgId("");
    } catch (err) {
      toast.error(t("library.templates.createError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (window.confirm(t("library.templates.deleteConfirm", { title }))) {
      try {
        await mockContentLibraryService.deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success(t("library.templates.deleteSuccess"));
      } catch (err) {
        toast.error(t("library.templates.deleteError"));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border bg-card flex items-center justify-between rounded-xl border p-4 shadow-xs">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <FileText className="text-brand-orange size-4" />
            {t("library.templates.headerCount", { count: templates.length })}
          </h3>
          <p className="text-muted-foreground text-xs">
            {t("library.templates.headerDescription")}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="size-4" />
          <span>{t("library.templates.createNewButton")}</span>
        </button>
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="text-muted-foreground py-12 text-center text-xs">
          {t("library.templates.loading")}
        </div>
      ) : templates.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-8 py-12 text-center">
          <FileText className="text-muted-foreground mx-auto mb-2 size-10" />
          <p className="text-muted-foreground text-xs">
            {t("library.templates.emptyState")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="hover:border-brand-orange/40 group border-border bg-card flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-all"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="group-hover:text-brand-orange text-foreground flex items-center gap-1.5 text-sm font-semibold transition-colors">
                    {tpl.title}
                  </h4>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="text-muted-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Caption Snippet */}
                <p className="border-border bg-muted text-muted-foreground mb-4 line-clamp-3 rounded-xl border p-3 text-xs leading-relaxed">
                  {tpl.caption}
                </p>

                {/* Attached Hashtag Group */}
                {tpl.hashtagGroup && (
                  <div className="mb-4">
                    <span className="text-3xs text-muted-foreground mb-1 block font-semibold tracking-wider uppercase">
                      {t("library.templates.attachedHashtagsLabel")}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tpl.hashtagGroup.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-brand-orange-soft text-brand-orange text-3xs rounded-xl px-2 py-0.5 font-mono font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="text-2xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(tpl.createdAt).toLocaleDateString("vi-VN")}
                </span>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <span>{t("library.templates.useTemplateButton")}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="border-border bg-card w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground text-sm font-semibold">
                {t("library.templates.modalTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.titleFieldLabel")}
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("library.templates.titlePlaceholder")}
                  className="border-border bg-muted text-foreground rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.captionFieldLabel")}
                </label>
                <Textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("library.templates.captionPlaceholder")}
                  className="border-border bg-muted text-foreground rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  {t("library.templates.hashtagGroupFieldLabel")}
                </label>
                <Select
                  value={selectedHgId}
                  onChange={(e) => setSelectedHgId(e.target.value)}
                  className="border-border bg-muted text-foreground rounded-xl text-xs"
                >
                  <option value="">
                    {t("library.templates.hashtagGroupNone")}
                  </option>
                  {hashtagGroups.map((hg) => (
                    <option key={hg.id} value={hg.id}>
                      {hg.name} ({hg.tags.length} tags)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border-border text-muted-foreground cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium"
                >
                  {t("library.templates.cancelButton")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSaving
                    ? t("library.templates.creating")
                    : t("library.templates.createButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

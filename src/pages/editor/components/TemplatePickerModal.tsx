import React, { useEffect, useState } from "react";
import { LayoutTemplate, Search, Check, X } from "lucide-react";
import { mockTemplateService } from "@/services/mockTemplateService";
import type { ContentTemplate } from "@/types/template";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContentTemplate) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      mockTemplateService
        .getTemplates({ search, page: 0, size: 20 })
        .then((res) => setTemplates(res.items))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleApply = (tpl: ContentTemplate) => {
    onSelectTemplate(tpl);
    toast.success(
      t("editor.templatePicker.applySuccess", { title: tpl.title }),
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="animate-in fade-in zoom-in-95 border-border bg-card flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-2xl duration-200">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">
                {t("editor.templatePicker.title")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("editor.templatePicker.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 text-lg leading-none"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-border bg-muted/50 border-b p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("editor.templatePicker.searchPlaceholder")}
              className="border-border bg-card text-foreground rounded-xl pr-4 pl-9 text-xs"
            />
          </div>
        </div>

        {/* Template Grid Body */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          {isLoading ? (
            <div className="text-muted-foreground col-span-2 py-12 text-center text-xs">
              {t("editor.templatePicker.loading")}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-muted-foreground col-span-2 py-12 text-center text-xs">
              {t("editor.templatePicker.empty")}
            </div>
          ) : (
            templates.map((tpl) => (
              <div
                key={tpl.id}
                className="hover:border-brand-orange/50 group border-border bg-card flex flex-col justify-between space-y-3 rounded-xl border p-4 shadow-2xs transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="group-hover:text-brand-orange text-foreground line-clamp-1 text-xs font-semibold transition-colors">
                      {tpl.title}
                    </h4>
                    <span className="bg-brand-orange-soft text-brand-orange text-3xs shrink-0 rounded-full px-2 py-0.5 font-mono font-bold">
                      {t("editor.templatePicker.templateBadge")}
                    </span>
                  </div>

                  <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                    {tpl.caption}
                  </p>
                </div>

                {/* Hashtags & Action */}
                <div className="border-border flex items-center justify-between gap-2 border-t pt-2">
                  <div className="flex max-h-6 flex-wrap gap-1 overflow-hidden">
                    {tpl.hashtags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-3xs bg-muted text-muted-foreground rounded-xl px-1.5 py-0.5 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(tpl)}
                    className="bg-brand-orange hover:bg-brand-orange/90 flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors"
                  >
                    <Check className="size-3.5" />
                    <span>{t("editor.templatePicker.apply")}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

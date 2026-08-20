import React, { useState, useEffect } from "react";
import type { HashtagGroup } from "@/types/hashtagGroup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hash, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HashtagGroupFormModalProps {
  isOpen: boolean;
  initialData?: HashtagGroup | null;
  onClose: () => void;
  onSubmit: (data: { name: string; hashtags: string[] }) => Promise<void>;
}

export const HashtagGroupFormModal: React.FC<HashtagGroupFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [hashtagsText, setHashtagsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setHashtagsText(initialData.hashtags.join(", "));
    } else {
      setName("");
      setHashtagsText("");
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg(t("hashtagGroups.form.nameRequired"));
      return;
    }

    const parsedHashtags = hashtagsText
      .split(/[\n,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    if (parsedHashtags.length === 0) {
      setErrorMsg(t("hashtagGroups.form.hashtagsRequired"));
      return;
    }

    if (parsedHashtags.length > 50) {
      setErrorMsg(t("hashtagGroups.form.hashtagsMax"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, hashtags: parsedHashtags });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "DUPLICATE_NAME") {
        setErrorMsg(t("hashtagGroups.form.duplicateName"));
      } else {
        setErrorMsg(t("hashtagGroups.saveError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="border-b border-zinc-100 p-4 dark:border-zinc-800">
            <DialogTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Hash className="text-brand-orange size-5" />
              {initialData
                ? t("hashtagGroups.form.editTitle")
                : t("hashtagGroups.form.createTitle")}
            </DialogTitle>
          </DialogHeader>

          {/* Form Content */}
          <div className="space-y-4 p-5 text-left">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Group Name Input (reusing UI Input) */}
            <Input
              label={t("hashtagGroups.form.nameLabel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("hashtagGroups.form.namePlaceholder")}
            />

            {/* Hashtags Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("hashtagGroups.form.hashtagsLabel")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-3xs text-zinc-400">
                  {t("hashtagGroups.form.hashtagsMaxHint")}
                </span>
              </div>
              <Textarea
                rows={4}
                value={hashtagsText}
                onChange={(e) => setHashtagsText(e.target.value)}
                placeholder={t("hashtagGroups.form.hashtagsPlaceholder")}
                className="bg-muted text-foreground focus:ring-brand-orange/20 rounded-xl border-zinc-200 font-mono text-xs dark:border-zinc-700"
              />
              <p className="text-2xs text-zinc-400">
                {t("hashtagGroups.form.hashtagsHelperText")}
              </p>
            </div>
          </div>

          {/* Footer with UI Buttons */}
          <DialogFooter className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t("hashtagGroups.form.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              <Save className="mr-1 size-4" />
              <span>
                {initialData
                  ? t("hashtagGroups.form.update")
                  : t("hashtagGroups.form.createNew")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

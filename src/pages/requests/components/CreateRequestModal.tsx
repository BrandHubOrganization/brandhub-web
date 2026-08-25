import React, { useState } from "react";
import { X, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type {
  CreateContentRequestPayload,
  SocialPlatform,
} from "@/types/contentRequest";

const PLATFORMS: SocialPlatform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
  "YOUTUBE",
];

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: CreateContentRequestPayload) => Promise<void>;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");
  const [clientName, setClientName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [briefNote, setBriefNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTopic("");
    setClientName("");
    setDeadline("");
    setPlatforms([]);
    setBriefNote("");
  };

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !topic.trim() ||
      !clientName.trim() ||
      !deadline ||
      platforms.length === 0
    ) {
      toast.error(t("requests.create.validationError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        topic: topic.trim(),
        clientName: clientName.trim(),
        deadline,
        platforms,
        briefNote: briefNote.trim() || undefined,
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-card border-border max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border p-6 shadow-2xl">
        <div className="border-border flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <FilePlus className="text-brand-orange dark:text-brand-orange/80 size-5" />
            <h3 className="text-foreground text-sm font-semibold">
              {t("requests.create.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.topicLabel")}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("requests.create.topicPlaceholder")}
              className="bg-muted text-foreground focus:ring-brand-orange/20 border-border w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-semibold">
                {t("requests.create.clientLabel")}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("requests.create.clientPlaceholder")}
                className="bg-muted text-foreground focus:ring-brand-orange/20 border-border w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-hidden"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-semibold">
                {t("requests.create.deadlineLabel")}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-muted text-foreground focus:ring-brand-orange/20 border-border w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.platformsLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.briefLabel")}
            </label>
            <textarea
              value={briefNote}
              onChange={(e) => setBriefNote(e.target.value)}
              placeholder={t("requests.create.briefPlaceholder")}
              rows={3}
              className="bg-muted text-foreground focus:ring-brand-orange/20 border-border w-full resize-none rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-hidden"
            />
          </div>

          <div className="border-border flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border-border text-muted-foreground rounded-xl border px-4 py-2 text-xs font-medium"
            >
              {t("requests.create.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {isSubmitting
                ? t("requests.create.submitting")
                : t("requests.create.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

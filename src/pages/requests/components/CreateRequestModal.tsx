import React, { useEffect, useState } from "react";
import { X, FilePlus, Share2, Globe, Video, AtSign, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type {
  CreateContentRequestPayload,
  SocialPlatform,
} from "@/types/contentRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PLATFORMS: { key: SocialPlatform; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: "FACEBOOK",
    label: "Facebook",
    icon: <Share2 className="size-4" />,
    color: "text-blue-500",
  },
  {
    key: "INSTAGRAM",
    label: "Instagram",
    icon: <Globe className="size-4" />,
    color: "text-pink-500",
  },
  {
    key: "TIKTOK",
    label: "TikTok",
    icon: <Video className="size-4" />,
    color: "text-foreground",
  },
  {
    key: "THREADS",
    label: "Threads",
    icon: <AtSign className="size-4" />,
    color: "text-foreground",
  },
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border-border w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-border bg-muted/30 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-orange/10 text-brand-orange flex size-8 items-center justify-center rounded-lg">
              <FilePlus className="size-4" />
            </div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("requests.create.title")}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label={t("requests.detail.close")}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-lg cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.topicLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("requests.create.topicPlaceholder")}
              className="text-xs"
              required
            />
          </div>

          {/* Client & Deadline (2 Columns) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-foreground text-xs font-semibold">
                {t("requests.create.clientLabel")} <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("requests.create.clientPlaceholder")}
                className="text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground text-xs font-semibold">
                {t("requests.create.deadlineLabel")} <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-xs cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Publishing Platforms Cards */}
          <div className="space-y-2">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.platformsLabel")} <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLATFORMS.map(({ key, label, icon, color }) => {
                const isSelected = platforms.includes(key);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => togglePlatform(key)}
                    className={`border-border/80 relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs transition-all ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange/10 font-bold shadow-2xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected && (
                      <span className="bg-brand-orange absolute top-1.5 right-1.5 flex size-3.5 items-center justify-center rounded-full text-white">
                        <Check className="size-2.5" />
                      </span>
                    )}
                    <span className={isSelected ? "text-brand-orange" : color}>
                      {icon}
                    </span>
                    <span className={isSelected ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brief Note */}
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold">
              {t("requests.create.briefLabel")}
            </label>
            <Textarea
              value={briefNote}
              onChange={(e) => setBriefNote(e.target.value)}
              placeholder={t("requests.create.briefPlaceholder")}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="border-border/80 flex items-center justify-end gap-2.5 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              {t("requests.create.cancel")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              <Sparkles className="size-3.5 mr-1" />
              {isSubmitting
                ? t("requests.create.submitting")
                : t("requests.create.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

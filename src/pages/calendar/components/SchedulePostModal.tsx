import React, { useState } from "react";
import type { CalendarPostEvent } from "@/types/calendar";
import type { PlatformType } from "@/types/calendar";
import { Calendar as CalendarIcon, Eye, X } from "lucide-react";
import { PlatformPreviewModal } from "@/pages/editor/components/PlatformPreviewModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface SchedulePostModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSubmit: (postData: Partial<CalendarPostEvent>) => void;
}

export const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  isOpen,
  selectedDate,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("FACEBOOK");
  const [time, setTime] = useState("09:00");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const formattedDateStr = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const scheduledDateTime = new Date(
      `${formattedDateStr}T${time}:00`,
    ).toISOString();

    onSubmit({
      title,
      start: scheduledDateTime,
      extendedProps: {
        platform,
        status: "SCHEDULED",
        captionPreview: caption || title,
      },
    });

    // Reset & Close
    setTitle("");
    setCaption("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-brand-orange size-5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t("calendar.schedule.title")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t("calendar.schedule.postTitleLabel")}
              </label>
              <Input
                type="text"
                required
                placeholder={t("calendar.schedule.postTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("calendar.schedule.captionPreviewLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-brand-orange flex cursor-pointer items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Eye className="size-3.5" />
                  {t("calendar.schedule.previewMockupButton")}
                </button>
              </div>
              <Textarea
                rows={3}
                placeholder={t("calendar.schedule.captionPlaceholder")}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="rounded-lg border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("calendar.schedule.platformLabel")}
                </label>
                <Select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="rounded-lg border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="THREADS">Threads</option>
                  <option value="YOUTUBE">Youtube</option>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("calendar.schedule.scheduledTimeLabel")}
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-lg border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("calendar.schedule.cancel")}
              </button>
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-white shadow-xs"
              >
                {t("calendar.schedule.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <PlatformPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title,
          caption:
            caption || title || t("calendar.schedule.captionPlaceholder"),
          targetPlatforms: [
            platform,
            "FACEBOOK",
            "INSTAGRAM",
            "TIKTOK",
            "THREADS",
            "YOUTUBE",
          ].filter((v, i, a) => a.indexOf(v) === i) as PlatformType[],
        }}
      />
    </>
  );
};

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
  const [recurrence, setRecurrence] = useState("none");
  const [repeatUntil, setRepeatUntil] = useState("");
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
        <div className="animate-in fade-in zoom-in-95 border-border bg-card max-h-[90vh] w-full max-w-md space-y-5 overflow-y-auto rounded-xl border p-6 shadow-2xl duration-200">
          <div className="border-border flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-brand-orange size-5" />
              <h3 className="text-foreground text-lg font-semibold">
                {t("calendar.schedule.title")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("calendar.schedule.postTitleLabel")}
              </label>
              <Input
                type="text"
                required
                placeholder={t("calendar.schedule.postTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-card text-foreground rounded-lg text-sm"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-muted-foreground block text-xs font-medium">
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
                className="border-border bg-card text-foreground rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("calendar.schedule.platformLabel")}
                </label>
                <Select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="border-border bg-card text-foreground rounded-lg text-sm"
                >
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="THREADS">Threads</option>
                  <option value="YOUTUBE">Youtube</option>
                </Select>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  {t("calendar.schedule.scheduledTimeLabel")}
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-border bg-card text-foreground rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-border rounded-lg border p-3">
              <label className="text-muted-foreground mb-2 block text-xs font-medium">
                {t("calendar.schedule.recurrenceLabel")}
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <Select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="border-border bg-card text-foreground rounded-lg text-sm"
                >
                  <option value="none">
                    {t("calendar.schedule.recurrence.none")}
                  </option>
                  <option value="daily">
                    {t("calendar.schedule.recurrence.daily")}
                  </option>
                  <option value="weekly">
                    {t("calendar.schedule.recurrence.weekly")}
                  </option>
                  <option value="monthly">
                    {t("calendar.schedule.recurrence.monthly")}
                  </option>
                </Select>
                {recurrence !== "none" && (
                  <div className="flex items-center gap-2">
                    <label className="text-muted-foreground text-xs">
                      {t("calendar.schedule.recurrence.until")}
                    </label>
                    <Input
                      type="date"
                      value={repeatUntil}
                      onChange={(e) => setRepeatUntil(e.target.value)}
                      className="border-border bg-card text-foreground rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={onClose}
                className="border-border text-muted-foreground hover:bg-muted cursor-pointer rounded-lg border px-4 py-2 text-xs font-medium"
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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ScheduleModalProps {
  isOpen: boolean;
  initialScheduledAt?: string;
  onClose: () => void;
  onSaveSchedule: (dateIso: string) => Promise<void> | void;
}

export function ScheduleModal({
  isOpen,
  initialScheduledAt,
  onClose,
  onSaveSchedule,
}: ScheduleModalProps) {
  const { t } = useTranslation();

  // Mặc định chọn thời điểm hiện tại + 2 giờ nếu chưa có lịch
  const getInitialDateTime = () => {
    if (initialScheduledAt) {
      const d = new Date(initialScheduledAt);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      };
    }
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      date: `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`,
      time: `${pad(future.getHours())}:${pad(future.getMinutes())}`,
    };
  };

  const initial = getInitialDateTime();
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!date || !time) {
      toast.error("Vui lòng chọn đầy đủ ngày và giờ xuất bản!");
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);
    const now = new Date();

    // VALIDATION: Không cho phép dời/đặt lịch vào quá khứ (yêu cầu của user)
    if (scheduledDate.getTime() <= now.getTime()) {
      toast.error(
        "Thời gian lên lịch xuất bản không thể ở trong quá khứ! Vui lòng chọn thời gian ở tương lai.",
      );
      return;
    }

    // Tối thiểu cách thời điểm hiện tại 5 phút
    if (scheduledDate.getTime() - now.getTime() < 5 * 60 * 1000) {
      toast.error(
        "Thời gian lên lịch xuất bản nên cách hiện tại ít nhất 5 phút để hệ thống xử lý.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveSchedule(scheduledDate.toISOString());
      toast.success(
        `Đã lên lịch đăng tự động vào lúc ${scheduledDate.toLocaleTimeString(
          "vi-VN",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )} ngày ${scheduledDate.toLocaleDateString("vi-VN")}`,
      );
      onClose();
    } catch {
      toast.error("Không thể lưu lịch đăng bài!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-2">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Lên lịch đăng bài tự động
              </DialogTitle>
              <DialogDescription className="text-xs">
                Chọn ngày và giờ để hệ thống tự động xuất bản bài viết lên các
                mạng xã hội đã chọn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-medium">
              Ngày xuất bản (Publish Date)
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="border-border bg-card text-foreground focus:border-brand-orange focus:ring-brand-orange/20 h-10 w-full rounded-xl border px-3 text-sm transition-all focus:ring-2 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-medium">
              Giờ xuất bản (Giờ : Phút)
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-border bg-card text-foreground focus:border-brand-orange focus:ring-brand-orange/20 h-10 w-full rounded-xl border px-3 text-sm transition-all focus:ring-2 focus:outline-hidden"
              />
              <Clock className="text-muted-foreground pointer-events-none absolute top-3 right-3 size-4" />
            </div>
          </div>

          <div className="border-brand-orange/20 bg-brand-orange-soft/40 text-brand-orange rounded-xl border p-3 text-xs">
            <p className="font-medium">Quy tắc xuất bản tự động:</p>
            <ul className="text-muted-foreground mt-1 list-inside list-disc space-y-0.5">
              <li>Thời gian hẹn giờ phải ở tương lai.</li>
              <li>
                Hệ thống worker chạy ngầm định kỳ quét và đăng bài tự động đúng
                giờ.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel", "Huỷ")}
          </Button>
          <Button
            variant="orange"
            onClick={handleConfirm}
            loading={isSubmitting}
          >
            Xác nhận lên lịch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  Mail,
  Send,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notificationStore";

interface ModerationNotifyAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorName: string;
  authorEmail: string;
  reason?: string;
  source?: string;
}

export function ModerationNotifyAuthorDialog({
  open,
  onOpenChange,
  authorName,
  authorEmail,
  reason,
  source,
}: ModerationNotifyAuthorDialogProps) {
  const { t } = useTranslation();
  const [sendEmail, setSendEmail] = useState(true);
  const [sendBell, setSendBell] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const resolvedReason =
    reason?.trim() ||
    (source ? t(`admin.moderation.sources.${source}`, { defaultValue: "" }) : "") ||
    t("admin.moderation.notifyNoReason");

  useEffect(() => {
    if (open) {
      setSendEmail(true);
      setSendBell(true);
      setTitle(t("admin.moderation.notifyDefaultTitle"));
      setMessage(
        t("admin.moderation.notifyDefaultMessage", {
          authorName,
          reason: resolvedReason,
        }),
      );
    }
  }, [open, authorName, resolvedReason, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sendEmail && !sendBell) {
      toast.error(t("admin.moderation.notifyAtLeastOneChannel"));
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      toast.error(t("admin.moderation.notifyFieldsRequired"));
      return;
    }

    if (sendBell) {
      useNotificationStore.getState().addNotification({
        id: crypto.randomUUID(),
        title: trimmedTitle,
        message: trimmedMessage,
        read: false,
      });
    }

    if (sendEmail && sendBell) {
      toast.success(t("admin.moderation.notifySuccessBoth"));
    } else if (sendEmail) {
      toast.success(t("admin.moderation.notifySuccessEmail"));
    } else {
      toast.success(t("admin.moderation.notifySuccessBell"));
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange-soft text-brand-orange grid size-9 shrink-0 place-items-center rounded-lg">
              <BellRing className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {t("admin.moderation.notifyDialogTitle")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                {t("admin.moderation.notifyDialogDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Thông tin tác giả & Lý do */}
          <section className="bg-muted/40 border-border rounded-xl border p-3.5 text-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium">
                {t("admin.moderation.notifyAuthorInfo")}:
              </span>
              <span className="font-semibold text-foreground truncate">
                {authorName}{" "}
                <span className="text-muted-foreground font-normal font-sans">
                  ({authorEmail})
                </span>
              </span>
            </div>
            <div className="border-border/60 border-t pt-2 flex items-start gap-2">
              <AlertTriangle className="text-brand-orange size-3.5 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-muted-foreground font-medium block">
                  {t("admin.moderation.notifyReasonLabel")}:
                </span>
                <p className="text-foreground mt-0.5 leading-relaxed break-words">
                  {resolvedReason}
                </p>
              </div>
            </div>
          </section>

          {/* Phương thức gửi thông báo */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-foreground">
              {t("admin.moderation.notifyChannelsLabel")} *
            </legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors select-none",
                  sendEmail
                    ? "border-brand-orange/60 bg-brand-orange-soft/40 dark:bg-brand-orange-soft/20"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="accent-brand-orange mt-0.5 size-4 rounded"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                    <Mail className="size-3.5 text-brand-orange" />
                    <span>{t("admin.moderation.notifyViaEmail")}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-tight">
                    {t("admin.moderation.notifyViaEmailDesc", {
                      email: authorEmail,
                    })}
                  </p>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors select-none",
                  sendBell
                    ? "border-brand-orange/60 bg-brand-orange-soft/40 dark:bg-brand-orange-soft/20"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={sendBell}
                  onChange={(e) => setSendBell(e.target.checked)}
                  className="accent-brand-orange mt-0.5 size-4 rounded"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                    <Bell className="size-3.5 text-brand-orange" />
                    <span>{t("admin.moderation.notifyViaBell")}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-tight">
                    {t("admin.moderation.notifyViaBellDesc")}
                  </p>
                </div>
              </label>
            </div>
            {!sendEmail && !sendBell && (
              <p role="alert" className="text-destructive text-xs">
                {t("admin.moderation.notifyAtLeastOneChannel")}
              </p>
            )}
          </fieldset>

          {/* Form Tiêu đề & Nội dung */}
          <div className="space-y-3">
            <label className="block space-y-1.5 text-xs font-medium text-foreground">
              <span>{t("admin.moderation.notifyTitleLabel")} *</span>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("admin.moderation.notifyTitlePlaceholder")}
                className="text-xs h-9"
                required
              />
            </label>

            <label className="block space-y-1.5 text-xs font-medium text-foreground">
              <span>{t("admin.moderation.notifyMessageLabel")} *</span>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("admin.moderation.notifyMessagePlaceholder")}
                rows={4}
                className="text-xs leading-relaxed resize-y"
                required
              />
            </label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t("admin.moderation.notifyCancelAction")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              size="sm"
              className="gap-1.5"
              disabled={(!sendEmail && !sendBell) || !title.trim() || !message.trim()}
            >
              <Send className="size-3.5" />
              {t("admin.moderation.notifySendAction")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

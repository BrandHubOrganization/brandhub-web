import React, { useState } from "react";
import { X, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentRequest } from "@/types/contentRequest";

interface CancelRequestDialogProps {
  request: ContentRequest | null;
  onClose: () => void;
  onConfirm: (requestId: string, reason?: string) => Promise<void>;
}

export const CancelRequestDialog: React.FC<CancelRequestDialogProps> = ({
  request,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(request.id, reason.trim() || undefined);
      setReason("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-card border-border w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="size-5 text-rose-500" />
            <h3 className="text-foreground text-sm font-semibold">
              {t("requests.cancelDialog.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-muted-foreground text-xs">
          {t("requests.cancelDialog.description", { topic: request.topic })}
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("requests.cancelDialog.reasonPlaceholder")}
          rows={2}
          className="bg-muted text-foreground focus:ring-brand-orange/20 border-border w-full resize-none rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-hidden"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-border text-muted-foreground rounded-xl border px-4 py-2 text-xs font-medium"
          >
            {t("requests.cancelDialog.cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {t("requests.cancelDialog.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

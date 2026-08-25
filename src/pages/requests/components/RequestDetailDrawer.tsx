import React from "react";
import { X, FileEdit, Ban, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentRequest } from "@/types/contentRequest";

interface RequestDetailDrawerProps {
  request: ContentRequest | null;
  onClose: () => void;
  onRevise: (request: ContentRequest) => void;
  onCancel: (request: ContentRequest) => void;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  request,
  onClose,
  onRevise,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!request) return null;

  const history = request.statusHistory ?? [];
  const canModify =
    request.status !== "APPROVED" &&
    request.status !== "REJECTED" &&
    request.status !== "CANCELLED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-card border-border flex h-full w-full max-w-md flex-col border-l shadow-2xl">
        <div className="border-border flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2">
            <Clock className="text-brand-orange dark:text-brand-orange/80 size-5" />
            <h3 className="text-foreground text-sm font-semibold">
              {t("requests.detail.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <h4 className="text-foreground text-sm font-semibold">
              {request.topic}
            </h4>
            <p className="text-muted-foreground mt-1 text-xs">
              {request.clientName} · {t("requests.table.deadlineLabel")}:{" "}
              {request.deadline}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {request.platforms.map((p) => (
                <span
                  key={p}
                  className="text-3xs bg-muted text-muted-foreground rounded-lg px-2 py-0.5 font-mono font-bold"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {request.briefNote && (
            <div>
              <h5 className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
                {t("requests.detail.briefLabel")}
              </h5>
              <p className="text-foreground mt-1 text-xs">
                {request.briefNote}
              </p>
            </div>
          )}

          <div>
            <h5 className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("requests.detail.statusHistoryTitle")}
            </h5>
            <ol className="border-border mt-3 space-y-4 border-l pl-4">
              {history.map((entry, i) => (
                <li key={i} className="relative">
                  <span className="bg-brand-orange absolute top-1 -left-[21px] size-2.5 rounded-full" />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs font-semibold">
                      {t(`requests.status.${entry.status}`)}
                    </span>
                    <span className="text-muted-foreground text-3xs">
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-3xs mt-0.5">
                    {entry.changedBy}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {canModify && (
          <div className="border-border flex gap-2 border-t p-5">
            <button
              onClick={() => onRevise(request)}
              className="border-border text-foreground hover:bg-muted flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium"
            >
              <FileEdit className="size-3.5" />
              {t("requests.detail.reviseButton")}
            </button>
            <button
              onClick={() => onCancel(request)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-300 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
            >
              <Ban className="size-3.5" />
              {t("requests.detail.cancelButton")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

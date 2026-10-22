import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Layers,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestPage } from "@/pages/requests/types/workspaceRequest";

function getRequestStatusConfig(status: string) {
  switch (status) {
    case "PENDING":
      return {
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        icon: Clock,
      };
    case "ACCEPTED":
      return {
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      };
    case "DENIED":
    case "CANCELLED":
      return {
        className:
          "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
        icon: XCircle,
      };
    case "IN_PROGRESS":
      return {
        className:
          "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        icon: PlayCircle,
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-border",
        icon: AlertCircle,
      };
  }
}

export function WorkspaceRequestList({
  result,
  onSelect,
  onPage,
}: {
  result: RequestPage;
  onSelect: (id: string) => void;
  onPage: (page: number) => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <section className="space-y-4" aria-label={t("requests.v2.title")}>
      {!result.items.length ? (
        <div className="bg-card rounded-2xl border border-border/80 p-10 text-center shadow-xs">
          <FileText
            aria-hidden="true"
            className="text-muted-foreground/60 mx-auto mb-3 size-10"
          />
          <h2 className="font-semibold text-foreground text-base">
            {t("requests.v2.empty")}
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm max-w-sm mx-auto">
            {t("requests.v2.emptyHelp")}
          </p>
        </div>
      ) : (
        <div className="bg-card divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/80 shadow-xs">
          {result.items.map((request) => {
            const statusConfig = getRequestStatusConfig(request.status);
            const StatusIcon = statusConfig.icon;
            const formattedDueDate = new Date(request.dueDate).toLocaleDateString(
              i18n.language,
              { year: "numeric", month: "short", day: "numeric" },
            );

            return (
              <div
                key={request.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <button
                    type="button"
                    className="font-semibold text-foreground text-sm text-left hover:text-brand-orange transition-colors break-words line-clamp-2"
                    onClick={() => onSelect(request.id)}
                  >
                    {request.title}
                  </button>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 py-0.5 px-2 text-2xs font-medium",
                        statusConfig.className,
                      )}
                    >
                      <StatusIcon className="size-3 shrink-0" />
                      <span>{t(`requests.v2.status.${request.status}`)}</span>
                    </Badge>

                    <Badge
                      variant="secondary"
                      className="gap-1 py-0.5 px-2 text-2xs font-normal"
                    >
                      <Layers className="size-2.5 opacity-70" />
                      <span>{t(`requests.v2.types.${request.type}`)}</span>
                    </Badge>

                    <span className="text-muted-foreground flex items-center gap-1 text-2xs">
                      <Calendar className="size-3 opacity-70" />
                      <span>
                        {t("requests.v2.due", { date: formattedDueDate })}
                      </span>
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 self-start sm:self-center shrink-0"
                  onClick={() => onSelect(request.id)}
                >
                  <span>{t("requests.v2.detail")}</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-muted-foreground text-xs">
          {t("requests.v2.count", { count: result.total })}
        </p>
        <nav
          className="flex items-center gap-2"
          aria-label={t("requests.v2.pagination")}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={result.page === 0}
            onClick={() => onPage(result.page - 1)}
          >
            {t("requests.v2.previous")}
          </Button>
          <span className="text-xs text-muted-foreground px-1">
            {t("requests.v2.page", {
              page: result.page + 1,
              total: Math.max(1, result.totalPages),
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page + 1 >= result.totalPages}
            onClick={() => onPage(result.page + 1)}
          >
            {t("requests.v2.next")}
          </Button>
        </nav>
      </div>
    </section>
  );
}

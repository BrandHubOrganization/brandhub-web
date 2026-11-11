import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Contact2,
  RotateCcw,
  SearchX,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import type { useDirectory } from "../hooks/useDirectory";
import { PartnerList } from "./PartnerList";
import type { DirectoryPartner } from "../types";

function DirectorySkeleton() {
  return (
    <div className="border-border/70 bg-card divide-border/30 divide-y overflow-hidden rounded-2xl border shadow-xs">
      <div className="bg-muted/60 border-border/40 border-b px-4 py-2">
        <Skeleton className="h-4 w-16" />
      </div>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="max-w-md flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface DirectoryResultsProps {
  state: ReturnType<typeof useDirectory>;
  onDetail: (partner: DirectoryPartner) => void;
  onEdit: (partner: DirectoryPartner) => void;
  onAction: (partner: DirectoryPartner, kind: "delete" | "deactivate") => void;
}

export function DirectoryResults({
  state,
  onDetail,
  onEdit,
  onAction,
}: DirectoryResultsProps) {
  const { t } = useTranslation();

  if (state.loading) {
    return <DirectorySkeleton />;
  }

  if (state.error) {
    return (
      <div
        role="alert"
        className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 text-center shadow-2xs sm:flex-row sm:text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">
              {t("collaborators.loadError")}
            </h4>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("collaborators.error")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={state.reload}
          className="shrink-0 cursor-pointer transition-all active:scale-[0.97]"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          {t("collaborators.reload")}
        </Button>
      </div>
    );
  }

  if (!state.data) return null;

  const hasActiveFilters = Boolean(
    state.search || state.active !== "all" || state.type,
  );

  if (state.data.totalElements === 0 || state.data.content.length === 0) {
    return (
      <div className="border-border/70 bg-card flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-2xs">
        {hasActiveFilters ? (
          <>
            <div className="bg-brand-orange/10 text-brand-orange mb-4 flex size-12 items-center justify-center rounded-2xl">
              <SearchX aria-hidden="true" className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {t("collaborators.emptyFilteredTitle")}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm">
              {t("collaborators.empty")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                state.setSearch("");
                state.setActive("all");
                state.setType("");
              }}
              className="mt-5 cursor-pointer rounded-xl text-xs transition-all active:scale-[0.97]"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              {t("collaborators.resetFilters")}
            </Button>
          </>
        ) : (
          <>
            <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-2xl">
              <Contact2 aria-hidden="true" className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {t("collaborators.emptyTitle")}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm">
              {t("collaborators.emptyHelp")}
            </p>
            <Button
              variant="orange"
              size="sm"
              onClick={state.loadDemoData}
              className="mt-5 cursor-pointer gap-1.5 rounded-xl text-xs shadow-xs transition-all active:scale-[0.97]"
            >
              <Sparkles className="size-3.5" />
              <span>{t("collaborators.loadDemoData")}</span>
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.isDemo && (
        <div className="text-2xs text-brand-orange bg-brand-orange/10 border-brand-orange/20 flex items-center justify-between rounded-xl border px-3.5 py-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 shrink-0" />
            <span>Đang xem danh bạ đối tác mẫu A–Z (Demo)</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={state.reload}
            className="text-2xs text-muted-foreground hover:text-foreground h-6 cursor-pointer px-2"
          >
            Quay về danh bạ thực tế
          </Button>
        </div>
      )}
      <PartnerList
        partners={state.data.content}
        busy={state.busy}
        onDetail={onDetail}
        onEdit={onEdit}
        onAction={onAction}
      />
      <Pagination
        page={state.page + 1}
        totalPages={state.data.totalPages}
        total={state.data.totalElements}
        size={state.data.size}
        isFetching={state.busy}
        onPageChange={(page) => state.setPage(page - 1)}
        itemLabel={t("collaborators.title").toLowerCase()}
      />
    </div>
  );
}

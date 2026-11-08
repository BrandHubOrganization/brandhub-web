import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Folder, X, ArrowLeft, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { materialService } from "@/services/materialService";
import { MaterialThumbnail } from "@/pages/library/components/MaterialThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaterialItem } from "@/types/material";

export function ChatRepositoryPicker({
  workspaceId,
  remaining,
  onSelect,
  onClose,
}: {
  workspaceId: string;
  remaining: number;
  onSelect: (item: MaterialItem) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [folder, setFolder] = useState<string | undefined>();
  const [selected, setSelected] = useState<MaterialItem[]>([]);
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: [
      "chat-repository-picker",
      actor,
      workspaceId,
      folder,
      page,
      search,
    ],
    queryFn: ({ signal }) =>
      materialService.browse(
        workspaceId,
        { page, size: 12, search, deleted: false, folderId: folder },
        signal,
      ),
    retry: false,
  });
  const files = query.data?.files;
  const choose = async () => {
    setBusy(true);
    try {
      for (const material of selected) await onSelect(material);
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) {
          event.stopPropagation();
          onClose();
        }
      }}
      className="bg-popover text-popover-foreground flex max-h-[min(640px,70dvh,var(--radix-popover-content-available-height))] flex-col overflow-hidden"
    >
      <header className="flex items-center justify-between gap-2 border-b p-3">
        <h3 className="text-sm font-semibold">
          {t("chat.attachments.repository")}
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          disabled={busy}
          onClick={onClose}
          aria-label={t("chat.actions.close")}
        >
          <X className="size-4" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center gap-1 text-xs">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            disabled={!folder || busy}
            aria-label={t("chat.attachments.back")}
            onClick={() => {
              setFolder(query.data?.currentFolder?.parentFolderId ?? undefined);
              setPage(0);
            }}
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <span className="truncate">
            {query.data?.currentFolder?.name ?? t("chat.attachments.root")}
          </span>
        </div>
        <div className="relative mb-3">
          <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
          <Input
            autoFocus
            className="pl-9"
            value={search}
            placeholder={t("chat.attachments.search")}
            aria-label={t("chat.attachments.search")}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        {query.isPending ? (
          <div
            className="grid grid-cols-2 gap-2"
            role="status"
            aria-label={t("chat.attachments.loading")}
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : query.isError ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>{t("chat.attachments.repositoryError")}</p>
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {t("chat.actions.retry")}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap gap-2">
              {query.data?.folders.map((item) => (
                <Button
                  key={item.id}
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setFolder(item.id);
                    setPage(0);
                  }}
                >
                  <Folder className="size-3.5" />
                  <span className="max-w-40 truncate">{item.name}</span>
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {files?.items.map((item) => {
                const checked = selected.some((value) => value.id === item.id);
                const disabled =
                  busy ||
                  item.status !== "READY" ||
                  (!checked && selected.length >= remaining);
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={checked}
                    disabled={disabled}
                    onClick={() =>
                      setSelected((values) =>
                        checked
                          ? values.filter((value) => value.id !== item.id)
                          : [...values, item],
                      )
                    }
                    className={`min-w-0 rounded-lg border p-2 text-left disabled:opacity-50 ${checked ? "border-brand-orange bg-brand-orange-soft ring-brand-orange/30 ring-1" : "border-border"}`}
                  >
                    <MaterialThumbnail material={item} />
                    <span className="mt-1 block truncate text-xs font-medium">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      {t("chat.attachments.version", {
                        version: item.currentVersionNumber ?? 1,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
            {!files?.items.length && !query.data?.folders.length && (
              <p className="text-muted-foreground py-4 text-sm">
                {t("chat.attachments.empty")}
              </p>
            )}
            <div className="mt-3 flex justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0 || busy}
                onClick={() => setPage((value) => value - 1)}
              >
                {t("chat.attachments.previous")}
              </Button>
              <span className="text-muted-foreground self-center text-xs">
                {page + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!files || (page + 1) * 12 >= files.meta.total || busy}
                onClick={() => setPage((value) => value + 1)}
              >
                {t("chat.attachments.next")}
              </Button>
            </div>
          </>
        )}
      </div>
      <footer className="flex items-center justify-between gap-2 border-t p-3">
        <span className="text-muted-foreground text-xs">
          {t("chat.attachments.selected", { count: selected.length })}
        </span>
        <Button
          variant="orange"
          size="sm"
          loading={busy}
          disabled={!selected.length || selected.length > remaining || busy}
          onClick={() => void choose()}
        >
          {t("chat.attachments.attach")}
        </Button>
      </footer>
    </section>
  );
}

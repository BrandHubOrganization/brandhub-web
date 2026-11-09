import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import { CrawlerCredentialCard } from "@/pages/admin/components/CrawlerCredentialCard";
import { Button } from "@/components/ui/button";
import type {
  CredentialKind,
  CredentialMetadata,
} from "@/pages/admin/types/crawlerManagement";

export function isCredentialStorageReady(
  kind: CredentialKind,
  storageReady?: boolean,
  sessionStorage: string = "memory",
): boolean {
  return (
    Boolean(storageReady) ||
    (sessionStorage === "memory" &&
      (kind === "facebook" || kind === "threads" || kind === "proxy"))
  );
}

const DEFAULT_SESSION_ITEMS: CredentialMetadata[] = [
  {
    kind: "facebook",
    revision: 0,
    version: null,
    configured: false,
    updatedAt: null,
    checkedAt: null,
    status: "MISSING",
    probeCode: null,
  },
  {
    kind: "threads",
    revision: 0,
    version: null,
    configured: false,
    updatedAt: null,
    checkedAt: null,
    status: "MISSING",
    probeCode: null,
  },
  {
    kind: "tiktok",
    revision: 0,
    version: null,
    configured: false,
    updatedAt: null,
    checkedAt: null,
    status: "MISSING",
    probeCode: null,
  },
  {
    kind: "proxy",
    revision: 0,
    version: null,
    configured: false,
    updatedAt: null,
    checkedAt: null,
    status: "MISSING",
    probeCode: null,
  },
];

export function CrawlerCredentialsPanel({
  filter = "all",
  hideHeader = false,
  columns = 2,
}: {
  filter?: "all" | "session" | "connection";
  hideHeader?: boolean;
  columns?: 1 | 2;
} = {}) {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["admin", "crawler-credentials"],
    queryFn: ({ signal }) => service.credentials(signal),
    retry: false,
  });

  const rawItems = query.data?.items ?? [];
  const itemsToRender =
    filter === "session" || filter === "all"
      ? DEFAULT_SESSION_ITEMS.map(
          (fallback) =>
            rawItems.find((i) => i.kind === fallback.kind) ?? fallback,
        )
      : rawItems.filter(
          (i) =>
            i.kind !== "facebook" &&
            i.kind !== "threads" &&
            i.kind !== "tiktok" &&
            i.kind !== "proxy",
        );

  return (
    <section className="space-y-4" aria-labelledby="crawler-credentials-title">
      {!hideHeader && (
        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-xs">
          <div className="min-w-0 flex-1 space-y-1">
            <h2
              id="crawler-credentials-title"
              className="text-sm font-semibold"
            >
              {t("admin.crawler.credentialsTitle")}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("admin.crawler.credentialsHelp")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {t("admin.crawler.refresh")}
          </Button>
        </div>
      )}
      {query.isPending && filter !== "session" && (
        <p role="status">{t("admin.loading")}</p>
      )}
      {query.isError && filter !== "session" && (
        <p role="alert">{t("admin.crawler.loadError")}</p>
      )}
      {(query.data || filter === "session") && (
        <>
          {!hideHeader && query.data?.sessionStorage === "memory" && (
            <p
              role="status"
              className="text-muted-foreground bg-muted/40 border-border/60 rounded-lg border px-3.5 py-2.5 text-xs"
            >
              {t("admin.crawler.sessionMemoryHelp")}
            </p>
          )}
          {!hideHeader &&
            query.data &&
            !query.data.storageReady &&
            query.data.sessionStorage !== "memory" && (
              <p role="alert" className="text-destructive text-sm">
                {t("admin.crawler.codes.SECRET_STORAGE_UNAVAILABLE")}
              </p>
            )}
          <div
            className={
              columns === 1
                ? "grid grid-cols-1 items-stretch gap-2.5"
                : "grid items-stretch gap-4 lg:grid-cols-2"
            }
          >
            {itemsToRender.map((item) => (
              <CrawlerCredentialCard
                key={item.kind}
                item={item}
                storageReady={isCredentialStorageReady(
                  item.kind,
                  query.data?.storageReady,
                  query.data?.sessionStorage ?? "memory",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import { CrawlerCredentialCard } from "@/pages/admin/components/CrawlerCredentialCard";
import { Button } from "@/components/ui/button";

export function CrawlerCredentialsPanel() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["admin", "crawler-credentials"],
    queryFn: ({ signal }) => service.credentials(signal),
    retry: false,
  });
  return (
    <section className="space-y-3" aria-labelledby="crawler-credentials-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="crawler-credentials-title" className="font-semibold">
          {t("admin.crawler.credentialsTitle")}
        </h2>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {t("admin.crawler.refresh")}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        {t("admin.crawler.credentialsHelp")}
      </p>
      {query.isPending && <p role="status">{t("admin.loading")}</p>}
      {query.isError && <p role="alert">{t("admin.crawler.loadError")}</p>}
      {query.data && (
        <>
          {query.data.sessionStorage === "memory" && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("admin.crawler.sessionMemoryHelp")}
            </p>
          )}
          {!query.data.storageReady &&
            query.data.sessionStorage !== "memory" && (
              <p role="alert" className="text-destructive">
                {t("admin.crawler.codes.SECRET_STORAGE_UNAVAILABLE")}
              </p>
            )}
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {query.data.items.map((item) => (
              <CrawlerCredentialCard
                key={item.kind}
                item={item}
                storageReady={
                  query.data.storageReady ||
                  (query.data.sessionStorage === "memory" &&
                    (item.kind === "facebook" || item.kind === "threads"))
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

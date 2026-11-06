import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useTrendSettings } from "@/pages/admin/hooks/useTrendSettings";
import { AdminTrendSettingsForm } from "@/pages/admin/components/AdminTrendSettingsForm";

export function AdminTrendSettings() {
  const { t } = useTranslation();
  const { query, mutation } = useTrendSettings();
  const [generation, setGeneration] = useState(0);
  const code = isAxiosError<{ error?: { code?: string } }>(mutation.error)
    ? mutation.error.response?.data?.error?.code
    : undefined;
  const stale = code === "TREND_PIPELINE_CONFIG_STALE";

  return (
    <section
      className="min-w-0 space-y-4"
      aria-label={t("admin.trendSettings.title")}
    >
      {query.isPending && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("admin.loading")}
        </p>
      )}
      {(query.isError || mutation.isError) && (
        <div
          role="alert"
          className="border-destructive/30 bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 text-sm"
        >
          <p className="text-destructive">
            {t(
              stale
                ? "admin.trendSourceConfig.stale"
                : code === "TREND_PIPELINE_CONFIG_INVALID"
                  ? "admin.trendSettings.invalid"
                  : "admin.trendSettings.error",
            )}
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={query.isFetching || mutation.isPending}
            onClick={() => {
              void query.refetch().then((result) => {
                if (result.isSuccess) {
                  mutation.reset();
                  setGeneration((n) => n + 1);
                }
              });
            }}
          >
            {t("admin.trendSourceConfig.reload")}
          </Button>
        </div>
      )}
      {mutation.isSuccess && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          {t("admin.trendSourceConfig.saved")}
        </p>
      )}
      {query.data && (
        <AdminTrendSettingsForm
          key={query.data.revision + ":" + generation}
          config={query.data}
          pending={mutation.isPending || query.isFetching}
          stale={stale}
          onSave={mutation.mutateAsync}
        />
      )}
    </section>
  );
}

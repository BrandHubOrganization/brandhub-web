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
      className="border-border bg-card min-w-0 space-y-4 rounded-xl border p-4"
      aria-label={t("admin.trendSettings.title")}
    >
      <div className="space-y-1">
        <h2 className="font-semibold">{t("admin.trendSettings.title")}</h2>
        <p className="text-muted-foreground text-xs">
          {t("admin.trendSettings.appliesNext")}
        </p>
      </div>
      {query.isPending && <p role="status">{t("admin.loading")}</p>}
      {(query.isError || mutation.isError) && (
        <div
          role="alert"
          className="border-destructive/30 space-y-2 rounded-lg border p-3 text-sm"
        >
          <p>
            {t(
              stale
                ? "admin.trendSourceConfig.stale"
                : code === "TREND_PIPELINE_CONFIG_INVALID"
                  ? "admin.trendSettings.invalid"
                  : "admin.trendSettings.error",
            )}
          </p>
          <Button
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
        <p role="status" className="text-sm">
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

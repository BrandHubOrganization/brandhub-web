import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleDashed, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductVideoController } from "@/pages/product-video/hooks/useProductVideo";

export function ProductionProgress({
  controller: c,
}: {
  controller: ProductVideoController;
}) {
  const { t, i18n } = useTranslation();
  const p = c.production;
  if (!p || c.editable) return null;
  const number = new Intl.NumberFormat(i18n.language);
  return (
    <section
      className="border-border bg-card space-y-4 rounded-xl border p-4 md:p-6"
      aria-label={t("productVideo.progress")}
    >
      <h2 className="text-lg font-semibold">{t("productVideo.progress")}</h2>
      <p role="status" aria-live="polite" className="font-medium">
        {t(`productVideo.states.${p.state}`)}
      </p>
      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
        <span>
          {t("productVideo.held", {
            amount: number.format(p.creditsHeld ?? 0),
          })}
        </span>
        <span>
          {t("productVideo.charged", {
            amount: number.format(p.creditsCharged ?? 0),
          })}
        </span>
      </div>
      {p.state === "RECONCILIATION_REQUIRED" && (
        <p className="bg-muted rounded-lg p-3 text-sm">
          {t("productVideo.unknownHelp")}
        </p>
      )}
      {p.scenes.map((scene, index) => (
        <div
          key={scene.sceneId}
          className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3"
        >
          <div className="flex items-center gap-2">
            {scene.status === "COMPLETED" ? (
              <CheckCircle2 className="text-brand-orange size-4" />
            ) : (
              <CircleDashed className="text-muted-foreground size-4" />
            )}
            <span className="text-sm">
              {t("productVideo.scene", { number: index + 1 })} ·{" "}
              {t(`productVideo.sceneStates.${scene.status ?? "PENDING"}`, {
                defaultValue: t("productVideo.sceneStates.PENDING"),
              })}
            </span>
          </div>
          {scene.canRetry && (
            <Button
              variant="outline"
              size="sm"
              disabled={c.busy}
              onClick={() => void c.getRetryQuote(scene.sceneId)}
            >
              {t("productVideo.getRetryQuote")}
            </Button>
          )}
        </div>
      ))}
      {c.retryQuote && (
        <div className="border-border bg-muted space-y-3 rounded-lg border p-4">
          <p className="font-medium">
            {t("productVideo.retryCost", {
              amount: number.format(c.retryQuote.quote.totalCredits),
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {t("productVideo.retryHelp")}
          </p>
          <Button
            variant="orange"
            disabled={c.busy}
            loading={c.busy}
            onClick={() => void c.retryScene()}
          >
            {t("productVideo.approveRetry")}
          </Button>
        </div>
      )}
      {p.canRetryRender && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {t("productVideo.renderRetryHelp")}
          </p>
          <Button
            variant="outline"
            disabled={c.busy}
            loading={c.busy}
            onClick={() => void c.retryRender()}
          >
            <RefreshCw className="size-4" />
            {t("productVideo.retryRender")}
          </Button>
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        {t("productVideo.sourcesRetained")}
      </p>
    </section>
  );
}

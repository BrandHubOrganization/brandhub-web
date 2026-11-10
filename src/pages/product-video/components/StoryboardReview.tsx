import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clapperboard, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductVideoController } from "@/pages/product-video/hooks/useProductVideo";
import { canApproveProduction } from "@/pages/product-video/services/productVideoService";

export function StoryboardReview({
  controller: c,
}: {
  controller: ProductVideoController;
}) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const p = c.production;
  if (!p)
    return (
      <section className="border-border bg-card flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
        <Clapperboard className="text-muted-foreground size-8" />
        <h2 className="font-semibold">{t("productVideo.storyboard")}</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          {t("productVideo.storyboardEmpty")}
        </p>
      </section>
    );
  const expired = !p.quote || Date.parse(p.quote.expiresAt) <= now;
  const credits = new Intl.NumberFormat(i18n.language);
  return (
    <section
      className="border-border bg-card min-w-0 space-y-5 rounded-xl border p-4 md:p-6"
      aria-label={t("productVideo.storyboard")}
    >
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clapperboard className="text-brand-orange size-5" />
          {t("productVideo.storyboard")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(`productVideo.recipes.${p.recipeId}`)} ·{" "}
          {t("productVideo.planSummary", {
            count: p.scenes.length,
            seconds: p.brief.durationSeconds,
          })}
        </p>
        <p className="text-muted-foreground text-sm">{p.selectionReason}</p>
      </div>
      {p.sourceConfigDisplay && (
        <p className="text-muted-foreground text-xs">
          {p.sourceConfigDisplay.model} · {p.sourceConfigDisplay.resolution} ·{" "}
          {p.sourceConfigDisplay.sourceDurationSeconds}s
        </p>
      )}
      {!!p.missingInputs?.length && (
        <div
          role="status"
          className="border-border bg-muted space-y-1 rounded-lg border p-3 text-sm"
        >
          {p.missingInputs.map((code) => (
            <p key={code}>
              {t(`productVideo.missing.${code}`, {
                defaultValue: t("productVideo.missing.default"),
              })}
            </p>
          ))}
        </div>
      )}
      {!p.providerReady && (
        <p
          role="status"
          className="border-border bg-muted rounded-lg border p-3 text-sm"
        >
          {t("productVideo.providerUnavailable")}
        </p>
      )}
      {p.scenes.map((scene, index) => (
        <article
          key={scene.sceneId}
          className="border-border min-w-0 space-y-2 border-t pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor={`scene-${scene.sceneId}`} className="font-semibold">
              {t("productVideo.scene", { number: index + 1 })}
            </Label>
            <span className="text-muted-foreground text-xs">
              {t("productVideo.sourceDuration", {
                seconds: scene.sourceDurationSeconds,
              })}
            </span>
          </div>
          {scene.title && (
            <p className="text-sm font-semibold">{scene.title}</p>
          )}
          {c.sceneEdits[scene.sceneId] === undefined && (
            <>
              {scene.action && (
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">
                    {t("productVideo.sceneAction")}:{" "}
                  </span>
                  {scene.action}
                </p>
              )}
              {scene.narration && (
                <blockquote className="border-brand-orange/40 bg-muted rounded-r-md border-l-2 px-3 py-2 text-sm">
                  <p className="text-muted-foreground mb-1 text-xs font-semibold">
                    {t("productVideo.sceneNarration")}
                  </p>
                  <p>{scene.narration}</p>
                </blockquote>
              )}
            </>
          )}
          <Textarea
            id={`scene-${scene.sceneId}`}
            value={c.sceneEdits[scene.sceneId] ?? scene.prompt}
            maxLength={4000}
            rows={5}
            disabled={!c.editable || c.busy}
            onChange={(e) => c.editScene(scene.sceneId, e.target.value)}
            className="text-sm leading-relaxed"
          />
        </article>
      ))}
      {c.editable && (
        <div className="border-border space-y-3 border-t pt-4">
          {c.dirty && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("productVideo.editsRequirePlan")}
            </p>
          )}
          {p.quote && (
            <div className="bg-muted flex flex-wrap items-start justify-between gap-3 rounded-lg p-4">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Coins className="size-4" />
                  {t("productVideo.estimatedCredits")}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("productVideo.creditBreakdown", {
                    units: p.quote.units,
                    credits: credits.format(p.quote.unitCredits),
                  })}
                </p>
              </div>
              <strong className="text-xl">
                {t("productVideo.creditAmount", {
                  amount: credits.format(p.quote.totalCredits),
                })}
              </strong>
            </div>
          )}
          {p.quote && (
            <p className="text-muted-foreground text-xs">
              {expired
                ? t("productVideo.quoteExpired")
                : t("productVideo.quoteUntil", {
                    time: new Date(p.quote.expiresAt).toLocaleTimeString(
                      i18n.language,
                    ),
                  })}
            </p>
          )}
          <Button
            variant="orange"
            className="w-full"
            disabled={c.busy || !canApproveProduction(p, c.dirty, now)}
            loading={c.busy}
            onClick={() => void c.generate()}
          >
            {t("productVideo.generate")}
          </Button>
          <p className="text-muted-foreground text-xs">
            {t("productVideo.consentHelp")}
          </p>
        </div>
      )}
    </section>
  );
}

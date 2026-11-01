import { useTranslation } from "react-i18next";

export function TrendReplayFlow({ stage }: { stage: string }) {
  const { t } = useTranslation();
  const stages = ["PREVIEW", "PREFLIGHT", "T0_T1_T2_T5", "T4_T7"];
  const active = stage === "READ_S3" ? "T0_T1_T2_T5" : stage;
  return (
    <ol
      className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4"
      aria-label={t("admin.trendReplay.flow")}
    >
      {stages.map((step, index) => (
        <li
          key={step}
          aria-current={active === step ? "step" : undefined}
          className={
            active === step
              ? "border-brand-orange bg-brand-orange/5 rounded-lg border p-3"
              : "border-border text-muted-foreground rounded-lg border p-3"
          }
        >
          <span className="font-semibold">
            {index + 1}. {t(`admin.trendReplay.stages.${step}`)}
          </span>
        </li>
      ))}
    </ol>
  );
}

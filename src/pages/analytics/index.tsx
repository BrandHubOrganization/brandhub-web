import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";

export function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper
      title={t("analytics.title")}
      description={t("analytics.description")}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          {
            label: t("analytics.stats.reach.label"),
            value: "245,890",
            delta: "+12.4%",
            desc: t("analytics.stats.reach.desc"),
          },
          {
            label: t("analytics.stats.engagement.label"),
            value: "18,430",
            delta: "+8.2%",
            desc: t("analytics.stats.engagement.desc"),
          },
          {
            label: t("analytics.stats.posts.label"),
            value: "48",
            delta: "0.0%",
            desc: t("analytics.stats.posts.desc"),
          },
          {
            label: t("analytics.stats.responseRate.label"),
            value: "94.5%",
            delta: "+1.5%",
            desc: t("analytics.stats.responseRate.desc"),
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="border-border bg-card space-y-2 rounded-xl border p-6"
          >
            <p className="text-muted-foreground text-3xs font-mono font-semibold tracking-wider uppercase">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight">
                {stat.value}
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-600">
                {stat.delta}
              </span>
            </div>
            <p className="text-muted-foreground text-3xs">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-border bg-card mt-6 space-y-4 rounded-xl border p-6">
        <h2 className="text-foreground text-sm font-bold">
          {t("analytics.channelPerformance.title")}
        </h2>
        <div className="border-border text-muted-foreground bg-muted/10 flex h-48 items-center justify-center rounded border border-dashed text-xs">
          {t("analytics.channelPerformance.placeholder")}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AnalyticsPage;

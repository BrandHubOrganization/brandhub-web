import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

type SupportStatus = "full" | "partial" | "none";

interface ComparisonRow {
  key: string;
  brandhubStatus: SupportStatus;
  manualStatus: SupportStatus;
  schedulerStatus: SupportStatus;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    key: "agencyWorkspace",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "partial",
  },
  {
    key: "mediaPackage",
    brandhubStatus: "full",
    manualStatus: "partial",
    schedulerStatus: "none",
  },
  {
    key: "graphRag",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "none",
  },
  {
    key: "trendCrawler",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "partial",
  },
  {
    key: "complianceGuard",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "none",
  },
  {
    key: "approvalWorkflow",
    brandhubStatus: "full",
    manualStatus: "partial",
    schedulerStatus: "partial",
  },
  {
    key: "multiChannel",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "full",
  },
  {
    key: "vietQrBilling",
    brandhubStatus: "full",
    manualStatus: "none",
    schedulerStatus: "none",
  },
];

function StatusBadge({
  status,
  text,
  highlight = false,
}: {
  status: SupportStatus;
  text: string;
  highlight?: boolean;
}) {
  if (status === "full") {
    return (
      <div className="flex items-start gap-2">
        <CheckCircle2
          className={cn(
            "mt-0.5 size-4 shrink-0",
            highlight ? "text-brand-orange" : "text-emerald-500",
          )}
        />
        <span
          className={cn(
            "text-xs leading-snug",
            highlight
              ? "font-semibold text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-300",
          )}
        >
          {text}
        </span>
      </div>
    );
  }

  if (status === "partial") {
    return (
      <div className="flex items-start gap-2">
        <MinusCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <span className="text-xs leading-snug text-zinc-500 dark:text-zinc-400">
          {text}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <XCircle className="mt-0.5 size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
      <span className="text-xs leading-snug text-zinc-400 dark:text-zinc-500">
        {text}
      </span>
    </div>
  );
}

export function ComparisonMatrix() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: tableRef, isIntersecting: tableVisible } =
    useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  return (
    <section
      id="comparison"
      className="relative overflow-hidden border-t border-zinc-100 bg-zinc-50/60 py-24 dark:border-zinc-800/80 dark:bg-zinc-900/30"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-14 max-w-3xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={9} />
          <div className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <Layers className="size-3.5" />
            <span>{t("landing.comparison.badge")}</span>
          </div>
          <SplitHeading text={t("landing.comparison.title")} />
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            {t("landing.comparison.subtitle")}
          </p>
        </div>

        <div
          ref={tableRef}
          className={cn(
            "bh-stage-reveal overflow-hidden rounded-[28px] border border-zinc-200/90 bg-white shadow-sm transition-all duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-950",
            tableVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0",
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">
                {t("landing.comparison.caption")}
              </caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <th
                    scope="col"
                    className="w-[28%] px-6 py-5 text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    {t("landing.comparison.columns.criteria")}
                  </th>
                  <th
                    scope="col"
                    className="border-brand-orange/20 bg-brand-orange/5 dark:border-brand-orange/20 dark:bg-brand-orange/10 w-[28%] border-x px-6 py-5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-orange inline-flex size-6 items-center justify-center rounded-lg text-white shadow-xs">
                        <Sparkles className="size-3.5" />
                      </span>
                      <div>
                        <span className="text-brand-orange block text-sm font-extrabold">
                          {t("landing.comparison.columns.brandhub")}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {t("landing.comparison.columns.brandhubSub")}
                        </span>
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[22%] px-6 py-5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="block text-sm font-bold">
                      {t("landing.comparison.columns.manual")}
                    </span>
                    <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                      {t("landing.comparison.columns.manualSub")}
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="w-[22%] px-6 py-5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="block text-sm font-bold">
                      {t("landing.comparison.columns.legacyTools") ||
                        t("landing.comparison.columns.scheduler")}
                    </span>
                    <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                      {t("landing.comparison.columns.legacySub") ||
                        t("landing.comparison.columns.schedulerSub")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 text-xs font-bold text-zinc-900 sm:text-sm dark:text-zinc-100"
                    >
                      {t(`landing.comparison.rows.${row.key}.feature`) ||
                        t(`landing.comparison.rows.${row.key}.criteria`)}
                    </th>
                    <td className="border-brand-orange/15 bg-brand-orange/[0.03] dark:border-brand-orange/15 dark:bg-brand-orange/[0.06] border-x px-6 py-4">
                      <StatusBadge
                        status={row.brandhubStatus}
                        text={t(`landing.comparison.rows.${row.key}.brandhub`)}
                        highlight
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.manualStatus}
                        text={t(`landing.comparison.rows.${row.key}.manual`)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.schedulerStatus}
                        text={
                          t(`landing.comparison.rows.${row.key}.legacy`) ||
                          t(`landing.comparison.rows.${row.key}.scheduler`)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-100 bg-zinc-50/70 px-6 py-5 sm:flex-row dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("landing.comparison.footerNote")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="bg-brand-orange hover:bg-brand-orange/90 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
            >
              <span>{t("landing.comparison.cta")}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ComparisonMatrix;


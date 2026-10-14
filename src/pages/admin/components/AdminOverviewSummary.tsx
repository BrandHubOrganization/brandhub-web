import {
  Activity,
  ArrowRight,
  Building2,
  Flag,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AdminStatistics } from "@/services/adminStatisticsService";

export function AdminMetrics({ data }: { data: AdminStatistics }) {
  const { t, i18n } = useTranslation();
  const metrics = [
    {
      key: "totalUsers",
      hint: "totalUsersHint",
      value: data.totalUsers,
      icon: Users,
      to: "/admin?view=users",
    },
    {
      key: "activeUsers",
      hint: "activeHint",
      value: data.activeUsers30d,
      icon: Activity,
    },
    {
      key: "agencies",
      hint: "agenciesHint",
      value: data.totalAgencies,
      icon: Building2,
    },
    {
      key: "flagged",
      hint: "flaggedHint",
      value: data.flaggedUsers,
      icon: Flag,
      to: "/admin?view=users&status=FLAGGED",
    },
    {
      key: "pendingSanctions",
      hint: "pendingHint",
      value: data.pendingSanctions,
      icon: ShieldCheck,
      to: "/admin?view=users",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 xl:grid-cols-5">
      {metrics.map(({ key, hint, value, icon: Icon, to }) => {
        const alert =
          (key === "flagged" || key === "pendingSanctions") && value > 0;
        const body = (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-2xs font-mono leading-4 font-medium tracking-wider uppercase">
                {t(`admin.overview.${key}`)}
              </h2>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md",
                  alert
                    ? "bg-brand-orange-soft text-brand-orange"
                    : "bg-muted text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            <p
              className={cn(
                "mt-3 font-mono text-[28px] leading-none font-semibold tracking-tight tabular-nums",
                alert && "text-brand-orange",
              )}
            >
              {new Intl.NumberFormat(i18n.language).format(value)}
            </p>
            <p className="text-muted-foreground mt-3 text-xs leading-5">
              {t(`admin.overview.${hint}`)}
            </p>
          </>
        );
        const card =
          "bg-card border-border flex min-w-0 flex-col rounded-xl border p-5";
        return to ? (
          <Link
            key={key}
            to={to}
            aria-label={t(`admin.overview.${key}`)}
            className={cn(
              card,
              "hover:border-foreground/20 focus-visible:outline-ring transition-colors focus-visible:outline-2",
            )}
          >
            {body}
          </Link>
        ) : (
          <section
            key={key}
            aria-label={t(`admin.overview.${key}`)}
            className={card}
          >
            {body}
          </section>
        );
      })}
    </div>
  );
}

const ATTENTION_TONES = {
  red: {
    box: "border-destructive/25 bg-destructive/5",
    title: "text-destructive",
    button: "bg-destructive hover:bg-destructive/90 text-white",
  },
  orange: {
    box: "border-brand-orange/25 bg-brand-orange-soft/60",
    title: "text-brand-orange",
    button: "bg-brand-orange hover:bg-brand-orange/90 text-white",
  },
  neutral: {
    box: "border-border bg-muted/40",
    title: "text-foreground",
    button: "bg-foreground hover:bg-foreground/90 text-background",
  },
};

export function AdminAttention({ data }: { data: AdminStatistics }) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language);
  const rows = [
    {
      key: "pendingSanctions",
      hint: "sanctionHint",
      action: "actionSanction",
      count: data.pendingSanctions,
      tone: "red" as const,
      to: "/admin?view=users",
    },
    {
      key: "flagged",
      hint: "flaggedReviewHint",
      action: "actionFlagged",
      count: data.flaggedUsers,
      tone: "orange" as const,
      to: "/admin?view=users&status=FLAGGED",
    },
    {
      key: "verification",
      hint: "verificationHint",
      action: "actionVerification",
      count: data.pendingVerificationUsers,
      tone: "neutral" as const,
      to: "/admin?view=users&status=PENDING_VERIFICATION",
    },
  ];
  const waiting = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <section className="bg-card border-border flex min-w-0 flex-col rounded-xl border p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">
            {t("admin.overview.attention")}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t("admin.overview.attentionCount", { count: waiting })}
          </p>
        </div>
        <Link
          to="/admin?view=users"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring flex shrink-0 items-center gap-1 rounded-md text-xs focus-visible:outline-2"
        >
          {t("admin.overview.viewAll")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="my-5 space-y-3">
        {rows.map(({ key, hint, action, count, tone, to }) => {
          const style = ATTENTION_TONES[count > 0 ? tone : "neutral"];
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4",
                style.box,
              )}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn("text-sm leading-5 font-semibold", style.title)}
                >
                  {t(`admin.overview.${key}`)}
                  <span className="ml-1.5 font-mono tabular-nums">
                    ({number.format(count)})
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {t(`admin.overview.${hint}`)}
                </p>
              </div>
              <Link
                to={to}
                className={cn(
                  "focus-visible:outline-ring shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  count > 0
                    ? style.button
                    : "border-border bg-card hover:bg-muted border",
                )}
              >
                {t(`admin.overview.${action}`)}
              </Link>
            </div>
          );
        })}
      </div>
      <div className="border-border mt-auto grid grid-cols-1 gap-2 border-t pt-4 min-[420px]:grid-cols-2">
        <Button asChild variant="outline" className="text-xs">
          <Link to="/admin?view=email">{t("admin.navigation.email")}</Link>
        </Button>
        <Button
          asChild
          className="bg-foreground text-background hover:bg-foreground/90 text-xs"
        >
          <Link to="/admin?view=users">{t("admin.overview.manageUsers")}</Link>
        </Button>
      </div>
    </section>
  );
}

export function AdminStrikeSummary({ data }: { data: AdminStatistics }) {
  const { t, i18n } = useTranslation();
  const colors = {
    yellow: "bg-warning",
    orange: "bg-brand-orange",
    red: "bg-destructive",
  };
  return (
    <div className="border-border mt-5 border-t pt-4">
      <p className="text-muted-foreground text-xs leading-5">
        {t("admin.overview.strikes")}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {(["yellow", "orange", "red"] as const).map((level) => (
          <div
            key={level}
            className="bg-muted/40 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
          >
            <span
              className={cn("h-3 w-2 shrink-0 rounded-sm", colors[level])}
              aria-hidden="true"
            />
            <span>{t(`admin.level.${level.toUpperCase()}`)}</span>
            <span className="ml-auto font-mono font-medium tabular-nums">
              {new Intl.NumberFormat(i18n.language).format(data.strikes[level])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

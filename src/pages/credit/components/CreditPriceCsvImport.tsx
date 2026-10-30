import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { useCreditPriceImport } from "@/pages/credit/hooks/useCreditPriceImport";
import type { CreditPriceImportRow } from "@/pages/credit/types/creditPriceImport";

function ProposalCard({ row }: { row: CreditPriceImportRow }) {
  const { t, i18n } = useTranslation();
  const proposal = row.proposal;
  const number = new Intl.NumberFormat(i18n.language);
  const current = row.current
    ? number.format(BigInt(row.current.unitCredits))
    : t("credit.csv.notConfigured");
  const exported = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(proposal.generatedAt));
  return (
    <article className="border-border bg-background space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t(`credit.operations.${proposal.operation}`)}
        </h3>
        <Badge variant="outline" className="text-foreground">
          {t(
            row.current?.enabled ? "credit.csv.enabled" : "credit.csv.disabled",
          )}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-muted-foreground text-xs">
            {t("credit.csv.current")}
          </p>
          <p className="font-medium tabular-nums">{current}</p>
        </div>
        <ArrowRight
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
        <div>
          <p className="text-muted-foreground text-xs">
            {t("credit.csv.proposed")}
          </p>
          <p className="text-brand-orange-fg text-lg font-semibold tabular-nums">
            {number.format(proposal.unitCredits)}{" "}
            <span className="text-muted-foreground text-xs font-normal">
              {t("credit.csv.unit")}
            </span>
          </p>
        </div>
        {!row.changed && (
          <Badge variant="secondary">{t("credit.csv.unchanged")}</Badge>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        {t("credit.csv.featurePricing")}
      </p>
      <dl className="border-border grid gap-3 border-t pt-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-muted-foreground">{t("credit.csv.profile")}</dt>
          <dd className="mt-1 break-words whitespace-pre-wrap">
            {proposal.profileId}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("credit.csv.configuration")}
          </dt>
          <dd className="mt-1">
            {proposal.width == null && proposal.height == null
              ? t("credit.csv.allDimensions")
              : `${proposal.width} × ${proposal.height}`}{" "}
            ·{" "}
            {t("credit.csv.steps", {
              count: proposal.steps ?? 0,
              value: proposal.steps ?? "—",
            })}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("credit.csv.exported")}</dt>
          <dd className="mt-1">{exported}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-muted-foreground">{t("credit.csv.report")}</dt>
          <dd className="mt-1 font-mono break-all">
            {proposal.sourceReportId}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("credit.csv.revision")}</dt>
          <dd className="mt-1">{row.current?.revision ?? "0"}</dd>
        </div>
      </dl>
    </article>
  );
}

export function CreditPriceCsvImport({
  state: {
    attachInput,
    file,
    preview,
    result,
    error,
    busy,
    needsReview,
    select,
    reset,
    apply,
  },
}: {
  state: ReturnType<typeof useCreditPriceImport>;
}) {
  const { t } = useTranslation();
  const alert = useRef<HTMLDivElement>(null);
  const invalid = Boolean(error || (preview && !preview.valid));
  useEffect(() => {
    if (invalid) alert.current?.focus();
  }, [invalid, error, preview]);
  const issueText = (code: string) =>
    t(`credit.csv.issue.${code}`, { defaultValue: t("credit.csv.invalid") });
  return (
    <>
      <Input
        ref={attachInput}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        aria-label={t("credit.csv.choose")}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void select(file);
        }}
      />
      {(file || result) && (
        <section
          aria-label={t("credit.csv.title")}
          className="border-border bg-card space-y-4 rounded-xl border p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-semibold">
                <FileSpreadsheet
                  className="text-primary size-4"
                  aria-hidden="true"
                />
                {t("credit.csv.title")}
              </h2>
              {file && (
                <p className="text-muted-foreground mt-1 text-xs break-all">
                  {file.name}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy === "apply"}
              onClick={reset}
            >
              {t(result ? "credit.csv.close" : "credit.csv.cancel")}
            </Button>
          </div>
          {result && (
            <p role="status" className="flex items-start gap-2 text-sm">
              <CheckCircle2
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {t("credit.csv.success", {
                count: result.updatedPrices.length,
                unchanged: result.unchangedOperations.length,
              })}
            </p>
          )}
          {busy === "preview" && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("credit.csv.loading")}
            </p>
          )}
          {invalid && (
            <div
              ref={alert}
              tabIndex={-1}
              role="alert"
              className="border-destructive/40 bg-destructive/5 focus-visible:outline-ring space-y-2 rounded-lg border p-3 text-sm focus-visible:outline-2"
            >
              <p className="font-medium">
                {error ? t(error) : t("credit.csv.invalid")}
              </p>
              {!!preview?.issues.length && (
                <ul className="list-disc space-y-1 pl-5">
                  {preview.issues.map((issue, index) => (
                    <li key={index}>
                      {issue.row > 0 && (
                        <span>
                          {t("credit.csv.record", {
                            row: issue.row,
                            field: issue.field,
                          })}{" "}
                        </span>
                      )}
                      {issueText(issue.code)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {preview && (
            <div className="space-y-3">
              {preview.rows.map((row) => (
                <ProposalCard key={row.proposal.operation} row={row} />
              ))}
            </div>
          )}
          {preview?.valid && (
            <p className="text-muted-foreground text-xs">
              {t("credit.csv.preserve")}
            </p>
          )}
          {file && busy !== "preview" && (
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={busy === "apply"}
                onClick={() => {
                  if (file) void select(file);
                }}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {t("credit.csv.recheck")}
              </Button>
              <Button
                variant="orange"
                loading={busy === "apply"}
                disabled={!preview?.valid || Boolean(busy) || needsReview}
                onClick={() => {
                  void apply();
                }}
              >
                {t("credit.csv.apply")}
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  );
}

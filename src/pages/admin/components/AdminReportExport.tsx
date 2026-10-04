import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  adminRevenueService,
  errorCode,
  type ReportType,
} from "@/services/adminRevenueService";

const TYPES: ReportType[] = ["REVENUE", "USER", "PLATFORM"];
const field =
  "border-input bg-card text-foreground focus-visible:outline-ring h-9 w-full rounded-lg border px-3 text-sm focus-visible:outline-2";

export interface ReportDefaults {
  type: ReportType;
  from: string;
  to: string;
  timezone: string;
}

/** SCR-ADM-11: report type, date range and zone; the file downloads with the admin session. */
export function AdminReportForm({
  defaults,
  onDone,
  onCancel,
}: {
  defaults: ReportDefaults;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [type, setType] = useState(defaults.type);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [timezone, setTimezone] = useState(defaults.timezone);
  const mutation = useMutation({
    mutationFn: () =>
      adminRevenueService.exportPdf({
        reportType: type,
        startDate: from,
        endDate: to,
        timezone,
      }),
    onSuccess: (report) => {
      toast.success(t("admin.reports.done", { name: report.fileName }));
      onDone?.();
    },
  });
  const code = errorCode(mutation.error);
  const fileName = `BrandHub_Report_${type.toLowerCase()}_${from.replaceAll("-", "")}_${to.replaceAll("-", "")}.pdf`;
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          {t("admin.reports.type")}
        </legend>
        {TYPES.map((value) => (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              type === value
                ? "border-brand-orange bg-brand-orange-soft/60"
                : "border-border hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name="report-type"
              value={value}
              checked={type === value}
              onChange={() => setType(value)}
              className="accent-brand-orange mt-1"
            />
            <span>
              <span className="block text-sm font-semibold">
                {t(`admin.reports.types.${value}`)}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                {t(`admin.reports.typeHints.${value}`)}
              </span>
            </span>
          </label>
        ))}
        <p className="text-muted-foreground text-xs">
          {t("admin.reports.moderationLater")}
        </p>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 text-sm font-medium">
          <span>{t("admin.reports.from")}</span>
          <input
            type="date"
            required
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className={field}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>{t("admin.reports.to")}</span>
          <input
            type="date"
            required
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className={field}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>{t("admin.reports.timezone")}</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={field}
          >
            <option value="Asia/Ho_Chi_Minh">
              {t("admin.overview.vietnamTime")}
            </option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>
      <div className="bg-muted/50 border-brand-orange rounded-r-lg border-l-4 px-4 py-3 text-xs leading-5">
        <p className="font-mono">
          {t("admin.reports.fileName", { name: fileName })}
        </p>
        <p className="text-muted-foreground mt-1">
          {t("admin.reports.expiry")}
        </p>
      </div>
      {mutation.isError && (
        <p role="alert" className="text-destructive text-sm">
          {t(
            code === "NO_DATA_IN_RANGE"
              ? "admin.reports.empty"
              : code === "INVALID_DATE_RANGE"
                ? "admin.revenue.invalidRange"
                : "admin.reports.error",
          )}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("admin.reports.cancel")}
          </Button>
        )}
        <Button
          type="submit"
          disabled={mutation.isPending || !from || !to}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <Download className="size-4" />
          {t("admin.reports.download")}
        </Button>
      </div>
    </form>
  );
}

export function AdminReportDialog({
  defaults,
  onClose,
}: {
  defaults: ReportDefaults;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-brand-orange size-5" />
            {t("admin.reports.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.reports.description")}
          </DialogDescription>
        </DialogHeader>
        <AdminReportForm
          defaults={defaults}
          onDone={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

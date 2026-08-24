import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReportFrequency, ScheduledReport } from "../types/report";

const FREQUENCIES: ReportFrequency[] = ["DAILY", "WEEKLY", "MONTHLY"];

export interface ScheduledReportsPanelProps {
  reports: ScheduledReport[];
  onCreate: (input: {
    name: string;
    frequency: ReportFrequency;
    recipients: string[];
  }) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduledReportsPanel({
  reports,
  onCreate,
  onToggle,
  onDelete,
}: ScheduledReportsPanelProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ReportFrequency>("WEEKLY");
  const [recipientsInput, setRecipientsInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const recipients = recipientsInput
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    if (!name.trim() || recipients.length === 0) return;
    onCreate({ name: name.trim(), frequency, recipients });
    setName("");
    setFrequency("WEEKLY");
    setRecipientsInput("");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-4"
      >
        <Input
          placeholder={t("reports.scheduled.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:col-span-2"
        />
        <Select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as ReportFrequency)}
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {t(`reports.scheduled.frequencies.${f}`)}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t("reports.scheduled.recipientsPlaceholder")}
          value={recipientsInput}
          onChange={(e) => setRecipientsInput(e.target.value)}
          className="sm:col-span-4"
        />
        <Button
          type="submit"
          size="sm"
          className="gap-1.5 text-xs sm:col-span-4 sm:w-fit"
        >
          <Plus className="size-3.5" />
          {t("reports.scheduled.add")}
        </Button>
      </form>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {report.name}
                </span>
                <Badge variant={report.isActive ? "PUBLISHED" : "DRAFT"}>
                  {report.isActive
                    ? t("reports.scheduled.active")
                    : t("reports.scheduled.inactive")}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {t(`reports.scheduled.frequencies.${report.frequency}`)} ·{" "}
                {report.recipients.join(", ")}
              </p>
              {report.lastSentAt && (
                <p className="text-muted-foreground text-3xs">
                  {t("reports.scheduled.lastSentAt")}{" "}
                  {new Date(report.lastSentAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onToggle(report.id)}
              >
                <Power className="size-3.5" />
                {report.isActive
                  ? t("reports.scheduled.deactivate")
                  : t("reports.scheduled.activate")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5 text-xs"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="size-3.5" />
                {t("reports.scheduled.delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduledReportsPanel;

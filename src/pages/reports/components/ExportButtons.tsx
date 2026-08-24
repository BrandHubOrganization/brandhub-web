import { useTranslation } from "react-i18next";
import { FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportReport } from "@/services/mock/mockReportService";

export function ExportButtons() {
  const { t } = useTranslation();

  async function handleExport(format: "PDF" | "EXCEL") {
    await exportReport(format);
    toast.info(t("reports.export.unavailable"));
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => handleExport("PDF")}
      >
        <FileText className="size-3.5" />
        {t("reports.export.pdf")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => handleExport("EXCEL")}
      >
        <FileSpreadsheet className="size-3.5" />
        {t("reports.export.excel")}
      </Button>
    </div>
  );
}

export default ExportButtons;

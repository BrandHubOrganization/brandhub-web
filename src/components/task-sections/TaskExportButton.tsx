import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

/** Downloads the task's output-sections file (DOCX for press releases, PDF otherwise; spec §16 item 11). */
export function TaskExportButton({
  workspaceId,
  taskId,
  className,
}: {
  workspaceId: string;
  taskId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const res = await api.get(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/export`,
        { responseType: "blob" },
      );
      const disposition = res.headers["content-disposition"] as
        string | undefined;
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "export";
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("editor.sections.exportError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy}
      className={className}
      onClick={() => void handleExport()}
    >
      <Download className="size-3.5" />
      {t("editor.sections.exportFile")}
    </Button>
  );
}

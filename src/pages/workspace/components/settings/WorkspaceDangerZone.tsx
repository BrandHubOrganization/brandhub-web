import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkspaceDangerZoneProps {
  workspaceName: string;
  deleting: boolean;
  onDelete: () => Promise<void>;
}

export function WorkspaceDangerZone({
  workspaceName,
  deleting,
  onDelete,
}: WorkspaceDangerZoneProps) {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const handleClose = () => {
    setDeleteOpen(false);
    setConfirmName("");
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    handleClose();
  };

  return (
    <>
      <div className="max-w-sm">
        <div className="bg-card rounded-xl border border-red-200 p-6 dark:border-red-900/50">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert className="size-4 text-rose-500" />
            {t("workspace.settings.danger.title")}
          </h3>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("workspace.settings.danger.deleteHint")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
            onClick={() => setDeleteOpen(true)}
          >
            {t("workspace.settings.danger.deleteButton")}
          </Button>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-rose-500" />
              <h3 className="text-foreground text-sm font-semibold">
                {t("workspace.settings.danger.confirmTitle")}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("workspace.settings.danger.confirmBody")}
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={workspaceName}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                {t("workspace.settings.danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                loading={deleting}
                disabled={confirmName !== workspaceName || deleting}
                onClick={handleConfirmDelete}
              >
                {t("workspace.settings.danger.confirmDelete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

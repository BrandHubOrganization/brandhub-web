import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { workspaceService } from "@/services/workspaceService";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import type { ManagedWorkspace, WorkspaceTemplate } from "@/types/workspace";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkspaceTemplate | null;
}

type Target = "new" | "existing";

/** Wizard 2 bước: chọn đích (workspace mới / có sẵn) → xác nhận áp dụng. */
export function ApplyTemplateDialog({ open, onOpenChange, template }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [target, setTarget] = useState<Target>("new");
  const [managedWorkspaces, setManagedWorkspaces] = useState<
    ManagedWorkspace[]
  >([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open) return;
    workspaceService
      .listManagedWorkspaces()
      .then(({ data }) => setManagedWorkspaces(data.data))
      .catch(() => setManagedWorkspaces([]));
  }, [open]);

  const handleConfirm = async () => {
    if (!template) return;
    if (target === "new") {
      navigate(`/workspaces/create?templateId=${template.id}`);
      onOpenChange(false);
      return;
    }
    if (!selectedWorkspaceId) return;
    setApplying(true);
    try {
      await workspaceTemplateService.applyToWorkspace(
        template.id,
        selectedWorkspaceId,
      );
      toast.success(t("workspace.templates.applySuccess"));
      onOpenChange(false);
      setSelectedWorkspaceId("");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.templates.applyError")),
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.templates.applyDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="apply-target"
              checked={target === "new"}
              onChange={() => setTarget("new")}
            />
            {t("workspace.templates.applyToNew")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="apply-target"
              checked={target === "existing"}
              onChange={() => setTarget("existing")}
            />
            {t("workspace.templates.applyToExisting")}
          </label>
          {target === "existing" && (
            <Select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            >
              <option value="">
                {t("workspace.templates.selectWorkspacePlaceholder")}
              </option>
              {managedWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </Select>
          )}
          {target === "existing" && (
            <p className="text-muted-foreground text-xs">
              {t("workspace.templates.selectFieldsHint")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="orange"
            loading={applying}
            disabled={target === "existing" && !selectedWorkspaceId}
            onClick={handleConfirm}
          >
            {t("workspace.templates.applyButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApplyTemplateDialog;

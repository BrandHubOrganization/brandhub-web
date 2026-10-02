import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspacePreviewCard } from "./WorkspacePreviewCard";
import type { WorkspaceTemplate } from "@/types/workspace";

interface Props {
  template: WorkspaceTemplate | null;
  onOpenChange: (open: boolean) => void;
  onApply: (template: WorkspaceTemplate) => void;
}

/** Mockup mini của workspace sẽ được tạo nếu dùng mẫu này — mở khi bấm 1 mẫu
 * trong danh sách chọn mẫu ở form tạo workspace. */
export function TemplatePreviewDialog({
  template,
  onOpenChange,
  onApply,
}: Props) {
  const { t } = useTranslation();
  const industryFieldEntries = Object.entries(
    template?.config.industryFields ?? {},
  ).filter(([, v]) => v !== null && v !== "");

  return (
    <Dialog open={!!template} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.create.previewDialogTitle")}</DialogTitle>
        </DialogHeader>
        {template && (
          <div className="border-border bg-card rounded-xl border p-5">
            <WorkspacePreviewCard
              name={template.name}
              timezone={template.config.timezone}
              industry={template.config.industry}
              companySize={template.config.companySize}
              website={template.config.website}
              phone={template.config.phone}
              location={template.config.location}
              defaultPlatforms={template.config.defaultPlatforms}
            />
            {industryFieldEntries.length > 0 && (
              <div className="border-border mt-4 space-y-1.5 border-t pt-4">
                {industryFieldEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="orange"
            onClick={() => template && onApply(template)}
          >
            {t("workspace.create.useThisTemplate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatePreviewDialog;

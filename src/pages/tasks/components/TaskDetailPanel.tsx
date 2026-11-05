import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GripVertical } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";
import { useResizablePanelWidth } from "@/pages/tasks/hooks/useResizablePanelWidth";
import { cn } from "@/lib/utils";

interface PanelProps {
  workspaceId: string;
  taskId: string;
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onRestoreFocus: () => void;
}

export function TaskDetailPanel(props: PanelProps) {
  const { t } = useTranslation();
  const { width, panelRef, onMouseDown, isDragging } = useResizablePanelWidth();

  // Giữ lại taskId gần nhất trong lúc animation đóng đang trượt ra
  // để nội dung không bị biến thành null đột ngột (gây giật layout trắng trơn)
  const [lastActiveTaskId, setLastActiveTaskId] = useState(props.taskId);
  if (props.taskId && props.taskId !== lastActiveTaskId) {
    setLastActiveTaskId(props.taskId);
  }
  const displayTaskId = props.taskId || lastActiveTaskId;

  const content = displayTaskId ? (
    <TaskWorkflowContent
      workspaceId={props.workspaceId}
      taskId={displayTaskId}
      onUpdated={props.onUpdated}
      onClose={props.onClose}
    />
  ) : null;

  return (
    <Sheet
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <SheetContent
        ref={panelRef}
        side="right"
        showOverlay={false}
        id="task-detail-panel"
        style={{
          width: `${width}px`,
          maxWidth: "92vw",
          minWidth: "min(450px, 92vw)",
        }}
        className={cn(
          "border-border bg-card fixed inset-y-0 right-0 z-[60] flex h-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-none md:max-w-none lg:max-w-none [&>button]:hidden",
          isDragging
            ? "!transition-none select-none"
            : "!duration-300 !transition-transform",
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          props.onRestoreFocus();
        }}
      >
        {/* Resize Handle ở mép trái */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel width"
          onMouseDown={onMouseDown}
          className={cn(
            "group absolute top-0 -left-1.5 z-50 flex h-full w-3 cursor-col-resize items-center justify-center transition-colors select-none",
            isDragging
              ? "bg-brand-orange/30"
              : "hover:bg-brand-orange/20 active:bg-brand-orange/40",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-1 items-center justify-center rounded-full transition-all",
              isDragging
                ? "bg-brand-orange w-1.5 shadow-sm shadow-brand-orange/50"
                : "bg-border group-hover:bg-brand-orange group-active:bg-brand-orange",
            )}
          >
            <GripVertical
              className={cn(
                "size-3 text-muted-foreground group-hover:text-brand-orange transition-opacity",
                isDragging
                  ? "opacity-100 text-brand-orange"
                  : "opacity-0 group-hover:opacity-100",
              )}
            />
          </div>
        </div>

        {/* Accessible SheetHeader (Visually handled by Jira Header Bar inside TaskWorkflowContent) */}
        <SheetHeader className="sr-only">
          <SheetTitle>{t("tasks.details")}</SheetTitle>
          <SheetDescription>{t("tasks.panel.hint")}</SheetDescription>
        </SheetHeader>

        <div
          data-task-scroll="detail"
          className={cn(
            "min-h-0 flex-1 overflow-hidden flex flex-col",
            isDragging && "pointer-events-none select-none",
          )}
        >
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}

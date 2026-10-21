import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";
import { useResizablePanelWidth } from "@/pages/tasks/hooks/useResizablePanelWidth";

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
  const { width, panelRef, onMouseDown } = useResizablePanelWidth();

  // Giữ lại taskId gần nhất trong lúc animation đóng đang trượt ra
  // để nội dung không bị biến thành null đột ngột (gây giật layout trắng trơn)
  const lastActiveTaskId = useRef(props.taskId);
  if (props.taskId) {
    lastActiveTaskId.current = props.taskId;
  }
  const displayTaskId = props.taskId || lastActiveTaskId.current;

  const content = displayTaskId ? (
    <TaskWorkflowContent
      workspaceId={props.workspaceId}
      taskId={displayTaskId}
      onUpdated={props.onUpdated}
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
        style={{ width: `${width}px`, maxWidth: "90vw" }}
        className="border-border bg-card fixed inset-y-0 right-0 z-[60] flex h-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-none md:max-w-none lg:max-w-none [&>button]:hidden !duration-300 !transition-transform"
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
          className="group hover:bg-brand-orange/20 active:bg-brand-orange/40 absolute top-0 -left-1.5 z-50 flex h-full w-3 cursor-col-resize items-center justify-center transition-colors"
        >
          <div className="bg-border group-hover:bg-brand-orange group-active:bg-brand-orange flex h-10 w-1 items-center justify-center rounded-full transition-colors">
            <GripVertical className="text-muted-foreground group-hover:text-brand-orange size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <SheetHeader className="border-border bg-card shrink-0 flex-row items-center justify-between gap-3 border-b px-6 py-4 text-left">
          <div className="min-w-0">
            <SheetTitle className="text-foreground text-base font-semibold">
              {t("tasks.details")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("tasks.panel.hint")}
            </SheetDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-8 rounded-lg"
              aria-label={t("tasks.close")}
              onClick={props.onClose}
            >
              <X aria-hidden className="size-4" />
            </Button>
          </div>
        </SheetHeader>
        <div
          data-task-scroll="detail"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-8"
        >
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}

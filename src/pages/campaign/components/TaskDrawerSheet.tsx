import { useState, useRef, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TaskWorkflowProvider } from "@/pages/tasks/components/TaskWorkflowProvider";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";
import {
  useResizablePanelWidth,
  getInitialTaskDrawerWidth,
} from "@/pages/tasks/hooks/useResizablePanelWidth";
import { cn } from "@/lib/utils";

export function TaskFields({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}) {
  return <TaskWorkflowContent workspaceId={workspaceId} taskId={taskId} />;
}

export interface TaskDrawerSheetProps {
  workspaceId: string;
  taskId: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  onUpdated?: () => void;
  onClose?: () => void;
}

const TASK_DRAWER_STORAGE_KEY = "brandhub_task_drawer_sheet_width";

export function TaskDrawerSheet({
  workspaceId,
  taskId,
  open,
  onOpenChange,
  trigger,
  onUpdated,
  onClose,
}: TaskDrawerSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;
  const setSheetOpen = isControlled ? onOpenChange : setInternalOpen;

  const { width, panelRef, onMouseDown, isDragging } = useResizablePanelWidth(
    getInitialTaskDrawerWidth,
    450,
    1400,
    TASK_DRAWER_STORAGE_KEY,
  );

  // Giữ lại taskId gần nhất trong lúc animation đóng đang trượt ra
  // để nội dung không bị unmount đột ngột gây giật layout trắng trơn
  const lastActiveTaskId = useRef(taskId);
  if (taskId) {
    lastActiveTaskId.current = taskId;
  }
  const displayTaskId = taskId || lastActiveTaskId.current;

  const handleClose = () => {
    if (onClose) onClose();
    if (setSheetOpen) setSheetOpen(false);
  };

  return (
    <Sheet open={Boolean(sheetOpen && taskId)} onOpenChange={setSheetOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        ref={panelRef}
        side="right"
        style={{
          width: `${width}px`,
          maxWidth: "92vw",
          minWidth: "min(450px, 92vw)",
        }}
        className={cn(
          "w-full sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none p-0 gap-0 flex flex-col h-full bg-background border-l shadow-2xl overflow-hidden [&>button]:hidden",
          isDragging
            ? "!transition-none select-none"
            : "!duration-300 !transition-transform",
        )}
      >
        {/* Resize Handle ở mép trái */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Kéo để điều chỉnh độ rộng bảng chi tiết công việc"
          onMouseDown={onMouseDown}
          className={cn(
            "group absolute top-0 -left-1.5 z-50 flex h-full w-3 cursor-col-resize items-center justify-center transition-colors select-none",
            isDragging ? "bg-primary/25" : "hover:bg-primary/15",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-1 items-center justify-center rounded-full transition-all",
              isDragging
                ? "bg-primary w-1.5 shadow-sm shadow-primary/50"
                : "bg-border group-hover:bg-primary/80",
            )}
          >
            <GripVertical
              className={cn(
                "size-3 text-primary transition-opacity",
                isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            />
          </div>
        </div>

        <SheetHeader className="sr-only">
          <SheetTitle>Chi tiết công việc</SheetTitle>
          <SheetDescription>Xem và quản lý chi tiết công việc</SheetDescription>
        </SheetHeader>
        {displayTaskId && (
          <div
            data-task-scroll="detail"
            className={cn(
              "min-h-0 flex-1 overflow-hidden flex flex-col",
              isDragging && "pointer-events-none select-none",
            )}
          >
            <TaskWorkflowProvider onUpdated={onUpdated}>
              <TaskWorkflowContent
                workspaceId={workspaceId}
                taskId={displayTaskId}
                onUpdated={onUpdated}
                onClose={handleClose}
              />
            </TaskWorkflowProvider>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

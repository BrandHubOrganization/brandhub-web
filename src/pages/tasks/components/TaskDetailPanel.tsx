import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";

interface PanelProps {
  workspaceId: string;
  taskId: string;
  isDesktop: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onRestoreFocus: () => void;
}

export function TaskDetailPanel(props: PanelProps) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (props.isDesktop) heading.current?.focus({ preventScroll: true });
  }, [props.taskId, props.isDesktop]);
  const content = (
    <TaskWorkflowContent
      workspaceId={props.workspaceId}
      taskId={props.taskId}
      onUpdated={props.onUpdated}
    />
  );
  if (!props.isDesktop)
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) props.onClose();
        }}
      >
        <SheetContent
          className="w-full gap-0 overflow-hidden motion-reduce:animate-none motion-reduce:transition-none sm:max-w-xl [&>button]:hidden"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            props.onRestoreFocus();
          }}
        >
          <SheetHeader className="flex-row items-center justify-between border-b">
            <div className="min-w-0">
              <SheetTitle>{t("tasks.details")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("tasks.panel.hint")}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("tasks.close")}
              onClick={props.onClose}
            >
              <PanelRightClose aria-hidden className="size-4" />
            </Button>
          </SheetHeader>
          <div
            data-task-scroll="detail"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6"
          >
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  return (
    <aside
      id="task-detail-panel"
      aria-labelledby="task-detail-heading"
      className="bg-card text-foreground flex h-full min-h-0 w-[28rem] shrink-0 flex-col border-l 2xl:w-[32rem]"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.stopPropagation();
          props.onClose();
        }
      }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-3">
        <h2
          id="task-detail-heading"
          tabIndex={-1}
          ref={heading}
          className="focus-visible:outline-ring text-sm font-semibold focus-visible:outline-2"
        >
          {t("tasks.details")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("tasks.close")}
          title={t("tasks.close")}
          onClick={props.onClose}
        >
          <PanelRightClose aria-hidden className="size-4" />
        </Button>
      </header>
      <div
        data-task-scroll="detail"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6"
      >
        {content}
      </div>
    </aside>
  );
}

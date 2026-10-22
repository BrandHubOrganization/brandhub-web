import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { taskCommentService } from "@/pages/tasks/services/taskCommentService";
import { useAuthStore } from "@/store/authStore";

export function TaskCommentImage({
  workspaceId,
  taskId,
  id,
}: {
  workspaceId: string;
  taskId: string;
  id: string;
}) {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const [open, setOpen] = useState(false);
  const thumbnail = useRef<HTMLImageElement>(null);
  const preview = useRef<HTMLImageElement>(null);
  const image = useQuery({
    queryKey: ["task-comment-image", userId, workspaceId, taskId, id],
    queryFn: ({ signal }) =>
      taskCommentService.image(workspaceId, taskId, id, signal),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });
  useEffect(() => {
    if (!image.data) return;
    const next = URL.createObjectURL(image.data);
    if (thumbnail.current) thumbnail.current.src = next;
    if (preview.current) preview.current.src = next;
    return () => URL.revokeObjectURL(next);
  }, [image.data, open]);
  if (image.isPending)
    return (
      <p role="status" className="text-muted-foreground text-xs">
        {t("tasks.comments.loadingImage")}
      </p>
    );
  if (image.isError)
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void image.refetch()}
      >
        {t("tasks.comments.retryImage")}
      </Button>
    );
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-24 w-28 overflow-hidden p-1"
        onClick={() => setOpen(true)}
        aria-label={t("tasks.comments.viewImage")}
      >
        <img
          ref={thumbnail}
          alt={t("tasks.comments.imageAlt")}
          loading="lazy"
          className="size-full rounded-md object-cover"
        />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>{t("tasks.comments.viewImage")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("tasks.comments.imageAlt")}
          </DialogDescription>
          <img
            ref={preview}
            alt={t("tasks.comments.imageAlt")}
            className="max-h-[65dvh] w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

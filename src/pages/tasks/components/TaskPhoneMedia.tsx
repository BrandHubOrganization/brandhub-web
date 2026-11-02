import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Film, Image as ImageIcon, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatFileSize } from "@/lib/utils";
import { MaterialPreview } from "@/pages/library/components/MaterialPreview";
import { postInputWithMaterial } from "@/pages/editor/types/taskPostDraft";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import { useTaskPost } from "@/pages/tasks/hooks/useTaskPost";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import { materialService } from "@/services/materialService";
import type { MaterialItem } from "@/types/material";

const REFRESH_MS = 15_000;
const MAX_POST_MEDIA = 10;

interface Props {
  workspaceId: string;
  taskId: string;
  isPostTask: boolean;
  isAssignee: boolean;
}

export function TaskPhoneMedia({
  workspaceId,
  taskId,
  isPostTask,
  isAssignee,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const media = useQuery({
    queryKey: ["task-phone-media", workspaceId, taskId],
    queryFn: ({ signal }) =>
      materialService.listPage(
        workspaceId,
        { page: 0, size: 50, search: "", deleted: false, taskId },
        signal,
      ),
    refetchInterval: REFRESH_MS,
  });
  const { data: taskPost } = useTaskPost(workspaceId, taskId, isPostTask);
  const post = taskPost?.post;
  const attached = new Set(post?.media.map((item) => item.materialId));

  const attach = useMutation({
    mutationFn: (material: MaterialItem) => {
      if (!post || taskPost?.taskRevision == null) throw new Error("NO_DRAFT");
      return taskPostService.save(workspaceId, taskId, {
        expectedRevision: taskPost.taskRevision,
        expectedPostContentVersion: post.contentVersion,
        post: postInputWithMaterial(
          post,
          material.id,
          material.mediaKind === "VIDEO" ? "VIDEO" : "IMAGE",
        ),
      });
    },
    onSuccess: () => {
      toast.success(t("tasks.phoneMedia.attached"));
      void queryClient.invalidateQueries({
        queryKey: ["task-post", workspaceId, taskId],
      });
    },
    onError: (error) => toast.error(workflowError(error, t)),
  });

  const items = media.data?.items ?? [];
  const canAttach = isAssignee && Boolean(post) && Boolean(taskPost?.canEdit);
  const postFull = (post?.media.length ?? 0) >= MAX_POST_MEDIA;

  return (
    <section
      className="bg-card space-y-3 rounded-xl border p-4"
      aria-label={t("tasks.phoneMedia.title")}
    >
      <header className="flex items-center gap-2">
        <Smartphone className="text-muted-foreground size-4" />
        <h3 className="text-sm font-semibold">{t("tasks.phoneMedia.title")}</h3>
        {media.isFetching && <Spinner className="size-3.5" />}
      </header>

      {media.isLoading ? (
        <p role="status" className="text-muted-foreground text-sm">
          {t("tasks.phoneMedia.loading")}
        </p>
      ) : media.isError ? (
        <div className="flex items-center justify-between gap-2">
          <p role="alert" className="text-destructive text-sm">
            {t("tasks.phoneMedia.loadFailed")}
          </p>
          <Button variant="outline" size="sm" onClick={() => media.refetch()}>
            <RefreshCw className="size-3.5" />
            {t("tasks.phoneMedia.retry")}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("tasks.phoneMedia.empty")}
        </p>
      ) : (
        <>
          {isPostTask && taskPost && !post && !taskPost.blockedReason && (
            <p className="text-muted-foreground text-xs">
              {t("tasks.phoneMedia.noDraft")}
            </p>
          )}
          <ul className="divide-y">
            {items.map((item) => {
              const ready = item.status === "READY";
              const inPost = attached.has(item.id);
              return (
                <li key={item.id} className="space-y-2 py-2">
                  <div className="flex items-center gap-2">
                    {item.mediaKind === "VIDEO" ? (
                      <Film className="text-muted-foreground size-4 shrink-0" />
                    ) : (
                      <ImageIcon className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(item.fileSize ?? 0)}
                        {item.createdByName ? ` · ${item.createdByName}` : ""}
                        {!ready &&
                          ` · ${t(`tasks.phoneMedia.status.${item.status}`, {
                            defaultValue: item.status,
                          })}`}
                      </p>
                    </div>
                    {ready && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-expanded={openId === item.id}
                        onClick={() =>
                          setOpenId(openId === item.id ? null : item.id)
                        }
                      >
                        {t("tasks.phoneMedia.preview")}
                      </Button>
                    )}
                    {inPost ? (
                      <span className="text-muted-foreground text-xs">
                        {t("tasks.phoneMedia.inPost")}
                      </span>
                    ) : (
                      ready &&
                      canAttach && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={attach.isPending || postFull}
                          title={
                            postFull ? t("tasks.phoneMedia.postFull") : undefined
                          }
                          onClick={() => attach.mutate(item)}
                        >
                          {t("tasks.phoneMedia.attach")}
                        </Button>
                      )
                    )}
                  </div>
                  {openId === item.id && (
                    <MaterialPreview
                      material={item}
                      onUnavailable={() => void media.refetch()}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

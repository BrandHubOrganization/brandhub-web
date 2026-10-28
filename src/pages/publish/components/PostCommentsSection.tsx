import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { postDetailService } from "@/pages/publish/services/postDetailService";
import type { Platform } from "@/types/post";
import type { PostCommentItem } from "@/pages/publish/types/postDetail";

interface PostCommentsSectionProps {
  workspaceId: string;
  postId: string;
  activePlatform?: Platform;
  refreshKey?: string | number;
}

interface CommentItemRowProps {
  comment: PostCommentItem;
  avatarFailed: boolean;
  onAvatarError: (id: string) => void;
}

function CommentItemRow({ comment, avatarFailed, onAvatarError }: CommentItemRowProps) {
  const formattedTime = new Date(comment.commentedAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3.5">
        <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
          {comment.authorAvatar && !avatarFailed ? (
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="size-8 rounded-full object-cover"
              onError={() => onAvatarError(comment.id)}
            />
          ) : (
            <User className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-foreground truncate text-xs font-semibold">{comment.authorName}</span>
            <span className="text-muted-foreground flex shrink-0 items-center gap-1 font-mono text-2xs tabular-nums">
              <Clock className="size-3" />
              {formattedTime}
            </span>
          </div>
          <p className="text-foreground max-w-[72ch] text-xs leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function usePostComments(
  workspaceId: string,
  postId: string,
  activePlatform?: Platform,
  refreshKey?: string | number,
) {
  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    postDetailService
      .getComments(workspaceId, postId, activePlatform)
      .then((data) => {
        if (isMounted) {
          setFailedAvatars({});
          setComments(data);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [workspaceId, postId, activePlatform, refreshKey]);

  const markAvatarFailed = (id: string) => setFailedAvatars((prev) => ({ ...prev, [id]: true }));
  return { comments, isLoading, failedAvatars, markAvatarFailed };
}

export function PostCommentsSection({
  workspaceId,
  postId,
  activePlatform,
  refreshKey,
}: PostCommentsSectionProps) {
  const { t } = useTranslation();
  const { comments, isLoading, failedAvatars, markAvatarFailed } = usePostComments(
    workspaceId,
    postId,
    activePlatform,
    refreshKey,
  );

  return (
    <section className="bg-card border-border overflow-hidden rounded-xl border">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-muted-foreground size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            {t("publish.detail.commentsTitle", "Bình luận từ Mạng xã hội")}
          </h3>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-2xs font-medium tabular-nums">
            {comments.length}
          </span>
        </div>
      </div>
      <div className="px-6 py-5">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        )}
        {!isLoading && comments.length === 0 && (
          <div className="py-8 text-center">
            <MessageSquare className="text-muted-foreground mx-auto size-7 opacity-40" />
            <p className="text-muted-foreground mt-2 text-xs">
              {t("publish.detail.noComments", "Chưa có bình luận nào trên bài viết.")}
            </p>
          </div>
        )}
        {!isLoading && comments.length > 0 && (
          <div className="divide-border divide-y">
            {comments.map((comment) => (
              <CommentItemRow
                key={comment.id}
                comment={comment}
                avatarFailed={Boolean(failedAvatars[comment.id])}
                onAvatarError={markAvatarFailed}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

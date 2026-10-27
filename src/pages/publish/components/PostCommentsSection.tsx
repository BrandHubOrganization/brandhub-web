import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostCommentItem } from "../types/postDetail";
import { postDetailService } from "../services/postDetailService";

interface PostCommentsSectionProps {
  workspaceId: string;
  postId: string;
}

export function PostCommentsSection({ workspaceId, postId }: PostCommentsSectionProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    postDetailService
      .getComments(workspaceId, postId)
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceId, postId]);

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-brand-orange size-4" />
          <h3 className="text-foreground text-sm font-bold">
            {t("publish.detail.commentsTitle", "Bình luận từ Mạng xã hội")}
          </h3>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-2xs font-medium">
            {comments.length}
          </span>
        </div>
      </div>

      <div className="p-5">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="py-8 text-center">
            <MessageSquare className="text-muted-foreground mx-auto size-8 opacity-40" />
            <p className="text-muted-foreground text-xs mt-2">
              {t("publish.detail.noComments", "Chưa có bình luận nào trên bài viết.")}
            </p>
          </div>
        )}

        {!isLoading && comments.length > 0 && (
          <div className="divide-border divide-y">
            {comments.map((comment) => (
              <div key={comment.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xs font-semibold">
                        {comment.authorName}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1 font-mono text-2xs">
                        <Clock className="size-3" />
                        {new Date(comment.commentedAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-foreground text-xs whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

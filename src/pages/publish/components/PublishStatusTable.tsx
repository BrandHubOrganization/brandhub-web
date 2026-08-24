import { useTranslation } from "react-i18next";
import { RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface PublishStatusTableProps {
  posts: Post[];
  onRetry: (id: string) => void;
}

export function PublishStatusTable({
  posts,
  onRetry,
}: PublishStatusTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">
              {t("publish.table.title")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("publish.table.platforms")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("publish.table.status")}
            </th>
            <th className="px-4 py-3 font-medium">{t("publish.table.when")}</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-border border-b last:border-0">
              <td className="text-foreground max-w-[200px] truncate px-4 py-3 font-medium">
                {post.title}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {post.platformTargets.map((tgt) => {
                    const meta = PLATFORM_META[tgt.platform];
                    return (
                      <span
                        key={tgt.platform}
                        className={`flex size-6 items-center justify-center rounded-md border ${meta.color}`}
                        title={meta.label}
                      >
                        {meta.icon}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={post.status}>
                  {t(`publish.status.${post.status}`)}
                </Badge>
              </td>
              <td className="text-muted-foreground px-4 py-3">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleString()
                  : post.scheduledAt
                    ? new Date(post.scheduledAt).toLocaleString()
                    : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {post.status === "FAILED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => onRetry(post.id)}
                  >
                    <RotateCw className="size-3.5" /> {t("publish.table.retry")}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

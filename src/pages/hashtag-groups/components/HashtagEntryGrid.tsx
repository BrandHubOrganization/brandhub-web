import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyHashtagToPostButton } from "@/pages/hashtag-groups/components/ApplyHashtagToPostButton";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import type { MemberRole } from "@/types/workspace";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

interface HashtagEntryGridProps {
  entries: HashtagEntry[];
  workspaceId: string;
  userId: string;
  role: MemberRole | null;
  campaignNames: Map<string, string>;
  language: string;
  onRemove: (entry: HashtagEntry) => void;
}

export function HashtagEntryGrid({
  entries,
  workspaceId,
  userId,
  role,
  campaignNames,
  language,
  onRemove,
}: HashtagEntryGridProps) {
  const { t } = useTranslation();
  const prefix = "hashtagGroups.collection.";

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="border-border bg-card space-y-3 rounded-xl border p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold break-all">#{entry.tag}</h3>
            {canRemoveEntry(entry, userId, role) && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={t(prefix + "removeTag", { tag: entry.tag })}
                onClick={() => onRemove(entry)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {t(prefix + "purposes." + entry.purpose)}
            </Badge>
            <Badge variant={entry.isRequired ? "default" : "outline"}>
              {t(prefix + (entry.isRequired ? "required" : "optional"))}
            </Badge>
            {entry.campaignId && (
              <Badge variant="outline">
                {campaignNames.get(entry.campaignId) ??
                  t(prefix + "campaignScope", { id: entry.campaignId })}
              </Badge>
            )}
          </div>
          {role === "CREATOR" && (
            <ApplyHashtagToPostButton
              workspaceId={workspaceId}
              tag={entry.tag}
              isRequired={entry.isRequired}
            />
          )}
          <p className="text-muted-foreground text-sm">
            {t(prefix + "creator")}: {entry.addedByName}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(prefix + "createdAt")}:{" "}
            {new Date(entry.createdAt).toLocaleString(language)}
          </p>
        </article>
      ))}
    </div>
  );
}

function canRemoveEntry(
  entry: Pick<HashtagEntry, "addedBy" | "isRequired">,
  userId: string,
  role: MemberRole | null,
) {
  return (
    role === "MANAGER" ||
    (role === "CREATOR" && (entry.isRequired || entry.addedBy === userId)) ||
    (role === "CLIENT" && entry.addedBy === userId)
  );
}

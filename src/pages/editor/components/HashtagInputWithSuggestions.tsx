import { useState } from "react";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { HashtagCollectionPicker } from "@/pages/editor/components/HashtagCollectionPicker";
import { HashtagTagList } from "@/pages/editor/components/HashtagTagList";
import { HashtagInputToolbar } from "@/pages/editor/components/HashtagInputToolbar";
import {
  formatPostHashtag,
  hasPostHashtag,
  normalizePostHashtag,
} from "@/pages/editor/utils/postHashtag";
import { AddHashtagDialog } from "@/pages/hashtag-groups/components/AddHashtagDialog";
import { useHashtagCollection } from "@/pages/hashtag-groups/hooks/useHashtagCollection";
import { hashtagErrorKey } from "@/pages/hashtag-groups/services/hashtagService";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";

interface HashtagInputWithSuggestionsProps {
  hashtags: string[];
  onChange: (tags: string[]) => void;
  workspaceId?: string;
  userId?: string;
  canApply: boolean;
}

export function HashtagInputWithSuggestions({
  hashtags,
  onChange,
  workspaceId = "",
  userId = "",
  canApply,
}: HashtagInputWithSuggestionsProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [showCollection, setShowCollection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const collectionEnabled = canApply && Boolean(workspaceId && userId);
  const { filter, changeFilter, query, create } = useHashtagCollection(
    workspaceId,
    userId,
    collectionEnabled,
  );

  const prefix = "editor.hashtagInput.";

  function openCollectionFromInput() {
    if (!collectionEnabled) return;
    setShowCollection(true);
    changeFilter({ q: inputValue.replace(/^#/, "") });
  }

  function appendTag(tag: string) {
    const formatted = formatPostHashtag(tag);
    if (!formatted || hasPostHashtag(hashtags, formatted)) {
      return;
    }
    onChange([...hashtags, formatted]);
  }

  function applyEntry(entry: HashtagEntry) {
    if (entry.isRequired) return;
    appendTag(entry.tag);
    setInputValue("");
    changeFilter({ q: "" });
  }

  function applyExistingEntry(tag: string) {
    const existing = query.data?.items.find(
      (entry) => normalizePostHashtag(entry.tag) === normalizePostHashtag(tag),
    );
    if (!existing) return false;
    if (existing.isRequired) {
      toast.info(t(prefix + "campaignTagUnavailable"));
      return true;
    }
    applyEntry(existing);
    return true;
  }

  async function handleAddTag(tagToAdd: string) {
    const formatted = formatPostHashtag(tagToAdd);
    if (!formatted) return;
    if (hasPostHashtag(hashtags, formatted)) {
      setInputValue("");
      return;
    }
    if (!collectionEnabled) {
      appendTag(formatted);
      setInputValue("");

      return;
    }

    if (applyExistingEntry(formatted)) return;

    create.reset();
    setNewTag(formatted);
    setAddDialogOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      void handleAddTag(inputValue);
    }
  }

  function handleCopyAll() {
    if (hashtags.length === 0) return;
    void navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true);
    toast.success(t(prefix + "copyAllSuccess"));
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  }

  return (
    <div className="space-y-2.5">
      <HashtagInputToolbar
        count={hashtags.length}
        copied={copied}
        showCollection={showCollection}
        canLoadCollection={collectionEnabled}
        onCopyAll={handleCopyAll}
        onClear={() => onChange([])}
        onToggleCollection={() => {
          const next = !showCollection;
          setShowCollection(next);
          if (next) {
            setInputValue("");
            changeFilter({ q: "" });
          }
        }}
      />

      {showCollection && collectionEnabled && (
        <HashtagCollectionPicker
          entries={query.data?.items ?? []}
          isPending={query.isPending}
          isError={query.isError}
          search={filter.q}
          onSearchChange={(value) => changeFilter({ q: value })}
          onApply={applyEntry}
        />
      )}

      <div className="relative">
        <Input
          type="text"
          label={t(prefix + "addTagLabel")}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);

            if (collectionEnabled)
              changeFilter({ q: event.target.value.replace(/^#/, "") });
          }}
          onFocus={openCollectionFromInput}
          onClick={openCollectionFromInput}
          onKeyDown={handleKeyDown}
          placeholder={t(prefix + "inputPlaceholder")}
          className="border-border bg-muted text-foreground rounded-xl font-mono text-xs"
        />
      </div>

      <HashtagTagList hashtags={hashtags} onChange={onChange} />

      {addDialogOpen && (
        <AddHashtagDialog
          workspaceId={workspaceId}
          canRequire={false}
          initialTag={newTag}
          pending={create.isPending}
          error={create.error}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={async (payload) => {
            try {
              const entry = await create.mutateAsync(payload);
              appendTag(entry.tag);
              setInputValue("");
              setAddDialogOpen(false);

              toast.success(t(prefix + "addedAndApplied"));
            } catch (error) {
              if (hashtagErrorKey(error, "saveError") === "duplicate") {
                const refreshed = await query.refetch();
                const entry = refreshed.data?.items.find(
                  (item) =>
                    normalizePostHashtag(item.tag) ===
                    normalizePostHashtag(newTag),
                );
                if (entry && !entry.isRequired) {
                  applyEntry(entry);
                  setAddDialogOpen(false);
                  create.reset();
                }
              }
            }
          }}
        />
      )}
    </div>
  );
}

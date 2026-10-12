import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { diffText, yjsStateToText, type DiffPart } from "../contentUtils";

interface VersionEntry {
  snapshotId: string;
  sequenceNumber: number;
  createdAt: string;
  editedBy: string | null;
  editedByName: string | null;
}

interface Props {
  workspaceId: string;
  taskId: string;
  /** Receives the restored base64 Yjs state so the caller can apply it to the live doc. */
  onRestored: (snapshot: string | null) => void;
  /** Bump to re-fetch the list (e.g. after a new snapshot is reported). */
  refreshKey?: number;
}

/** FR 3.6.10 — version history sidebar: who/when, word-level diff vs the previous version, restore. */
export function VersionHistorySidebar({
  workspaceId,
  taskId,
  onRestored,
  refreshKey = 0,
}: Props) {
  const { t, i18n } = useTranslation();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [diff, setDiff] = useState<{
    snapshotId: string;
    parts: DiffPart[];
  } | null>(null);
  const [diffLoadingId, setDiffLoadingId] = useState<string | null>(null);

  const base = `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content/versions`;

  const load = () => {
    api
      .get<{ data: VersionEntry[] }>(base)
      .then(({ data }) => setVersions(data.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, taskId, refreshKey]);

  const handleRestore = async (snapshotId: string) => {
    setRestoringId(snapshotId);
    try {
      const { data } = await api.post<{ data: { snapshot: string | null } }>(
        `${base}/${snapshotId}/restore`,
      );
      onRestored(data.data.snapshot);
      load();
    } finally {
      setRestoringId(null);
    }
  };

  const fetchText = async (snapshotId: string) => {
    const { data } = await api.get<{ data: { snapshot: string | null } }>(
      `${base}/${snapshotId}`,
    );
    return yjsStateToText(data.data.snapshot);
  };

  // Diff is "what this version changed" = previous version → this version
  // (list is newest-first, so the previous one is the next entry).
  const toggleDiff = async (index: number) => {
    const version = versions[index];
    if (diff?.snapshotId === version.snapshotId) {
      setDiff(null);
      return;
    }
    setDiffLoadingId(version.snapshotId);
    try {
      const previous = versions[index + 1];
      const [after, before] = await Promise.all([
        fetchText(version.snapshotId),
        previous ? fetchText(previous.snapshotId) : Promise.resolve(""),
      ]);
      setDiff({
        snapshotId: version.snapshotId,
        parts: diffText(before, after),
      });
    } finally {
      setDiffLoadingId(null);
    }
  };

  return (
    <div className="border-border bg-card w-64 shrink-0 rounded-xl border p-3">
      <h3 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        {t("editor.contentWritingPage.versionHistory", "Version History")}
      </h3>
      {versions.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          {t(
            "editor.contentWritingPage.noVersionsYet",
            "No saved versions yet",
          )}
        </p>
      ) : (
        <ul className="space-y-2">
          {versions.map((v, index) => (
            <li
              key={v.snapshotId}
              className="border-border rounded-lg border p-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground flex flex-col">
                  <span>
                    {new Date(v.createdAt).toLocaleString(
                      i18n.language === "vi" ? "vi-VN" : "en-US",
                    )}
                  </span>
                  <span className="text-foreground font-medium">
                    {v.editedByName ??
                      t("editor.contentWritingPage.unknownEditor", "Unknown")}
                  </span>
                </span>
                <span className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={diffLoadingId === v.snapshotId}
                    onClick={() => toggleDiff(index)}
                  >
                    {diff?.snapshotId === v.snapshotId
                      ? t("editor.contentWritingPage.hideChanges", "Hide")
                      : t("editor.contentWritingPage.viewChanges", "Changes")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={restoringId === v.snapshotId}
                    onClick={() => handleRestore(v.snapshotId)}
                  >
                    {t("editor.contentWritingPage.restore", "Restore")}
                  </Button>
                </span>
              </div>
              {diff?.snapshotId === v.snapshotId && (
                <p className="border-border mt-2 border-t pt-2 wrap-break-word whitespace-pre-wrap">
                  {diff.parts.length === 0 ? (
                    <span className="text-muted-foreground">
                      {t("editor.contentWritingPage.noChanges", "No changes")}
                    </span>
                  ) : (
                    diff.parts.map((part, i) => (
                      <span
                        key={i}
                        className={
                          part.type === "add"
                            ? "rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : part.type === "del"
                              ? "rounded bg-red-100 text-red-800 line-through dark:bg-red-900/40 dark:text-red-300"
                              : undefined
                        }
                      >
                        {part.text}
                      </span>
                    ))
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

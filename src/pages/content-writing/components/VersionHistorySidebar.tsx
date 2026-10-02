import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

interface VersionEntry {
  snapshotId: string;
  sequenceNumber: number;
  createdAt: string;
}

interface Props {
  workspaceId: string;
  taskId: string;
  onRestored: () => void;
}

/** FR 3.6.10 — rudimentary version history sidebar (plan.md §4). */
export function VersionHistorySidebar({ workspaceId, taskId, onRestored }: Props) {
  const { t, i18n } = useTranslation();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = () => {
    api
      .get<{ data: VersionEntry[] }>(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content/versions`,
      )
      .then(({ data }) => setVersions(data.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, taskId]);

  const handleRestore = async (snapshotId: string) => {
    setRestoringId(snapshotId);
    try {
      await api.post(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/content/versions/${snapshotId}/restore`,
      );
      load();
      onRestored();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="border-border bg-card w-64 shrink-0 rounded-xl border p-3">
      <h3 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        {t("editor.contentWritingPage.versionHistory", "Version History")}
      </h3>
      {versions.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          {t("editor.contentWritingPage.noVersionsYet", "No saved versions yet")}
        </p>
      ) : (
        <ul className="space-y-2">
          {versions.map((v) => (
            <li
              key={v.snapshotId}
              className="border-border flex items-center justify-between gap-2 rounded-lg border p-2 text-xs"
            >
              <span className="text-muted-foreground">
                {new Date(v.createdAt).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                loading={restoringId === v.snapshotId}
                onClick={() => handleRestore(v.snapshotId)}
              >
                {t("editor.contentWritingPage.restore", "Restore")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

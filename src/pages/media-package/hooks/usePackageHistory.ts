import { useEffect, useState } from "react";
import { mediaPackageService } from "../services/mediaPackageService";
import type { PackageNegotiationHistoryPage } from "../types/mediaPackage";

export function usePackageHistory(workspaceId: string, version: number, open: boolean) {
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: PackageNegotiationHistoryPage; error?: boolean }>();
  const key = `${workspaceId}:${version}:${page}:${revision}`;
  useEffect(() => {
    if (!open || !workspaceId) return;
    let active = true;
    mediaPackageService.history(workspaceId, page).then(response => {
      if (active) setResult({ key, data: response.data.data });
    }).catch(() => { if (active) setResult({ key, error: true }); });
    return () => { active = false; };
  }, [workspaceId, page, key, open]);
  return { page, setPage, loading: result?.key !== key, data: result?.key === key ? result.data : undefined,
    error: result?.key === key && result.error, reload: () => setRevision(value => value + 1) };
}

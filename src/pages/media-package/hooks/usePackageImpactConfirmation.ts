import { useEffect, useRef, useState } from "react";
import type { PackageChangeImpact } from "@/pages/media-package/services/packagePlanningService";

export function usePackageImpactConfirmation(workspaceId: string) {
  const [impact, setImpact] = useState<PackageChangeImpact | null>(null);
  const pending = useRef<((ids: string[] | null) => void) | null>(null);
  useEffect(
    () => () => {
      pending.current?.(null);
      pending.current = null;
    },
    [workspaceId],
  );
  function decide(ids: string[] | null) {
    pending.current?.(ids);
    pending.current = null;
    setImpact(null);
  }
  function confirm(value: PackageChangeImpact) {
    return new Promise<string[] | null>((resolve) => {
      pending.current?.(null);
      pending.current = resolve;
      setImpact(value);
    });
  }
  return { impact, confirm, decide };
}

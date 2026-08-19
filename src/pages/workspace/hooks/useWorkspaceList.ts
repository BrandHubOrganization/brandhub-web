import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { Workspace } from "@/types/workspace";

export function useWorkspaceList() {
  const { t } = useTranslation();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workspaceService
      .list()
      .then(({ data }) => setWorkspaces(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [t]);

  return { workspaces, loading };
}

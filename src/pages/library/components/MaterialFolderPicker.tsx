import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
export function MaterialFolderPicker({
  workspace,
  exclude,
  onChoose,
  onCancel,
}: {
  workspace: string;
  exclude?: string;
  onChoose: (id: string | null) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const [parent, setParent] = useState<string>();
  const query = useQuery({
    queryKey: ["material-folder-picker", workspace, actor, role, parent],
    queryFn: ({ signal }) =>
      materialService.browse(
        workspace,
        {
          page: 0,
          size: 1,
          search: "",
          deleted: false,
          folderId: parent,
          tab: role === "CLIENT" ? "CLIENT_VAULT" : "LIBRARY",
        },
        signal,
      ),
    retry: false,
  });
  const label = (key: string) => t(`materials.repository.${key}`);
  return (
    <section
      className="border-border space-y-3 rounded-lg border p-3"
      aria-label={label("chooseDestination")}
    >
      <nav className="flex flex-wrap gap-2" aria-label={label("breadcrumb")}>
        <Button variant="ghost" onClick={() => setParent(undefined)}>
          {label("root")}
        </Button>
        {query.data?.breadcrumbs.map((folder) => (
          <Button
            variant="ghost"
            key={folder.id}
            onClick={() => setParent(folder.id)}
          >
            {folder.name}
          </Button>
        ))}
      </nav>
      {query.isPending ? (
        <p role="status">{label("loading")}</p>
      ) : query.isError ? (
        <p role="alert">{label("failed")}</p>
      ) : (
        query.data?.folders
          .filter((folder) => folder.id !== exclude)
          .map((folder) => (
            <Button
              variant="outline"
              key={folder.id}
              onClick={() => setParent(folder.id)}
            >
              <Folder className="size-4" />
              {folder.name}
            </Button>
          ))
      )}
      <div className="flex gap-2">
        <Button
          disabled={query.isPending || query.isError || parent === exclude}
          onClick={() => onChoose(parent ?? null)}
        >
          {label("chooseHere")}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {label("cancel")}
        </Button>
      </div>
    </section>
  );
}

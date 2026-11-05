import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { materialService } from "@/services/materialService";
import { MaterialFolderPicker } from "@/pages/library/components/MaterialFolderPicker";
import { formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";
export function MaterialVersionHistoryPanel({
  material,
}: {
  material: MaterialItem;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [moving, setMoving] = useState(false);
  const label = (key: string) => t(`materials.repository.${key}`);
  const query = useQuery({
    queryKey: ["material-versions", material.workspaceId, material.id],
    queryFn: ({ signal }) =>
      materialService.listVersions(material.workspaceId, material.id, signal),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ["material-versions", material.workspaceId, material.id],
      });
      void client.invalidateQueries({ queryKey: ["material-detail"] });
      void client.invalidateQueries({ queryKey: ["materials"] });
      void client.invalidateQueries({ queryKey: ["material-storage-usage"] });
      setMoving(false);
    },
    onError: () => toast.error(label("failed")),
  });
  return (
    <section className="space-y-3 border-t pt-4">
      <h3 className="font-semibold">
        {label("versionHistory")}{" "}
        <span className="text-muted-foreground">
          v{material.currentVersionNumber ?? 1}
        </span>
      </h3>
      {material.capabilities?.canRename &&
        material.scopeType !== "CLIENT_VAULT" && (
          <Button variant="outline" onClick={() => setMoving(!moving)}>
            {label("moveFile")}
          </Button>
        )}
      {moving && (
        <MaterialFolderPicker
          workspace={material.workspaceId}
          onCancel={() => setMoving(false)}
          onChoose={(target) =>
            mutation.mutate(() =>
              materialService.moveMaterial(
                material.workspaceId,
                material.id,
                target,
              ),
            )
          }
        />
      )}
      {query.isPending ? (
        <p role="status">{label("loading")}</p>
      ) : query.isError ? (
        <div role="alert">
          {label("failed")}
          <Button variant="ghost" onClick={() => void query.refetch()}>
            {label("retry")}
          </Button>
        </div>
      ) : !query.data?.length ? (
        <p className="text-muted-foreground text-sm">{label("noVersions")}</p>
      ) : (
        query.data.map((version) => (
          <article
            key={version.id}
            className="border-border space-y-2 rounded-md border p-3"
          >
            <p>
              v{version.versionNumber} · {formatFileSize(version.fileSize)} ·{" "}
              {new Date(version.createdAt).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate(async () => {
                    const result = await materialService.downloadVersion(
                      material.workspaceId,
                      material.id,
                      version.id,
                    );
                    const anchor = document.createElement("a");
                    anchor.href = result.downloadUrl;
                    anchor.rel = "noopener noreferrer";
                    anchor.click();
                  })
                }
              >
                {label("download")}
              </Button>
              {material.capabilities?.canRename && (
                <>
                  <Button
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm(label("restoreVersionConfirm")))
                        mutation.mutate(() =>
                          materialService.restoreVersion(
                            material.workspaceId,
                            material.id,
                            version.id,
                          ),
                        );
                    }}
                  >
                    {label("restore")}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm(label("deleteVersionConfirm")))
                        mutation.mutate(() =>
                          materialService.deleteVersion(
                            material.workspaceId,
                            material.id,
                            version.id,
                          ),
                        );
                    }}
                  >
                    {label("delete")}
                  </Button>
                </>
              )}
            </div>
          </article>
        ))
      )}
    </section>
  );
}

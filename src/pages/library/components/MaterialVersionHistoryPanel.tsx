import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  FolderInput,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { MaterialFolderPicker } from "./MaterialFolderPicker";
import type { MaterialItem } from "@/types/material";

export function MaterialVersionHistoryPanel({
  workspaceId,
  material,
  canEdit,
  onChanged,
}: {
  workspaceId: string;
  material: MaterialItem;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const client = useQueryClient();
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const [moving, setMoving] = useState(false);

  const canMove =
    canEdit &&
    !material.deletedAt &&
    (role === "CLIENT" || material.scopeType !== "CLIENT_VAULT");

  const query = useQuery({
    queryKey: ["material-versions", workspaceId, material.id],
    queryFn: ({ signal }) =>
      materialService.listVersions(workspaceId, material.id, signal),
    retry: false,
  });

  const refresh = () => {
    void query.refetch();
    void client.invalidateQueries({ queryKey: ["materials", workspaceId] });
    onChanged();
  };

  const move = async (target: string | null) => {
    try {
      await materialService.moveMaterial(workspaceId, material.id, target);
      setMoving(false);
      refresh();
      toast.success("Đã di chuyển tệp thành công");
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể di chuyển tệp",
      );
    }
  };

  const versions = query.data ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/25 px-4 py-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <History className="h-3.5 w-3.5 text-brand-orange" />
          <span>Lịch sử phiên bản</span>
          {versions.length > 0 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
              {versions.length}
            </span>
          )}
        </div>

        {canMove && (
          <Button
            type="button"
            size="sm"
            variant={moving ? "orange" : "outline"}
            onClick={() => setMoving((prev) => !prev)}
            className={`h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-colors ${
              moving
                ? "border-brand-orange bg-brand-orange text-white hover:bg-brand-orange/90 hover:text-white"
                : "text-foreground hover:border-brand-orange/50 hover:bg-brand-orange/10 hover:text-brand-orange"
            }`}
          >
            <FolderInput className="h-3 w-3" />
            <span>Di chuyển thư mục</span>
          </Button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {moving && (
          <MaterialFolderPicker
            workspace={workspaceId}
            onChoose={(id) => void move(id)}
            onCancel={() => setMoving(false)}
          />
        )}

        {versions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Tệp đang ở phiên bản gốc (v1), chưa có bản ghi đè trước đó.
          </p>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
              >
                <span className="truncate font-medium text-foreground">
                  <strong className="text-brand-orange">
                    v{version.versionNumber}
                  </strong>{" "}
                  • {version.name || material.name}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void materialService
                        .downloadVersion(workspaceId, material.id, version.id)
                        .then((d) =>
                          window.open(
                            d.downloadUrl,
                            "_blank",
                            "noopener,noreferrer",
                          ),
                        )
                        .catch(() =>
                          toast.error("Không thể tải phiên bản này"),
                        )
                    }
                    className="h-7 rounded-lg px-2 text-xs font-semibold text-foreground hover:bg-brand-orange/10 hover:text-brand-orange"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Tải
                  </Button>

                  {canEdit && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void materialService
                            .restoreVersion(
                              workspaceId,
                              material.id,
                              version.id,
                            )
                            .then(refresh)
                            .catch(() =>
                              toast.error("Không thể khôi phục phiên bản"),
                            )
                        }
                        className="h-7 rounded-lg px-2 text-xs font-semibold text-foreground hover:border-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Khôi phục
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          void materialService
                            .deleteVersion(workspaceId, material.id, version.id)
                            .then(refresh)
                            .catch(() =>
                              toast.error("Không thể xoá phiên bản"),
                            )
                        }
                        className="h-7 rounded-lg px-2 text-xs font-semibold text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

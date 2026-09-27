import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Plus, Trash2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ConfirmDialog,
} from "@/components/ui/dialog";
import { clientProfileService } from "@/services/clientProfileService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";
import type { ClientProfile } from "@/types/clientProfile";
import { ClientProfileForm } from "./components/ClientProfileForm";

export function ClientProfileListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    clientProfileService
      .listMine()
      .then(({ data }) => setProfiles(data.data ?? []))
      .catch((err: unknown) => {
        // Chưa có hồ sơ nào (404) là bình thường — hiện empty state, không báo lỗi.
        if (isNotFoundError(err)) return;
        toast.error(
          extractErrorMessage(err, t("clientProfile.list.loadError")),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [t]);

  const handleCreate = async (
    data: Parameters<typeof clientProfileService.create>[0],
  ) => {
    setCreating(true);
    try {
      await clientProfileService.create(data);
      toast.success(t("clientProfile.list.createSuccess"));
      setCreateOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("clientProfile.list.createError")),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clientProfileService.deleteById(deleteTarget.id);
      toast.success(t("clientProfile.list.deleteSuccess"));
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("clientProfile.list.deleteError")),
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("clientProfile.list.title")}
      description={t("clientProfile.list.description")}
      actions={
        <Button
          variant="orange"
          className="gap-1.5"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("clientProfile.list.createButton")}
        </Button>
      }
    >
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <Building2 className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {t("clientProfile.list.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="border-border bg-card rounded-xl border p-4"
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 text-left"
                onClick={() => navigate(`/client-profiles/${p.id}`)}
              >
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {p.displayName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {p.company || "—"}
                  </p>
                </div>
              </button>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive gap-1.5 text-xs"
                  onClick={() => setDeleteTarget(p)}
                >
                  <Trash2 className="size-3.5" />
                  {t("clientProfile.list.deleteButton")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clientProfile.list.createButton")}</DialogTitle>
          </DialogHeader>
          <ClientProfileForm
            submitting={creating}
            submitLabel={t("clientProfile.save")}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        variant="danger"
        title={t("clientProfile.list.deleteConfirmTitle")}
        description={t("clientProfile.list.deleteConfirmDescription")}
      />
    </PageWrapper>
  );
}

export default ClientProfileListPage;

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { clientProfileService } from "@/services/clientProfileService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";
import type { ClientProfile } from "@/types/clientProfile";
import {
  ClientProfileForm,
  type ClientProfileFormValues,
} from "./components/ClientProfileForm";
import { ClientProfilePreview } from "./components/ClientProfilePreview";

export function ClientProfileListPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ClientProfile | null>(null);
  const [previewValues, setPreviewValues] =
    useState<ClientProfileFormValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  // Hồ sơ user muốn chuyển sang (hoặc null = về chế độ tạo mới) khi form đang
  // có dữ liệu chưa lưu — chờ xác nhận huỷ trong ConfirmDialog.
  const [pendingSwitch, setPendingSwitch] = useState<
    ClientProfile | null | undefined
  >(undefined);
  const formRef = useRef<HTMLDivElement>(null);

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

  // Form dùng useState nên không tự nhận `initial` mới — đổi key để remount,
  // đồng thời đưa preview về giá trị của hồ sơ vừa chọn.
  const applySwitch = (profile: ClientProfile | null) => {
    setEditing(profile);
    setFormDirty(false);
    setPendingSwitch(undefined);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const requestSwitch = (profile: ClientProfile | null) => {
    if (formDirty) setPendingSwitch(profile);
    else applySwitch(profile);
  };

  const handleSubmit = async (
    data: Parameters<typeof clientProfileService.create>[0],
  ) => {
    setSaving(true);
    try {
      if (editing) {
        await clientProfileService.updateById(editing.id, data);
        toast.success(t("clientProfile.saveSuccess"));
      } else {
        await clientProfileService.create(data);
        toast.success(t("clientProfile.list.createSuccess"));
      }
      applySwitch(null);
      load();
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(
          err,
          t(
            editing
              ? "clientProfile.saveError"
              : "clientProfile.list.createError",
          ),
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clientProfileService.deleteById(deleteTarget.id);
      toast.success(t("clientProfile.list.deleteSuccess"));
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      // Đang sửa đúng hồ sơ vừa xoá → quay về form tạo mới.
      if (editing?.id === deleteTarget.id) applySwitch(null);
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
        editing ? (
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => requestSwitch(null)}
          >
            <Plus className="size-4" />
            {t("clientProfile.list.createButton")}
          </Button>
        ) : null
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div ref={formRef} className="scroll-mt-6 lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-6">
            <div className="mb-4">
              <h2 className="text-foreground text-lg font-semibold">
                {editing
                  ? t("clientProfile.list.formTitleEdit")
                  : t("clientProfile.list.formTitleCreate")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {editing
                  ? t("clientProfile.list.formDescriptionEdit")
                  : t("clientProfile.list.formDescriptionCreate")}
              </p>
            </div>
            <ClientProfileForm
              key={editing?.id ?? "new"}
              initial={editing}
              submitting={saving}
              submitLabel={
                editing ? t("clientProfile.save") : t("clientProfile.create")
              }
              onSubmit={handleSubmit}
              onCancel={editing ? () => requestSwitch(null) : undefined}
              onDirtyChange={setFormDirty}
              onValuesChange={setPreviewValues}
            />
          </div>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 lg:sticky lg:top-6">
          <ClientProfilePreview values={previewValues} />
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-foreground text-lg font-semibold">
            {t("clientProfile.list.existingTitle")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("clientProfile.list.existingDescription")}
          </p>
        </div>

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
                className={`bg-card rounded-xl border p-4 ${
                  editing?.id === p.id ? "border-brand-orange" : "border-border"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-3 text-left"
                  onClick={() => requestSwitch(p)}
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
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => requestSwitch(p)}
                  >
                    <Pencil className="size-3.5" />
                    {t("clientProfile.editButton")}
                  </Button>
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
      </section>

      <ConfirmDialog
        isOpen={pendingSwitch !== undefined}
        onClose={() => setPendingSwitch(undefined)}
        onConfirm={() => applySwitch(pendingSwitch ?? null)}
        variant="danger"
        title={t("clientProfile.list.discardTitle")}
        description={t("clientProfile.list.discardDescription")}
        confirmText={t("clientProfile.list.discardConfirm")}
      />

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

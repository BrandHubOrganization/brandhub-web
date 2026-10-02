import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { clientProfileService } from "@/services/clientProfileService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";
import type { ClientProfile } from "@/types/clientProfile";
import { cn } from "@/lib/utils";
import {
  ClientProfileForm,
  type ClientProfileFormValues,
} from "./components/ClientProfileForm";
import { ClientProfilePreview } from "./components/ClientProfilePreview";
import { ClientProfileLogo } from "./components/ClientProfileLogo";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";

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
      fullWidth
      bannerBadge={t("clientProfile.list.badge", "Hồ sơ thương hiệu")}
      bannerImage={BANNER_PRESETS[0]?.url}
      introSummary="Hồ sơ thương hiệu (Client Profile) định danh phong cách trực quan gồm Logo, Tên pháp nhân, Bảng màu và Tagline. Các thông tin này sẽ được tự động đồng bộ vào bài đăng và hình ảnh quảng cáo của các Workspace thuộc quyền quản lý của bạn."
      guideUrl="/help/guide#agency"
      actions={
        editing ? (
          <Button
            variant="outline"
            className="gap-1.5 cursor-pointer shadow-xs bg-card/90 backdrop-blur-xs text-foreground hover:bg-card border-white/20"
            onClick={() => requestSwitch(null)}
          >
            <Plus className="size-4" />
            {t("clientProfile.list.createButton")}
          </Button>
        ) : null
      }
    >
      {/* 1. Existing Profiles List */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-foreground text-base font-semibold tracking-tight">
              {t("clientProfile.list.existingTitle")}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("clientProfile.list.existingDescription")}
            </p>
          </div>
          {profiles.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full w-fit">
              {profiles.length} {t("clientProfile.list.profilesCount", "hồ sơ")}
            </span>
          )}
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center bg-card/40">
            <Building2 className="text-muted-foreground/50 size-10" />
            <p className="text-muted-foreground text-xs max-w-sm">
              {t("clientProfile.list.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {profiles.map((p) => {
              const isSelected = editing?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group relative bg-card rounded-xl border p-4 transition-all duration-200 shadow-xs hover:shadow-md",
                    isSelected
                      ? "border-brand-orange ring-2 ring-brand-orange/20 bg-brand-orange/[0.02]"
                      : "border-border hover:border-border/80",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 text-left"
                    onClick={() => requestSwitch(p)}
                  >
                    <div className="size-11 shrink-0 overflow-hidden rounded-full border border-border bg-muted/40 shadow-xs">
                      <ClientProfileLogo
                        logoUrl={p.logoUrl}
                        displayName={p.displayName}
                        iconClassName="size-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-semibold group-hover:text-brand-orange transition-colors">
                        {p.displayName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.company || p.tagline || "—"}
                      </p>
                    </div>
                  </button>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs h-7 px-2 cursor-pointer"
                      onClick={() => requestSwitch(p)}
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      {t("clientProfile.editButton")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 gap-1.5 text-xs h-7 px-2 cursor-pointer"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 className="size-3.5" />
                      {t("clientProfile.list.deleteButton")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Form & Live Preview Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div
          ref={formRef}
          className="scroll-mt-6 lg:col-span-7 xl:col-span-7 space-y-4"
        >
          <div className="space-y-0.5">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              {editing
                ? t("clientProfile.list.formTitleEdit")
                : t("clientProfile.list.formTitleCreate")}
            </h2>
            <p className="text-muted-foreground text-xs">
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

        {/* RIGHT COLUMN: Live Profile Preview (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="size-3.5 text-brand-orange" />
              {t("clientProfile.preview.title", "Xem trước hồ sơ")}
            </span>
            <span className="rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
              {t("agency.create.previewBadge", "Cập nhật trực tiếp")}
            </span>
          </div>

          <ClientProfilePreview values={previewValues} />
        </div>
      </div>

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

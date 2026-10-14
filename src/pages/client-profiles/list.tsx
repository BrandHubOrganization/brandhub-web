import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export function ClientProfileListPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ClientProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
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

  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.displayName?.toLowerCase().includes(query) ||
          p.company?.toLowerCase().includes(query) ||
          p.tagline?.toLowerCase().includes(query) ||
          p.industry?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name_asc":
          return (a.displayName || "").localeCompare(b.displayName || "");
        case "name_desc":
          return (b.displayName || "").localeCompare(a.displayName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [profiles, searchQuery, sortOption]);

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
      bannerBadge={t("clientProfile.list.badge", "Hồ sơ khách hàng")}
      bannerImage={BANNER_PRESETS[0]?.url}
      introSummary="Hồ sơ khách hàng (Client Profile) định danh phong cách trực quan gồm Logo, Tên pháp nhân, Bảng màu và Tagline. Các thông tin này sẽ được tự động đồng bộ vào bài đăng và hình ảnh quảng cáo của các Workspace thuộc quyền quản lý của bạn."
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
      <section className="space-y-3.5">
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
              {filteredProfiles.length !== profiles.length
                ? `${filteredProfiles.length} / ${profiles.length} ${t("clientProfile.list.profilesCount", "hồ sơ")}`
                : `${profiles.length} ${t("clientProfile.list.profilesCount", "hồ sơ")}`}
            </span>
          )}
        </div>

        {/* Search & Sort Controls */}
        {profiles.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card p-2.5 shadow-2xs">
            <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4" />
              <Input
                type="text"
                placeholder={t(
                  "clientProfile.list.searchPlaceholder",
                  "Tìm kiếm theo tên, công ty, tagline...",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-9 pr-8 text-xs bg-muted/30 border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5"
                  title={t("clientProfile.list.clearSearch", "Xóa bộ lọc")}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-8.5 text-xs py-0 pr-8"
                wrapperClassName="w-[155px] sm:w-[170px]"
              >
                <option value="newest">
                  {t("clientProfile.list.sortNewest", "Mới nhất")}
                </option>
                <option value="oldest">
                  {t("clientProfile.list.sortOldest", "Cũ nhất")}
                </option>
                <option value="name_asc">
                  {t("clientProfile.list.sortNameAsc", "Tên: A → Z")}
                </option>
                <option value="name_desc">
                  {t("clientProfile.list.sortNameDesc", "Tên: Z → A")}
                </option>
              </Select>
            </div>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center bg-card/40">
            <Building2 className="text-muted-foreground/50 size-10" />
            <p className="text-muted-foreground text-xs max-w-sm">
              {t("clientProfile.list.empty")}
            </p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-border py-10 text-center bg-card/40">
            <Search className="text-muted-foreground/50 size-8" />
            <p className="text-muted-foreground text-xs font-medium">
              {t(
                "clientProfile.list.noSearchResults",
                "Không tìm thấy hồ sơ nào phù hợp.",
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7.5 cursor-pointer mt-1"
              onClick={() => setSearchQuery("")}
            >
              {t("clientProfile.list.clearSearch", "Xóa bộ lọc")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProfiles.map((p) => {
              const isSelected = editing?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group relative bg-card rounded-xl border overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md flex flex-col",
                    isSelected
                      ? "border-brand-orange ring-2 ring-brand-orange/20 bg-brand-orange/[0.02]"
                      : "border-border hover:border-border/80",
                  )}
                >
                  {/* Top Cover Banner */}
                  <div className="relative h-20 w-full shrink-0 overflow-hidden bg-muted/40">
                    {p.bannerUrl ? (
                      <img
                        src={p.bannerUrl}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                      />
                    ) : (
                      <div
                        className="size-full select-none"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(var(--brand-orange-soft, 15 100% 96%)) 0%, hsl(var(--muted)/0.25) 100%)",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-3.5 pt-0 flex-1 flex flex-col justify-between">
                    <button
                      type="button"
                      className="flex flex-col w-full cursor-pointer text-left"
                      onClick={() => requestSwitch(p)}
                    >
                      <div className="relative -mt-6 mb-2 flex items-end">
                        <div className="size-12 shrink-0 overflow-hidden rounded-xl border-2 border-card bg-card shadow-md flex items-center justify-center">
                          <ClientProfileLogo
                            logoUrl={p.logoUrl}
                            displayName={p.displayName}
                            iconClassName="size-5"
                          />
                        </div>
                      </div>
                      <p className="text-foreground truncate text-sm font-semibold group-hover:text-brand-orange transition-colors">
                        {p.displayName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs mt-0.5">
                        {p.company || p.tagline || "—"}
                      </p>
                    </button>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
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

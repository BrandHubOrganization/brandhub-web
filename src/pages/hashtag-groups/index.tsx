import PageWrapper from "@/components/layout/PageWrapper";
import { HashtagGroupFormModal } from "@/pages/hashtag-groups/components/HashtagGroupFormModal";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useHashtagGroups } from "./hooks/useHashtagGroups";
import { HashtagGroupGrid } from "./components/HashtagGroupGrid";
import { useTranslation } from "react-i18next";

export function HashtagGroupsPage() {
  const { t } = useTranslation();
  const {
    groups,
    search,
    setSearch,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    editingGroup,
    deletingGroup,
    setDeletingGroup,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleConfirmDelete,
  } = useHashtagGroups();

  return (
    <PageWrapper
      title={t("hashtagGroups.page.title")}
      description={t("hashtagGroups.page.description")}
      actions={
        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs font-semibold text-white"
          size="sm"
        >
          <Plus className="mr-1 size-4" />
          <span>{t("hashtagGroups.page.createButton")}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:flex-row dark:border-zinc-800 dark:bg-zinc-900">
          <div className="w-full sm:w-96">
            <Input
              iconPrefix={<Search className="size-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("hashtagGroups.page.searchPlaceholder")}
              className="text-xs"
            />
          </div>

          <div className="self-end text-xs font-medium text-zinc-500 sm:self-center dark:text-zinc-400">
            {t("hashtagGroups.page.showingCount", { count: groups.length })}
          </div>
        </div>

        <HashtagGroupGrid
          groups={groups}
          isLoading={isLoading}
          onCreate={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={setDeletingGroup}
        />
      </div>

      <HashtagGroupFormModal
        isOpen={isFormOpen}
        initialData={editingGroup}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title={t("hashtagGroups.deleteDialog.title", {
          name: deletingGroup?.name,
        })}
        description={t("hashtagGroups.deleteDialog.description")}
        confirmText={t("hashtagGroups.deleteDialog.confirmText")}
        cancelText={t("hashtagGroups.deleteDialog.cancelText")}
        variant="danger"
        isLoading={isDeleting}
      />
    </PageWrapper>
  );
}

export default HashtagGroupsPage;

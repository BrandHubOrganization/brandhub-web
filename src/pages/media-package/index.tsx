import { packageMutationError } from "@/pages/media-package/lib/packageMutationError";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CreateCustomPackageForm } from "@/pages/media-package/components/CreateCustomPackageForm";
import { WorkspacePackageOverview } from "@/pages/media-package/components/WorkspacePackageOverview";
import { MediaPackageLoadingState } from "@/pages/media-package/components/MediaPackagePageState";
import { packagePlanningService } from "@/pages/media-package/services/packagePlanningService";
import { mediaPackageService } from "@/pages/media-package/services/mediaPackageService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type {
  MediaPackage,
  CreateCustomMediaPackageRequest,
} from "@/pages/media-package/types/mediaPackage";

export default function WorkspaceMediaPackagePage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const client = useQueryClient();
  const role = useWorkspaceStore(
    (s) =>
      s.workspaceList.find((w) => w.id === id)?.myRole ??
      (s.currentWorkspace?.id === id ? s.currentMemberRole : null),
  );
  const canManage = role === "MANAGER" || role === "OWNER";
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState<{
    workspaceId: string;
    packageId: string;
  } | null>(null);
  const canBrowse = canManage || role === "CLIENT";
  const [template, setTemplate] = useState<MediaPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [affectedTasks, setAffectedTasks] = useState<
    { taskId: string; name: string }[]
  >([]);
  const request = useRef<{ payload: string; id: string } | null>(null);
  const selection = useQuery({
    queryKey: ["workspace-package", id],
    queryFn: () => packagePlanningService.selection(id),
    enabled: !!id,
  });
  const preparation = useQuery({
    queryKey: ["package-preparation", id],
    queryFn: () => packagePlanningService.status(id),
    enabled: !!id,
    refetchInterval: (q) =>
      ["PENDING", "PROCESSING"].includes(q.state.data?.status ?? "")
        ? 3000
        : false,
  });
  const catalog = useQuery({
    queryKey: ["workspace-package-catalog", id],
    queryFn: async () =>
      (await mediaPackageService.listAvailableForWorkspace(id)).data.data,
    enabled: !!id && canBrowse,
  });
  const current = selection.data;
  const details: MediaPackage | null = current
    ? ({
        ...current.mediaPackage,
        ...current.finalTerms,
        sourceTemplateId: current.mediaPackage.sourceTemplateId,
      } as MediaPackage)
    : null;
  const viewedId = viewing?.workspaceId === id ? viewing.packageId : null;
  const viewedPackage =
    viewedId === details?.id
      ? details
      : (catalog.data?.find((item) => item.id === viewedId) ??
        details ??
        catalog.data?.[0] ??
        null);
  const locked = preparation.data
    ? !preparation.data.canEditPackage
    : !!current;
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["workspace-package", id] }),
      client.invalidateQueries({ queryKey: ["package-preparation", id] }),
    ]);
  }
  async function save(value: CreateCustomMediaPackageRequest) {
    setBusy(true);
    const packageDetails = {
      ...value,
      sourceTemplateId:
        template?.id === current?.mediaPackage.id
          ? (template?.sourceTemplateId ?? undefined)
          : template?.id,
      workspaceId: id,
    };
    const payload = JSON.stringify(packageDetails);
    if (request.current?.payload !== payload)
      request.current = { payload, id: crypto.randomUUID() };
    try {
      const impact = await packagePlanningService.impact(
        id,
        packageDetails,
        current?.termsVersion ?? 0,
        request.current.id,
      );
      setAffectedTasks(impact.affectedTasks);
      if (impact.blocked) {
        toast.error(t("campaign.errors.PACKAGE_IMPACT_BLOCKED"));
        return false;
      }
      await packagePlanningService.save(
        id,
        packageDetails,
        current?.termsVersion ?? 0,
        request.current.id,
      );
      request.current = null;
      setEditing(false);
      setViewing(null);
      await refresh();
      toast.success(t("mediaPackage.workspace.saved"));
      return true;
    } catch (e) {
      toast.error(
        packageMutationError(e, t("mediaPackage.workspace.saveError"), t),
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    if (!preparation.data) return;
    setBusy(true);
    try {
      await packagePlanningService.retry(id, preparation.data.termsVersion);
      await refresh();
    } catch (e) {
      toast.error(
        packageMutationError(e, t("mediaPackage.workspace.saveError"), t),
      );
    } finally {
      setBusy(false);
    }
  }
  const pending = ["PENDING", "PROCESSING"].includes(
    preparation.data?.status ?? "",
  );
  const canEdit =
    canManage &&
    !locked &&
    !pending &&
    !selection.isPending &&
    !preparation.isPending &&
    !selection.isError &&
    !preparation.isError;
  function edit(value: MediaPackage | null) {
    if (!canEdit) return;
    setTemplate(value);
    setViewing(value ? { workspaceId: id, packageId: value.id } : null);
    setAffectedTasks([]);
    setEditing(true);
  }
  return (
    <PageWrapper
      compact
      hideHeader={editing}
      className={
        editing
          ? "h-full min-h-0 overflow-hidden p-2 pb-2 md:p-3 md:pb-3"
          : "h-full overflow-y-auto pb-4 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:pb-4"
      }
      contentClassName={
        editing ? undefined : "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
      }
      showGuideButton={false}
      title={t("mediaPackage.workspacePage.title")}
    >
      <div
        className={
          editing
            ? "space-y-4"
            : "space-y-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-3 lg:space-y-0"
        }
      >
        {(selection.isPending || preparation.isPending) && (
          <MediaPackageLoadingState />
        )}
        {(selection.isError || preparation.isError) && (
          <div role="alert" className="rounded-xl border p-5">
            {t("mediaPackage.workspace.saveError")}
            <Button variant="outline" onClick={() => void refresh()}>
              {t("mediaPackage.guest.retry")}
            </Button>
          </div>
        )}
        {preparation.data &&
          ["PENDING", "PROCESSING", "FAILED", "DEPLOYING", "DEPLOYED"].includes(
            preparation.data.status,
          ) && (
            <section
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              role="status"
            >
              <span>
                {t(
                  `mediaPackage.workspace.preparation.${preparation.data.status}`,
                )}
              </span>
              {preparation.data.status === "FAILED" && (
                <Button disabled={busy} onClick={() => void retry()}>
                  {t("mediaPackage.workspace.retry")}
                </Button>
              )}
            </section>
          )}
        {editing && affectedTasks.length > 0 && (
          <section
            role="alert"
            className="border-destructive/40 rounded-xl border p-4"
          >
            <p>{t("campaign.errors.PACKAGE_IMPACT_BLOCKED")}</p>
            <ul className="mt-2 list-disc pl-5">
              {affectedTasks.map((task) => (
                <li key={task.taskId}>{task.name}</li>
              ))}
            </ul>
          </section>
        )}
        {editing && (
          <CreateCustomPackageForm
            key={template?.id ?? "new"}
            open
            editing={Boolean(selection.data)}
            sourceTemplate={template}
            loading={busy}
            onOpenChange={setEditing}
            onSubmit={save}
          />
        )}
        {!editing && !selection.isPending && !preparation.isPending && (
          <WorkspacePackageOverview
            workspaceId={id}
            currentPackage={details}
            viewedPackage={viewedPackage}
            packages={catalog.data ?? []}
            canManage={canManage}
            canBrowse={canBrowse}
            canEdit={canEdit}
            catalogPending={catalog.isPending}
            catalogError={catalog.isError}
            onRetryCatalog={() => void catalog.refetch()}
            onView={(value) =>
              setViewing({ workspaceId: id, packageId: value.id })
            }
            onEdit={edit}
          />
        )}
      </div>
    </PageWrapper>
  );
}

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPackageCard } from "@/pages/media-package/components/MediaPackageCard";
import { PackageProposalView } from "@/pages/media-package/components/PackageProposalView";
import { MediaPackageLoadingState } from "@/pages/media-package/components/MediaPackagePageState";
import { PackageShareActions } from "@/pages/media-package/components/PackageShareActions";
import "@/pages/media-package/components/packageOverviewMotion.css";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

interface Props {
  workspaceId: string;
  currentPackage: MediaPackage | null;
  viewedPackage: MediaPackage | null;
  packages: MediaPackage[];
  canManage: boolean;
  canBrowse: boolean;
  canEdit: boolean;
  catalogPending: boolean;
  catalogError: boolean;
  onRetryCatalog: () => void;
  onView: (value: MediaPackage) => void;
  onEdit: (value: MediaPackage | null) => void;
}
export function WorkspacePackageOverview({
  workspaceId,
  currentPackage,
  viewedPackage,
  packages,
  canManage,
  canBrowse,
  canEdit,
  catalogPending,
  catalogError,
  onRetryCatalog,
  onView,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const detailScroll = useRef<HTMLDivElement>(null);
  const viewedId = viewedPackage?.id;
  useEffect(() => {
    detailScroll.current?.scrollTo({ top: 0 });
  }, [viewedId]);
  const otherPackages = packages.filter(
    (item) => item.id !== currentPackage?.id,
  );
  const filtered = otherPackages.filter((item) =>
    `${item.name} ${item.scopeDescription ?? ""}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  const isCurrent = viewedPackage?.id === currentPackage?.id;
  return (
    <div
      className={`package-overview grid min-w-0 gap-4 lg:min-h-0 lg:flex-1 lg:overflow-hidden ${canBrowse ? "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,28%)]" : "lg:grid-cols-1"}`}
    >
      <section
        className="order-2 flex min-h-0 min-w-0 flex-col lg:order-1 lg:overflow-hidden"
        aria-label={t("mediaPackage.proposal.viewTitle")}
      >
        <span className="sr-only" role="status">
          {viewedPackage?.name}
        </span>
        <div
          data-package-viewport
          ref={detailScroll}
          tabIndex={0}
          role="region"
          aria-label={t("mediaPackage.workspace.packageContent")}
          className="focus-visible:ring-ring min-h-0 min-w-0 rounded-xl outline-none focus-visible:ring-2 lg:flex-1 lg:[scrollbar-gutter:stable] lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
        >
          {viewedPackage ? (
            <PackageProposalView
              key={viewedPackage.id}
              mediaPackage={viewedPackage}
              actions={
                <div className="flex flex-wrap items-start gap-2">
                  {canManage && viewedPackage && (
                    <Button
                      variant="orange"
                      className="min-h-11"
                      disabled={!canEdit}
                      onClick={() => onEdit(viewedPackage)}
                    >
                      {isCurrent && (
                        <Pencil className="size-4" aria-hidden="true" />
                      )}
                      {t(
                        isCurrent
                          ? "mediaPackage.workspace.edit"
                          : "mediaPackage.actions.select",
                      )}
                    </Button>
                  )}
                  {canManage && currentPackage && isCurrent && (
                    <PackageShareActions
                      basePath={`/api/v1/workspaces/${workspaceId}/media-package`}
                    />
                  )}
                </div>
              }
            />
          ) : (
            <section className="border-border bg-card space-y-4 rounded-xl border border-dashed p-5">
              <p className="text-muted-foreground text-sm leading-6">
                {t(
                  canManage
                    ? "mediaPackage.workspace.emptyManager"
                    : "mediaPackage.workspace.emptyClient",
                )}
              </p>
              {canManage && (
                <Button
                  className="min-h-11"
                  disabled={!canEdit}
                  onClick={() => onEdit(null)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {t("mediaPackage.workspace.create")}
                </Button>
              )}
            </section>
          )}
        </div>
      </section>
      {canBrowse && (
        <aside
          className="order-1 flex min-h-0 min-w-0 flex-col lg:order-2 lg:overflow-hidden"
          aria-label={t("mediaPackage.workspace.packageList")}
        >
          <div className="mb-3 shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {t("mediaPackage.workspace.packageList")}
              </h2>
              {canManage && !currentPackage && (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11"
                  disabled={!canEdit}
                  aria-label={t("mediaPackage.workspace.create")}
                  onClick={() => onEdit(null)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <Input
              aria-label={t("mediaPackage.ui.search")}
              placeholder={t("mediaPackage.ui.search")}
              iconPrefix={<Search className="size-4" aria-hidden="true" />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(12);
              }}
            />
          </div>
          <div
            role="region"
            tabIndex={0}
            aria-label={t("mediaPackage.workspace.packageList")}
            onKeyDown={(event) => {
              const target = event.target as HTMLElement;
              const card = target.closest<HTMLButtonElement>(
                "button[data-package-details]",
              );
              if (
                !card ||
                !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
              )
                return;
              const cards = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button[data-package-details]",
                ),
              );
              const index = cards.indexOf(card);
              const nextIndex =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? cards.length - 1
                    : Math.max(
                        0,
                        Math.min(
                          cards.length - 1,
                          index + (event.key === "ArrowDown" ? 1 : -1),
                        ),
                      );
              const next = cards[nextIndex];
              if (!next) return;
              event.preventDefault();
              next.focus({ preventScroll: true });
              next.scrollIntoView({ block: "nearest", inline: "nearest" });
              next.click();
            }}
            className="focus-visible:ring-ring max-h-96 min-h-0 space-y-3 overflow-y-auto overscroll-contain rounded-xl outline-none focus-visible:ring-2 lg:max-h-none lg:flex-1 lg:pr-2"
          >
            {currentPackage && (
              <MediaPackageCard
                compact
                selected
                viewed={isCurrent}
                mediaPackage={currentPackage}
                canSelect={false}
                selecting={false}
                onSelect={() => {}}
                onViewDetails={onView}
              />
            )}
            {catalogPending ? (
              <MediaPackageLoadingState />
            ) : catalogError ? (
              <section
                role="alert"
                className="border-border bg-card space-y-3 rounded-xl border p-4"
              >
                <p className="text-sm">
                  {t("mediaPackage.workspace.saveError")}
                </p>
                <Button variant="outline" onClick={onRetryCatalog}>
                  {t("mediaPackage.guest.retry")}
                </Button>
              </section>
            ) : (
              <>
                {filtered.slice(0, visibleCount).map((item) => (
                  <MediaPackageCard
                    key={item.id}
                    compact
                    mediaPackage={item}
                    selected={false}
                    viewed={item.id === viewedPackage?.id}
                    canSelect={false}
                    selecting={false}
                    onSelect={() => {}}
                    onViewDetails={onView}
                  />
                ))}
                {!filtered.length && (
                  <p
                    className="text-muted-foreground p-4 text-sm"
                    role="status"
                  >
                    {t(
                      query.trim()
                        ? "mediaPackage.ui.noResults"
                        : currentPackage
                          ? "mediaPackage.workspace.noOtherPackages"
                          : "mediaPackage.catalog.empty",
                    )}
                  </p>
                )}
                {filtered.length > visibleCount && (
                  <Button
                    variant="outline"
                    className="min-h-11 w-full"
                    onClick={() => setVisibleCount((count) => count + 12)}
                  >
                    {t("mediaPackage.ui.loadMore")}
                  </Button>
                )}
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

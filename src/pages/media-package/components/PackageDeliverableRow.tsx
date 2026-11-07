import { Fragment, useId } from "react";
import { ChevronRight, FileText, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { usePackageDetailSpace } from "@/pages/media-package/hooks/usePackageDetailSpace";
import { ExpandablePackageText } from "@/pages/media-package/components/ExpandablePackageText";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";

export function PackageDeliverableRow({
  item,
  open,
  onToggle,
}: {
  item: PackageDeliverable;
  open: boolean;
  onToggle: () => void;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const { fieldsRef, limited } = usePackageDetailSpace(
    open,
    `${item.description ?? ""}\u0000${item.acceptanceCriteria ?? ""}\u0000${i18n.resolvedLanguage}`,
  );
  const hasDetails = Boolean(
    item.description?.trim() || item.acceptanceCriteria?.trim(),
  );
  return (
    <Fragment>
      <tr
        className={`border-border bg-card border-b text-sm ${hasDetails ? "hover:bg-muted/30 cursor-pointer" : ""}`}
        onClick={(event) => {
          if (
            !hasDetails ||
            (event.target as HTMLElement).closest(
              "button, a, input, textarea, select",
            ) ||
            window.getSelection()?.toString()
          )
            return;
          onToggle();
        }}
      >
        <td className="px-2 py-2 text-sm font-medium [overflow-wrap:anywhere] tabular-nums sm:px-3">
          {item.quantity}{" "}
          {t(`mediaPackage.proposal.units.${item.serviceType}`, {
            count: item.quantity,
          })}
        </td>
        <th
          scope="row"
          className="min-w-0 px-2 py-2 text-left font-medium sm:px-3"
        >
          <span
            className="line-clamp-2 [overflow-wrap:anywhere]"
            title={item.name}
          >
            {item.name}
          </span>
        </th>
        <td className="px-1 py-1 text-right sm:px-2">
          {hasDetails ? (
            <Button
              size="sm"
              variant="ghost"
              className="min-h-9 gap-1 px-2 text-xs"
              aria-expanded={open}
              aria-controls={id}
              aria-label={t(
                open
                  ? "mediaPackage.proposal.closeItem"
                  : "mediaPackage.proposal.openItem",
                { name: item.name },
              )}
              onClick={onToggle}
            >
              {t(
                open
                  ? "mediaPackage.proposal.collapse"
                  : "mediaPackage.proposal.view",
              )}
              <ChevronRight
                className={`package-disclosure-chevron text-brand-orange size-3.5 ${open ? "rotate-90" : ""}`}
                aria-hidden="true"
              />
            </Button>
          ) : (
            <span
              className="text-muted-foreground px-2"
              aria-label={t("mediaPackage.proposal.noDetails")}
            >
              —
            </span>
          )}
        </td>
      </tr>
      {hasDetails && (
        <tr
          hidden={!open}
          data-package-detail-row
          data-package-item-id={item.id}
          className="border-border bg-muted border-b"
        >
          <td colSpan={3} className="p-3">
            <div
              id={id}
              ref={fieldsRef}
              className={`grid min-w-0 gap-3 ${item.description?.trim() && item.acceptanceCriteria?.trim() ? "md:grid-cols-2" : ""}`}
            >
              {item.description?.trim() && (
                <section className="bg-card min-w-0 space-y-1 rounded-lg p-3">
                  <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <FileText className="size-3.5" aria-hidden="true" />
                    {t("mediaPackage.proposal.description")}
                  </h4>
                  <ExpandablePackageText
                    key={item.description}
                    limitLines={limited ? 2 : null}
                    text={item.description}
                  />
                </section>
              )}
              {item.acceptanceCriteria?.trim() && (
                <section className="bg-card min-w-0 space-y-1 rounded-lg p-3">
                  <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <Target className="size-3.5" aria-hidden="true" />
                    {t("mediaPackage.proposal.outcomes")}
                  </h4>
                  <ExpandablePackageText
                    key={item.acceptanceCriteria}
                    limitLines={limited ? 2 : null}
                    text={item.acceptanceCriteria}
                  />
                </section>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

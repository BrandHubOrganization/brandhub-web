import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Layers,
  Newspaper,
  Radio,
  Share2,
  Users,
} from "lucide-react";
import { HelpHint } from "@/components/shared/HelpHint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExpandablePackageText } from "./ExpandablePackageText";
import type { OfferingFields, PackageServiceType } from "../types/mediaPackage";

function getServiceIcon(serviceType: PackageServiceType | string) {
  switch (serviceType) {
    case "SOCIAL_POST":
      return <Share2 className="size-3.5" aria-hidden="true" />;
    case "EVENT_PLANNING":
      return <Calendar className="size-3.5" aria-hidden="true" />;
    case "LIVESTREAM_PREPARATION":
      return <Radio className="size-3.5" aria-hidden="true" />;
    case "PRESS_RECOMMENDATION":
      return <Newspaper className="size-3.5" aria-hidden="true" />;
    case "WORKSHOP_SUPPORT":
      return <Users className="size-3.5" aria-hidden="true" />;
    default:
      return <Layers className="size-3.5" aria-hidden="true" />;
  }
}

export function OfferingSummary({ value }: { value: OfferingFields }) {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  if (!value.offeringDetails) return null;

  const deliverables = value.offeringDetails.deliverables ?? [];

  if (deliverables.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-semibold tracking-tight">
            {t("mediaPackage.ui.deliverables")}
          </h3>
          <HelpHint label={t("mediaPackage.ui.deliverables")}>
            {t("mediaPackage.ui.totalQuantity")}
          </HelpHint>
        </div>
        <div className="border-border/60 bg-muted/10 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-xs">
          <Layers className="text-muted-foreground/40 mb-1.5 size-6" />
          <p className="font-medium">
            {t("mediaPackage.offering.noDeliverables", {
              defaultValue: "Chưa có hạng mục bàn giao nào.",
            })}
          </p>
        </div>
      </section>
    );
  }

  const hasAnyDetails = deliverables.some((item) =>
    Boolean(item.description || item.acceptanceCriteria),
  );

  const allExpanded =
    hasAnyDetails &&
    deliverables.every(
      (item) =>
        !(item.description || item.acceptanceCriteria) ||
        expandedIds.has(item.id),
    );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      const all = new Set<string>();
      deliverables.forEach((item) => {
        if (item.description || item.acceptanceCriteria) {
          all.add(item.id);
        }
      });
      setExpandedIds(all);
    }
  };

  return (
    <section className="space-y-3">
      {/* Header with Title, Count Badge, Hint, and optional Expand All */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-semibold tracking-tight">
            {t("mediaPackage.ui.deliverables")}
          </h3>
          <Badge
            variant="secondary"
            className="text-2xs px-1.5 py-0 font-mono font-normal"
          >
            {deliverables.length}
          </Badge>
          <HelpHint label={t("mediaPackage.ui.deliverables")}>
            {t("mediaPackage.ui.totalQuantity")}
          </HelpHint>
        </div>
        {hasAnyDetails && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs font-normal"
            onClick={toggleAll}
          >
            {allExpanded
              ? t("mediaPackage.ui.collapseAll", {
                  defaultValue: "Thu gọn tất cả",
                })
              : t("mediaPackage.ui.expandAll", {
                  defaultValue: "Mở rộng tất cả",
                })}
          </Button>
        )}
      </div>

      {/* Modern High-Density Linear/Jira-styled Deliverables Table */}
      <div className="border-border/70 bg-card overflow-hidden rounded-xl border">
        <Table className="min-w-[520px]">
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/70 border-b hover:bg-transparent">
              <TableHead className="text-muted-foreground w-[38%] min-w-[180px] px-3 py-2.5 text-xs font-semibold">
                {t("mediaPackage.offering.serviceAndName", {
                  defaultValue: "Dịch vụ & Hạng mục",
                })}
              </TableHead>
              <TableHead className="text-muted-foreground w-[44%] px-3 py-2.5 text-xs font-semibold">
                {t("mediaPackage.offering.requirementsAndCriteria", {
                  defaultValue: "Yêu cầu & Tiêu chí nghiệm thu",
                })}
              </TableHead>
              <TableHead className="text-muted-foreground w-[18%] px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">
                {t("mediaPackage.offering.quantityAndUnit", {
                  defaultValue: "Số lượng & Đơn vị",
                })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverables.map((item) => {
              const hasDetails = Boolean(
                item.description || item.acceptanceCriteria,
              );
              const isExpanded = expandedIds.has(item.id);

              return (
                <React.Fragment key={item.id}>
                  <TableRow
                    className={cn(
                      "group hover:bg-muted/30 h-12 transition-colors",
                      hasDetails ? "cursor-pointer" : "cursor-default",
                      isExpanded && "bg-muted/15 border-b-0",
                    )}
                    onClick={() => {
                      if (hasDetails) toggleExpand(item.id);
                    }}
                  >
                    {/* Column 1: Service Icon + Name + Service Type */}
                    <TableCell className="px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {hasDetails ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item.id);
                            }}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/80 -ml-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
                            aria-label={
                              isExpanded
                                ? t("common.actions.collapse", {
                                    defaultValue: "Thu gọn",
                                  })
                                : t("common.actions.expand", {
                                    defaultValue: "Mở rộng",
                                  })
                            }
                            aria-expanded={isExpanded}
                          >
                            <ChevronRight
                              className={cn(
                                "size-3.5 transition-transform duration-200",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </button>
                        ) : (
                          <span className="-ml-1 size-6 shrink-0" />
                        )}
                        <div className="bg-brand-orange/10 text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-lg">
                          {getServiceIcon(item.serviceType)}
                        </div>
                        <div className="flex min-w-0 flex-col justify-center">
                          <span
                            className="text-foreground truncate text-xs font-semibold sm:text-sm"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-2xs text-muted-foreground truncate">
                            {t(
                              `mediaPackage.offering.services.${item.serviceType}`,
                              {
                                defaultValue: item.serviceType,
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Requirements & Acceptance Criteria snippet */}
                    <TableCell className="max-w-[280px] px-3 py-2 sm:max-w-xs md:max-w-sm lg:max-w-md">
                      <div className="flex min-w-0 flex-col justify-center gap-0.5">
                        {item.description ? (
                          <p
                            className="text-muted-foreground truncate text-xs"
                            title={item.description}
                          >
                            {item.description}
                          </p>
                        ) : null}
                        {item.acceptanceCriteria ? (
                          <p
                            className="text-2xs text-muted-foreground/80 flex items-center gap-1.5 truncate"
                            title={item.acceptanceCriteria}
                          >
                            <CheckCircle2
                              className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {item.acceptanceCriteria}
                            </span>
                          </p>
                        ) : null}
                        {!item.description && !item.acceptanceCriteria && (
                          <span className="text-2xs text-muted-foreground/40 italic">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Column 3: Quantity pill */}
                    <TableCell className="px-3 py-2 text-right">
                      <Badge
                        variant="outline"
                        className="bg-brand-orange/5 border-brand-orange/20 text-brand-orange font-mono text-xs font-semibold whitespace-nowrap tabular-nums"
                      >
                        {item.quantity}{" "}
                        {item.serviceType === "PRESS_RECOMMENDATION"
                          ? t("mediaPackage.offering.pressArticleUnit", {
                              count: item.quantity,
                            })
                          : item.unit}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row for complete description & criteria */}
                  {isExpanded && hasDetails && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/60 border-b">
                      <TableCell colSpan={3} className="px-3 py-3 sm:px-4">
                        <div className="grid gap-3 text-xs sm:grid-cols-2">
                          {item.description && (
                            <section className="border-border/75 bg-card min-w-0 rounded-xl border p-3 shadow-2xs">
                              <h5 className="border-border/50 text-foreground mb-2 flex items-center gap-2 border-b pb-1.5 font-semibold tracking-tight">
                                <span className="bg-brand-orange/10 text-brand-orange inline-flex size-5 shrink-0 items-center justify-center rounded-md">
                                  <FileText
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                </span>
                                <span>
                                  {t("mediaPackage.compact.requirements")}
                                </span>
                              </h5>
                              <ExpandablePackageText
                                text={item.description}
                                limitLines={null}
                                tone="orange"
                                size="xs"
                              />
                            </section>
                          )}
                          {item.acceptanceCriteria && (
                            <section className="border-border/75 bg-card min-w-0 rounded-xl border p-3 shadow-2xs">
                              <h5 className="border-border/50 text-foreground mb-2 flex items-center gap-2 border-b pb-1.5 font-semibold tracking-tight">
                                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                </span>
                                <span>
                                  {t("mediaPackage.offering.acceptance")}
                                </span>
                              </h5>
                              <ExpandablePackageText
                                text={item.acceptanceCriteria}
                                limitLines={null}
                                tone="emerald"
                                size="xs"
                              />
                            </section>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

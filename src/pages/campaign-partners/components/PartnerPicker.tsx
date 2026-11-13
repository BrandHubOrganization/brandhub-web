import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Contact2,
  ExternalLink,
  Eye,
  Globe,
  Image,
  Layers,
  Loader2,
  Mail,
  Newspaper,
  Phone,
  Plus,
  Search,
  Sparkles,
  Tv,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { SpringCheck } from "@/components/micro";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  getAvatarPalette,
  getGroupLetter,
  getInitials,
} from "@/pages/collaborators/contactHelpers";
import { PartnerDetails } from "@/pages/collaborators/components/PartnerDetails";
import { PARTNER_TYPES, type DirectoryPartner } from "@/pages/collaborators/types";
import { seedSamplePartnersToAgency } from "@/pages/collaborators/services/seedSamplePartners";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { campaignPartnerService } from "../services/campaignPartnerService";
import {
  parsePartnerContactInfo,
  type CollaboratorOption,
  type PartnerPage,
} from "../types";

interface Props {
  workspaceId: string;
  busy: boolean;
  assignedCollaboratorIds?: string[];
  onAssign: (id: string) => Promise<unknown> | void;
  onAssignMany?: (ids: string[]) => Promise<unknown> | void;
  onUnassign?: (id: string) => Promise<unknown> | void;
}

const ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z", "#",
];

const TYPE_ICONS: Record<string, ReactNode> = {
  NEWSPAPER: <Newspaper className="text-brand-orange size-4" />,
  BANNER: <Image className="text-brand-orange size-4" />,
  TV: <Tv className="text-brand-orange size-4" />,
  OTHER: <Layers className="text-brand-orange size-4" />,
};

function toDirectoryPartner(
  option: CollaboratorOption,
  agencyId: string | null,
): DirectoryPartner {
  const contactRecord: Record<string, unknown> =
    typeof option.contactInfo === "string"
      ? { ...parsePartnerContactInfo(option.contactInfo) }
      : option.contactInfo && typeof option.contactInfo === "object"
        ? (option.contactInfo as Record<string, unknown>)
        : {};
  return {
    id: option.id,
    agencyId: agencyId ?? "",
    partnerName: option.partnerName,
    partnerType: option.partnerType,
    contactInfo: contactRecord,
    notes: option.notes ?? null,
    isActive: true,
    firstUsedAt: null,
    usageHistoryVerified: false,
    version: 0,
    canDelete: false,
    deleteBlockedReason: null,
  };
}

export function PartnerPicker({
  workspaceId,
  busy,
  assignedCollaboratorIds = [],
  onAssign,
  onAssignMany,
  onUnassign,
}: Props) {
  const { t } = useTranslation();
  const [result, setResult] = useState<{
    key: string;
    scope: string;
    data: PartnerPage<CollaboratorOption> | null;
    error: boolean;
  }>();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [detailPartner, setDetailPartner] = useState<DirectoryPartner | null>(
    null,
  );
  const [seeding, setSeeding] = useState(false);

  const agencyId = useWorkspaceStore((state) => {
    const ws =
      state.workspaceList.find((item) => item.id === workspaceId) ??
      (state.currentWorkspace?.id === workspaceId
        ? state.currentWorkspace
        : null);
    return ws?.agencyId ?? null;
  });
  const role = useWorkspaceStore((state) => {
    const ws = state.workspaceList.find((item) => item.id === workspaceId);
    if (ws?.myRole) return ws.myRole;
    if (state.currentWorkspace?.id === workspaceId) {
      return state.currentMemberRole ?? state.currentWorkspace.myRole ?? null;
    }
    return null;
  });

  const scope = `${workspaceId}:${page}`;
  const key = `${scope}:${revision}`;
  const hasScopeData = result?.scope === scope;
  const loading = !hasScopeData;
  const data = hasScopeData ? (result?.data ?? null) : null;
  const error = hasScopeData && !!result?.error;
  const assignedSet = useMemo(
    () => new Set(assignedCollaboratorIds),
    [assignedCollaboratorIds],
  );

  useEffect(() => {
    let active = true;
    campaignPartnerService
      .options(workspaceId, page, 50)
      .then(async (res) => {
        let pageData = res.data.data;
        const needsDirectoryEnrichment =
          Boolean(agencyId) &&
          pageData.content.length > 0 &&
          pageData.content.every(
            (item) => (!item.contactInfo || item.contactInfo === "{}") && !item.notes,
          );

        if (needsDirectoryEnrichment && agencyId) {
          try {
            const dirRes = await api.get<ApiResponse<PartnerPage<DirectoryPartner>>>(
              `/api/v1/agencies/${agencyId}/collaborators`,
              { params: { page: 0, search: "", active: true, size: 100 } },
            );
            const dirMap = new Map(
              (dirRes.data.data?.content ?? []).map((item) => [item.id, item]),
            );
            pageData = {
              ...pageData,
              content: pageData.content.map((opt) => {
                const full = dirMap.get(opt.id);
                if (!full) return opt;
                return {
                  ...opt,
                  contactInfo: JSON.stringify(full.contactInfo ?? {}),
                  notes: full.notes ?? opt.notes,
                };
              }),
            };
          } catch {
            // Ignore when user lacks Owner directory access; options endpoint provides contact fields after backend restart
          }
        }

        if (active) setResult({ key, scope, data: pageData, error: false });
      })
      .catch(() => {
        if (active) setResult({ key, scope, data: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [workspaceId, agencyId, page, key, scope]);

  const filteredOptions = useMemo(() => {
    const items = data?.content ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((partner) => {
      if (typeFilter && partner.partnerType !== typeFilter) return false;
      const isAssigned = assignedSet.has(partner.id);
      if (assignmentFilter === "unassigned" && isAssigned) return false;
      if (assignmentFilter === "assigned" && !isAssigned) return false;
      if (!q) return true;
      const info = parsePartnerContactInfo(partner.contactInfo);
      return (
        partner.partnerName.toLowerCase().includes(q) ||
        (info.contactName ?? "").toLowerCase().includes(q) ||
        (info.email ?? "").toLowerCase().includes(q) ||
        (info.phone ?? "").toLowerCase().includes(q) ||
        (info.website ?? "").toLowerCase().includes(q)
      );
    });
  }, [data?.content, search, typeFilter, assignmentFilter, assignedSet]);

  const grouped = useMemo(() => {
    const sorted = [...filteredOptions].sort((a, b) =>
      a.partnerName.localeCompare(b.partnerName, "vi", { sensitivity: "base" }),
    );
    const map = new Map<string, CollaboratorOption[]>();
    for (const partner of sorted) {
      const letter = getGroupLetter(partner.partnerName);
      const list = map.get(letter) || [];
      list.push(partner);
      map.set(letter, list);
    }
    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });
    return letters.map((letter) => ({
      letter,
      items: map.get(letter)!,
    }));
  }, [filteredOptions]);

  const activeLetters = useMemo(
    () => new Set(grouped.map((g) => g.letter)),
    [grouped],
  );

  function scrollToSection(letter: string) {
    const target = document.getElementById(`campaign-picker-section-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  async function handleAssignSingle(id: string) {
    if (busy || assigningId) return;
    setAssigningId(id);
    try {
      await onAssign(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } finally {
      setAssigningId(null);
    }
  }

  async function handleUnassignSingle(id: string) {
    if (!onUnassign || busy || assigningId) return;
    setAssigningId(id);
    try {
      await onUnassign(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } finally {
      setAssigningId(null);
    }
  }

  async function handleAssignSelected() {
    const valid = selectedIds.filter((id) => !assignedSet.has(id));
    if (valid.length === 0) return;
    if (onAssignMany) {
      await onAssignMany(valid);
    } else {
      for (const id of valid) {
        await onAssign(id);
      }
    }
    setSelectedIds([]);
  }

  async function handleSeedSamples() {
    if (!agencyId || seeding) return;
    setSeeding(true);
    try {
      await seedSamplePartnersToAgency(agencyId);
      toast.success(t("collaborators.demoLoaded"));
      setRevision((value) => value + 1);
    } catch {
      toast.error(t("collaborators.error"));
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <div role="status" className="flex justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/30 bg-destructive/5 space-y-2 rounded-xl border p-4 text-sm"
      >
        <p className="text-destructive font-medium">
          {t("campaign.partners.error")}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRevision((value) => value + 1)}
        >
          {t("campaign.reload")}
        </Button>
      </div>
    );
  }

  const directoryHref =
    agencyId && role === "OWNER"
      ? `/agency/${agencyId}/collaborators`
      : null;
  const pendingCount = selectedIds.filter((id) => !assignedSet.has(id)).length;

  const typeOptions: SelectMenuOption[] = [
    { value: "", label: t("collaborators.all") },
    ...PARTNER_TYPES.map((type) => ({
      value: type,
      label: t(`campaign.partners.types.${type}`),
      icon: TYPE_ICONS[type],
    })),
  ];

  const assignmentOptions: SelectMenuOption[] = [
    { value: "all", label: t("collaborators.all") },
    {
      value: "unassigned",
      label: t("campaign.partners.filterUnassigned", {
        defaultValue: "Chưa gán",
      }),
    },
    {
      value: "assigned",
      label: t("campaign.partners.alreadyAssigned", {
        defaultValue: "Đã gán",
      }),
      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    },
  ];

  return (
    <section
      aria-label={t("campaign.partners.add")}
      className="border-border bg-card space-y-4 rounded-xl border p-4 shadow-2xs sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-orange-soft text-brand-orange flex size-8 items-center justify-center rounded-lg">
            <UserPlus className="size-4" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold tracking-tight">
              {t("campaign.partners.add")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("campaign.partners.directoryPickerHint")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {directoryHref && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <Link to={directoryHref}>
                <ExternalLink className="size-3.5" />
                <span>{t("campaign.partners.openAgencyDirectory")}</span>
              </Link>
            </Button>
          )}
          {pendingCount > 0 && (
            <Button
              variant="orange"
              size="sm"
              className="h-8 gap-1.5 text-xs shadow-2xs"
              disabled={busy || Boolean(assigningId)}
              loading={busy && !assigningId}
              onClick={() => void handleAssignSelected()}
            >
              <Plus className="size-3.5" />
              <span>
                {t("campaign.partners.assignSelected", { count: pendingCount })}
              </span>
            </Button>
          )}
        </div>
      </div>

      {data?.totalElements === 0 ? (
        <div className="border-border/80 bg-muted/25 space-y-3 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("campaign.partners.noDirectory")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {agencyId && role === "OWNER" && (
              <Button
                type="button"
                variant="orange"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                loading={seeding}
                disabled={seeding || busy}
                onClick={() => void handleSeedSamples()}
              >
                <Sparkles className="size-3.5" />
                <span>{t("campaign.partners.seedAgencySamples")}</span>
              </Button>
            )}
            {directoryHref && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                asChild
              >
                <Link to={directoryHref}>
                  <ExternalLink className="size-3.5" />
                  <span>{t("campaign.partners.openAgencyDirectory")}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Filters Bar matching Agency Directory */}
          <div className="border-border/70 bg-muted/20 rounded-xl border p-3 shadow-2xs">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 sm:min-w-64">
                <Input
                  label={t("collaborators.search")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("campaign.partners.searchDirectoryPlaceholder")}
                  iconPrefix={<Search className="text-muted-foreground size-4" />}
                  iconSuffix={
                    search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label={t("collaborators.resetFilters")}
                        className="text-muted-foreground hover:text-foreground pointer-events-auto cursor-pointer p-0.5 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null
                  }
                />
              </div>

              <div className="flex w-full flex-col gap-1.5 sm:w-44">
                <Label className="text-foreground text-xs font-semibold tracking-wide">
                  {t("collaborators.status")}
                </Label>
                <SelectMenu
                  value={assignmentFilter}
                  onChange={setAssignmentFilter}
                  options={assignmentOptions}
                  ariaLabel={t("collaborators.status")}
                  className="w-full"
                />
              </div>

              <div className="flex w-full flex-col gap-1.5 sm:w-52">
                <Label className="text-foreground text-xs font-semibold tracking-wide">
                  {t("collaborators.type")}
                </Label>
                <SelectMenu
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={typeOptions}
                  ariaLabel={t("collaborators.type")}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Directory Contact List with Alphabetical Sticky Headers & A-Z Rail */}
          {grouped.length === 0 ? (
            <div className="border-border/70 bg-background flex flex-col items-center justify-center rounded-xl border p-8 text-center shadow-2xs">
              <div className="bg-muted text-muted-foreground mb-3 flex size-10 items-center justify-center rounded-xl">
                <Contact2 aria-hidden="true" className="size-5" />
              </div>
              <p className="text-muted-foreground text-xs">
                {t("campaign.partners.noMatchingDirectory")}
              </p>
            </div>
          ) : (
            <div className="relative flex items-start gap-2">
              <div
                aria-label={t("collaborators.title")}
                className="border-border/70 bg-card min-w-0 flex-1 overflow-hidden rounded-2xl border shadow-xs"
              >
                {grouped.map((group) => (
                  <section
                    key={group.letter}
                    id={`campaign-picker-section-${group.letter}`}
                    className="relative"
                  >
                    <div className="border-border/40 bg-muted/80 text-muted-foreground sticky top-0 z-10 flex items-center justify-between border-y px-4 py-1.5 text-xs font-bold tracking-wider uppercase shadow-2xs backdrop-blur-xs">
                      <span className="text-foreground font-extrabold">
                        {group.letter}
                      </span>
                      <span className="text-muted-foreground/80 text-[10px] font-medium lowercase">
                        {group.items.length} {t("collaborators.title").toLowerCase()}
                      </span>
                    </div>

                    <ul className="divide-border/30 divide-y">
                      {group.items.map((partner) => {
                        const info = parsePartnerContactInfo(partner.contactInfo);
                        const palette = getAvatarPalette(partner.partnerName);
                        const initials = getInitials(partner.partnerName);
                        const isAssigned = assignedSet.has(partner.id);
                        const isSelected = selectedIds.includes(partner.id);
                        const isRowBusy = assigningId === partner.id;

                        return (
                          <li
                            key={partner.id}
                            className={cn(
                              "group flex flex-col gap-3 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3",
                              isAssigned
                                ? "bg-emerald-500/[0.04]"
                                : isSelected
                                  ? "bg-brand-orange-soft/30"
                                  : "hover:bg-muted/40",
                            )}
                          >
                            {/* Left: Checkbox + Avatar + Full Contact Info */}
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <button
                                type="button"
                                disabled={
                                  busy ||
                                  Boolean(assigningId) ||
                                  (isAssigned && !onUnassign)
                                }
                                onClick={() =>
                                  isAssigned
                                    ? void handleUnassignSingle(partner.id)
                                    : toggleSelect(partner.id)
                                }
                                title={
                                  isAssigned && onUnassign
                                    ? t("campaign.partners.removePartner")
                                    : undefined
                                }
                                aria-label={
                                  isAssigned && onUnassign
                                    ? `${t("campaign.partners.removeQuick")}: ${partner.partnerName}`
                                    : partner.partnerName
                                }
                                className="mt-2.5 shrink-0 cursor-pointer disabled:cursor-default"
                              >
                                <SpringCheck
                                  readOnlyVisual
                                  checked={isAssigned || isSelected}
                                  tone={isAssigned ? "emerald" : "orange"}
                                />
                              </button>

                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                  setDetailPartner(
                                    toDirectoryPartner(partner, agencyId),
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setDetailPartner(
                                      toDirectoryPartner(partner, agencyId),
                                    );
                                  }
                                }}
                                className="focus-visible:outline-ring flex min-w-0 flex-1 cursor-pointer items-start gap-3.5 text-left"
                              >
                                <div
                                  className={cn(
                                    "flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs transition-transform select-none group-hover:scale-105",
                                    palette.bg,
                                  )}
                                  aria-hidden="true"
                                >
                                  {initials}
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-foreground group-hover:text-brand-orange text-sm font-semibold break-words transition-colors">
                                      {partner.partnerName}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="h-5 px-2 text-[11px] font-normal"
                                    >
                                      {t(
                                        `campaign.partners.types.${partner.partnerType}`,
                                        { defaultValue: partner.partnerType },
                                      )}
                                    </Badge>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                      <span className="size-1.5 rounded-full bg-emerald-500" />
                                      {t("collaborators.active")}
                                    </span>
                                  </div>

                                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                    {info.contactName && (
                                      <span
                                        className="inline-flex max-w-[180px] items-center gap-1.5 truncate"
                                        title={info.contactName}
                                      >
                                        <User className="text-muted-foreground/70 size-3.5 shrink-0" />
                                        <span className="truncate">
                                          {info.contactName}
                                        </span>
                                      </span>
                                    )}
                                    {info.phone && (
                                      <a
                                        href={`tel:${info.phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:text-foreground inline-flex items-center gap-1.5 tabular-nums transition-colors"
                                      >
                                        <Phone className="text-muted-foreground/70 size-3.5 shrink-0" />
                                        <span>{info.phone}</span>
                                      </a>
                                    )}
                                    {info.email && (
                                      <a
                                        href={`mailto:${info.email}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:text-foreground inline-flex max-w-[220px] items-center gap-1.5 truncate transition-colors"
                                        title={info.email}
                                      >
                                        <Mail className="text-muted-foreground/70 size-3.5 shrink-0" />
                                        <span className="truncate">
                                          {info.email}
                                        </span>
                                      </a>
                                    )}
                                    {info.website && (
                                      <a
                                        href={info.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:text-foreground inline-flex max-w-[180px] items-center gap-1.5 truncate transition-colors"
                                        title={info.website}
                                      >
                                        <Globe className="text-muted-foreground/70 size-3.5 shrink-0" />
                                        <span className="truncate">
                                          {info.website}
                                        </span>
                                      </a>
                                    )}
                                  </div>

                                  {partner.notes?.trim() && (
                                    <p className="text-muted-foreground/80 line-clamp-1 pt-0.5 text-xs italic">
                                      {partner.notes.trim()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Actions: View Details + Add to Campaign */}
                            <div className="flex shrink-0 flex-wrap items-center gap-1.5 self-end pl-13 sm:self-center sm:pl-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
                                onClick={() =>
                                  setDetailPartner(
                                    toDirectoryPartner(partner, agencyId),
                                  )
                                }
                              >
                                <Eye className="mr-1 size-3.5" />
                                {t("collaborators.viewDetails")}
                              </Button>

                              {isAssigned ? (
                                <>
                                  <Badge
                                    variant="secondary"
                                    className="h-8 gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    <span>{t("campaign.partners.alreadyAssigned")}</span>
                                  </Badge>
                                  {onUnassign && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="bg-background h-8 gap-1 border-rose-200 px-2.5 text-xs text-rose-600 shadow-2xs hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                      disabled={busy || Boolean(assigningId)}
                                      onClick={() => void handleUnassignSingle(partner.id)}
                                    >
                                      {isRowBusy ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <X className="size-3.5" />
                                      )}
                                      <span>{t("campaign.partners.removeQuick")}</span>
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="orange"
                                  size="sm"
                                  className="h-8 gap-1 px-3 text-xs shadow-2xs"
                                  disabled={busy || Boolean(assigningId)}
                                  onClick={() => void handleAssignSingle(partner.id)}
                                >
                                  {isRowBusy ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Plus className="size-3.5" />
                                  )}
                                  <span>{t("campaign.partners.addQuick")}</span>
                                </Button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              {/* A-Z Quick Jump Strip matching Agency Directory */}
              <aside
                aria-label="A-Z index"
                className="border-border/40 bg-card/60 sticky top-20 z-20 hidden shrink-0 flex-col items-center justify-center rounded-xl border px-1 py-2 text-[11px] font-semibold shadow-2xs backdrop-blur-xs select-none md:flex"
              >
                {ALPHABET.map((letter) => {
                  const hasItems = activeLetters.has(letter);
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!hasItems}
                      onClick={() => scrollToSection(letter)}
                      className={cn(
                        "flex size-5.5 items-center justify-center rounded-full text-[11px] transition-all",
                        hasItems
                          ? "text-brand-orange hover:bg-brand-orange/15 cursor-pointer font-bold hover:scale-125 active:scale-95"
                          : "text-muted-foreground/25 cursor-default",
                      )}
                      title={
                        hasItems
                          ? t("collaborators.jumpToLetter", { letter })
                          : undefined
                      }
                    >
                      {letter}
                    </button>
                  );
                })}
              </aside>
            </div>
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
          <span className="text-muted-foreground text-xs">
            {t("campaign.partners.directoryPage", {
              page: page + 1,
              total: data.totalPages,
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || page === 0}
              onClick={() => setPage((value) => value - 1)}
              className="gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>{t("campaign.partners.previous")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || page + 1 >= data.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="gap-1"
            >
              <span>{t("campaign.partners.next")}</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {detailPartner && (
        <PartnerDetails
          partner={detailPartner}
          onClose={() => setDetailPartner(null)}
        />
      )}
    </section>
  );
}

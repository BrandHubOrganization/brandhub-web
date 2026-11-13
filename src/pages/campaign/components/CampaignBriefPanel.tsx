import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Megaphone,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CallChip, CometDial } from "@/components/micro";
import {
  RichTextContent,
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";
import { cn } from "@/lib/utils";
import {
  BriefChipGroup,
  BriefSingleChipGroup,
} from "@/pages/campaign/components/CampaignBriefChipGroup";
import { CampaignBriefFormatSections } from "@/pages/campaign/components/CampaignBriefFormatSections";
import { CampaignMasterBriefCard } from "@/pages/campaign/components/CampaignMasterBriefCard";
import { CampaignStrategyInput } from "@/pages/campaign/components/CampaignStrategyInput";
import type {
  Campaign,
  CampaignBrief,
  CampaignCommFormat,
  CampaignConceptType,
} from "@/pages/campaign/types";
import {
  CAMPAIGN_AUDIENCE_INSIGHT_KEYS,
  CAMPAIGN_AUDIENCE_KEYS,
  CAMPAIGN_BRAND_TONE_KEYS,
  CAMPAIGN_CHANNEL_KEYS,
  CAMPAIGN_COMM_FORMAT_KEYS,
  CAMPAIGN_CONCEPT_TYPE_KEYS,
  CAMPAIGN_CONTENT_PILLAR_KEYS,
  CAMPAIGN_OBJECTIVE_KEYS,
  CAMPAIGN_PRIMARY_CTA_KEYS,
  countFilledBriefBlocks,
  generateCampaignMasterBrief,
  isBriefDraftEqual,
  normalizeBrief,
  serializeCompactBrief,
  toggleBriefOption,
} from "@/pages/campaign/utils/campaignBrief";
import { parseTimeline, patchTimeline } from "@/pages/campaign/utils/timelineDates";

interface DraftState {
  strategyDetail: string;
  brandGuideline: string;
  brief: Required<CampaignBrief>;
}

function buildOrigin(campaign: Campaign): DraftState {
  return {
    strategyDetail: campaign.strategyDetail || "",
    brandGuideline: campaign.brandGuideline || "",
    brief: normalizeBrief(parseTimeline(campaign.timeline).brief),
  };
}

export function CampaignBriefPanel({
  campaign,
  open,
  onOpenChange,
  busy,
  editable,
  onSaveBrief,
  onDirty,
  standalone = false,
}: {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  editable: boolean;
  onSaveBrief: (patch: {
    strategyDetail: string;
    brandGuideline: string;
    brief?: CampaignBrief;
  }) => Promise<unknown>;
  onDirty: (key: string, dirty: boolean) => void;
  standalone?: boolean;
}) {
  const { t } = useTranslation();
  const origin = useMemo(() => buildOrigin(campaign), [campaign]);
  const [draft, setDraft] = useState<DraftState>(origin);
  const [savingLocal, setSavingLocal] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const isDirty = useMemo(() => !isBriefDraftEqual(draft, origin), [draft, origin]);
  const latestDraftRef = useRef(draft);
  const latestCampaignRef = useRef(campaign);
  const dirtyRef = useRef(isDirty);
  const inFlightRef = useRef(false);
  const failedDraftRef = useRef<DraftState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestDraftRef.current = draft;
    if (
      failedDraftRef.current &&
      !isBriefDraftEqual(draft, failedDraftRef.current)
    ) {
      failedDraftRef.current = null;
      setSaveFailed(false);
    }
  }, [draft]);

  useEffect(() => {
    latestCampaignRef.current = campaign;
  }, [campaign]);

  useEffect(() => {
    dirtyRef.current = isDirty;
    onDirty("brief", isDirty);
  }, [isDirty, onDirty]);

  useEffect(() => {
    if (!dirtyRef.current && !inFlightRef.current) {
      failedDraftRef.current = null;
      setSaveFailed(false);
      setDraft(origin);
    }
  }, [origin]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      onDirty("brief", false);
    },
    [onDirty],
  );

  const saveNow = useCallback(
    async (
      showSuccessToast = false,
      draftOverride?: DraftState,
      allowRetry = false,
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (!editable || inFlightRef.current || busy) return;
      const currentDraft = draftOverride ?? latestDraftRef.current;
      if (
        !allowRetry &&
        failedDraftRef.current &&
        isBriefDraftEqual(currentDraft, failedDraftRef.current)
      ) {
        return;
      }
      const currentCampaign = latestCampaignRef.current;
      const currentOrigin = buildOrigin(currentCampaign);
      if (isBriefDraftEqual(currentDraft, currentOrigin)) return;

      const compactBrief = serializeCompactBrief(currentDraft.brief);
      const nextTimeline = patchTimeline(currentCampaign.timeline, {
        brief: compactBrief,
      });

      if (
        currentDraft.strategyDetail.length > 20000 ||
        currentDraft.brandGuideline.length > 20000 ||
        nextTimeline.length > 50000
      ) {
        setLengthError(true);
        return;
      }

      setLengthError(false);
      inFlightRef.current = true;
      setSavingLocal(true);
      try {
        await onSaveBrief({
          strategyDetail: currentDraft.strategyDetail,
          brandGuideline: currentDraft.brandGuideline,
          brief: compactBrief,
        });
        failedDraftRef.current = null;
        setSaveFailed(false);
        if (showSuccessToast) {
          toast.success(t("campaign.brief.saved"));
        }
      } catch (err) {
        // Pause automatic retries for the exact failed draft until edited or manually retried.
        if (!(err instanceof Error && err.message === "SAVE_IN_PROGRESS")) {
          failedDraftRef.current = currentDraft;
          setSaveFailed(true);
        }
      } finally {
        inFlightRef.current = false;
        setSavingLocal(false);
      }
    },
    [busy, editable, onSaveBrief, t],
  );

  useEffect(() => {
    if (!isDirty || !editable || busy || inFlightRef.current) return;
    if (
      failedDraftRef.current &&
      isBriefDraftEqual(draft, failedDraftRef.current)
    ) {
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void saveNow(false);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft, isDirty, editable, busy, saveNow]);

  const updateBriefField = <K extends keyof CampaignBrief>(
    key: K,
    value: Required<CampaignBrief>[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      brief: { ...prev.brief, [key]: value },
    }));
  };

  const handleGenerateBrief = () => {
    const currentCampaign = latestCampaignRef.current;
    const timeline = parseTimeline(currentCampaign.timeline);
    const html = generateCampaignMasterBrief({
      campaign: currentCampaign,
      timeline,
      brief: draft.brief,
      strategyDetail: draft.strategyDetail,
      brandGuideline: draft.brandGuideline,
      t,
    });
    const nextDraft: DraftState = {
      ...draft,
      brief: {
        ...draft.brief,
        generatedBrief: html,
        generatedBriefUpdatedAt: new Date().toISOString(),
      },
    };
    setDraft(nextDraft);
    latestDraftRef.current = nextDraft;
    failedDraftRef.current = null;
    setSaveFailed(false);
    toast.success(t("campaign.brief.generatedSuccess"));
    void saveNow(false, nextDraft, true);
  };

  const handleContainerBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    if (
      failedDraftRef.current &&
      isBriefDraftEqual(latestDraftRef.current, failedDraftRef.current)
    ) {
      return;
    }
    if (isDirty) void saveNow(false);
  };

  const isExpanded = standalone || open;
  const handleToggleOpen = () => {
    if (standalone) return;
    if (
      isExpanded &&
      isDirty &&
      !(
        failedDraftRef.current &&
        isBriefDraftEqual(latestDraftRef.current, failedDraftRef.current)
      )
    ) {
      void saveNow(false);
    }
    onOpenChange(!open);
  };

  const handleRevert = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    failedDraftRef.current = null;
    setSaveFailed(false);
    setLengthError(false);
    setDraft(origin);
  };

  const progress = useMemo(
    () =>
      countFilledBriefBlocks(
        {
          strategyDetail: draft.strategyDetail,
          brandGuideline: draft.brandGuideline,
        },
        draft.brief,
      ),
    [draft],
  );

  const summaryPills = useMemo(() => {
    const pills: string[] = [];
    for (const fmt of draft.brief.campaignFormats.slice(0, 2)) {
      pills.push(t(`campaign.brief.commFormatOptions.${fmt}`, fmt));
    }
    if (draft.brief.conceptType) {
      pills.push(
        t(`campaign.brief.conceptTypeOptions.${draft.brief.conceptType}`),
      );
    }
    for (const ch of draft.brief.channels.slice(0, 2)) {
      pills.push(t(`campaign.brief.channelOptions.${ch}`, ch));
    }
    return pills;
  }, [
    draft.brief.campaignFormats,
    draft.brief.channels,
    draft.brief.conceptType,
    t,
  ]);

  return (
    <section
      aria-label={t("campaign.brief.title")}
      onBlur={handleContainerBlur}
      className="border-border bg-card shrink-0 rounded-xl border shadow-2xs"
    >
      <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-expanded={isExpanded}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 text-left",
            standalone && "cursor-default",
          )}
        >
          <CometDial value={progress.filled} max={progress.total} size={30} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-brand-orange text-sm font-semibold tracking-tight">
                {t("campaign.brief.title")}
              </span>
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {t("campaign.brief.progress", {
                  filled: progress.filled,
                  total: progress.total,
                })}
              </span>
              {!isExpanded && summaryPills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {summaryPills.map((pill) => (
                    <Badge
                      key={pill}
                      variant="secondary"
                      className="text-[11px] font-normal"
                    >
                      {pill}
                    </Badge>
                  ))}
                </div>
              )}
              {!isExpanded && draft.brief.keyMessage && (
                <span className="text-muted-foreground hidden truncate text-xs md:inline">
                  “{draft.brief.keyMessage}”
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {editable && isDirty && (
            <>
              <CallChip
                state={savingLocal ? "saving" : saveFailed ? "error" : "unsaved"}
                tone="orange"
                className="hidden sm:inline-flex"
                label={
                  savingLocal
                    ? t("campaign.timeline.savingSchedule")
                    : t("campaign.brief.unsaved")
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={savingLocal || busy}
                onClick={handleRevert}
              >
                <RotateCcw className="size-3" />
                {t("campaign.brief.revert")}
              </Button>
              <Button
                type="button"
                variant="orange"
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs"
                disabled={savingLocal || busy}
                onClick={() => void saveNow(true, undefined, true)}
              >
                <Save className="size-3" />
                {saveFailed
                  ? t("campaign.timeline.retry")
                  : t("campaign.brief.save")}
              </Button>
            </>
          )}
          {!standalone && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={handleToggleOpen}
              aria-expanded={isExpanded}
            >
              <span>
                {isExpanded
                  ? t("campaign.brief.collapse")
                  : t("campaign.brief.expand")}
              </span>
              {isExpanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="divide-border/70 divide-y px-4 sm:px-5">
          {lengthError && (
            <p className="text-destructive py-3 text-xs font-medium" role="alert">
              {t("campaign.brief.tooLong")}
            </p>
          )}

          {/* Khối 1: Hình thức truyền thông & Concept chủ đạo */}
          <div className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-1 lg:col-span-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                <Layers className="size-4 shrink-0" />
                <span>{t("campaign.brief.sections.formatAndConcept")}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("campaign.brief.sectionHints.formatAndConcept", {
                  defaultValue:
                    "Chọn hình thức truyền thông chính để mở các trường cấu hình chuyên biệt và xác định ý tưởng chủ đạo.",
                })}
              </p>
            </div>

            <div className="space-y-4 lg:col-span-8">
              <BriefChipGroup
                label={t("campaign.brief.fields.campaignFormats")}
                options={CAMPAIGN_COMM_FORMAT_KEYS}
                selected={draft.brief.campaignFormats}
                editable={editable}
                highlightBrand
                onToggle={(option) =>
                  updateBriefField(
                    "campaignFormats",
                    toggleBriefOption(
                      draft.brief.campaignFormats,
                      option,
                    ) as CampaignCommFormat[],
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.commFormatOptions.${option}`, option)
                }
              />

              <BriefSingleChipGroup
                label={t("campaign.brief.fields.conceptType")}
                options={CAMPAIGN_CONCEPT_TYPE_KEYS}
                value={draft.brief.conceptType}
                editable={editable}
                onChange={(nextValue) =>
                  updateBriefField(
                    "conceptType",
                    nextValue as CampaignConceptType,
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.conceptTypeOptions.${option}`, option)
                }
              />

              <div className="space-y-1.5">
                <Label
                  htmlFor="brief-concept-idea"
                  className="text-foreground/85 block text-xs font-medium"
                >
                  {t("campaign.brief.fields.conceptIdea")}
                </Label>
                {editable ? (
                  <Input
                    id="brief-concept-idea"
                    value={draft.brief.conceptIdea}
                    onChange={(e) =>
                      updateBriefField("conceptIdea", e.target.value)
                    }
                    placeholder={t(
                      "campaign.brief.fields.conceptIdeaPlaceholder",
                    )}
                    maxLength={400}
                    className="bg-background h-9 text-xs font-medium"
                  />
                ) : (
                  <p className="text-foreground text-xs font-medium">
                    {draft.brief.conceptIdea || "—"}
                  </p>
                )}
              </div>

              <CampaignBriefFormatSections
                brief={draft.brief}
                editable={editable}
                onUpdateField={updateBriefField}
                onSelectFormatQuick={(format) =>
                  updateBriefField(
                    "campaignFormats",
                    toggleBriefOption(draft.brief.campaignFormats, format),
                  )
                }
              />
            </div>
          </div>

          {/* Khối 3: Mục tiêu, Kênh & Khách hàng mục tiêu */}
          <div className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-1 lg:col-span-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                <Target className="size-4 shrink-0" />
                <span>{t("campaign.brief.sections.goalsAndChannels")}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("campaign.brief.sectionHints.goalsAndChannels", {
                  defaultValue:
                    "Xác định mục tiêu đo lường, kênh phát hành và chân dung khách hàng mục tiêu.",
                })}
              </p>
            </div>

            <div className="space-y-4 lg:col-span-8">
              <BriefChipGroup
                label={t("campaign.brief.fields.objectives")}
                options={CAMPAIGN_OBJECTIVE_KEYS}
                selected={draft.brief.objectives}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "objectives",
                    toggleBriefOption(draft.brief.objectives, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.objectiveOptions.${option}`, option)
                }
              />

              <BriefChipGroup
                label={t("campaign.brief.fields.channels")}
                options={CAMPAIGN_CHANNEL_KEYS}
                selected={draft.brief.channels}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "channels",
                    toggleBriefOption(draft.brief.channels, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.channelOptions.${option}`, option)
                }
              />

              <BriefChipGroup
                label={t("campaign.brief.fields.targetAudiences")}
                options={CAMPAIGN_AUDIENCE_KEYS}
                selected={draft.brief.targetAudiences}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "targetAudiences",
                    toggleBriefOption(draft.brief.targetAudiences, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.audienceOptions.${option}`, option)
                }
              />

              <BriefChipGroup
                label={t("campaign.brief.fields.audienceInsights")}
                options={CAMPAIGN_AUDIENCE_INSIGHT_KEYS}
                selected={draft.brief.audienceInsights}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "audienceInsights",
                    toggleBriefOption(draft.brief.audienceInsights, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.audienceInsightOptions.${option}`, option)
                }
              />

              <div className="space-y-1.5">
                <Label
                  htmlFor="brief-audience-note"
                  className="text-foreground/85 flex items-center gap-1.5 text-xs font-medium"
                >
                  <Users className="text-muted-foreground size-3.5" />
                  <span>{t("campaign.brief.fields.audienceNote")}</span>
                </Label>
                {editable ? (
                  <Input
                    id="brief-audience-note"
                    value={draft.brief.audienceNote}
                    onChange={(e) =>
                      updateBriefField("audienceNote", e.target.value)
                    }
                    placeholder={t(
                      "campaign.brief.fields.audienceNotePlaceholder",
                    )}
                    maxLength={500}
                    className="bg-background h-9 text-xs"
                  />
                ) : (
                  <p className="text-foreground text-xs">
                    {draft.brief.audienceNote || "—"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Khối 4: Thông điệp, Định hướng nội dung & Chiến lược */}
          <div className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-1 lg:col-span-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                <Megaphone className="size-4 shrink-0" />
                <span>{t("campaign.brief.sections.eventAndStrategy")}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("campaign.brief.sectionHints.eventAndStrategy", {
                  defaultValue:
                    "Chốt thông điệp chủ đạo, lời kêu gọi hành động và định hướng nội dung triển khai.",
                })}
              </p>
            </div>

            <div className="space-y-4 lg:col-span-8">
              <div className="space-y-1.5">
                <Label
                  htmlFor="brief-key-message"
                  className="text-foreground/85 block text-xs font-medium"
                >
                  {t("campaign.brief.fields.keyMessage")}
                </Label>
                {editable ? (
                  <Input
                    id="brief-key-message"
                    value={draft.brief.keyMessage}
                    onChange={(e) =>
                      updateBriefField("keyMessage", e.target.value)
                    }
                    placeholder={t(
                      "campaign.brief.fields.keyMessagePlaceholder",
                    )}
                    maxLength={400}
                    className="bg-background h-9 text-xs font-medium"
                  />
                ) : (
                  <p className="text-foreground text-xs font-medium">
                    {draft.brief.keyMessage || "—"}
                  </p>
                )}
              </div>

              <BriefSingleChipGroup
                label={t("campaign.brief.fields.primaryCta")}
                options={CAMPAIGN_PRIMARY_CTA_KEYS}
                value={draft.brief.primaryCta}
                editable={editable}
                onChange={(nextValue) =>
                  updateBriefField("primaryCta", nextValue)
                }
                getLabel={(option) =>
                  t(`campaign.brief.primaryCtaOptions.${option}`, option)
                }
              />

              <BriefChipGroup
                label={t("campaign.brief.fields.contentPillars")}
                options={CAMPAIGN_CONTENT_PILLAR_KEYS}
                selected={draft.brief.contentPillars}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "contentPillars",
                    toggleBriefOption(draft.brief.contentPillars, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.contentPillarOptions.${option}`, option)
                }
              />

              <div className="space-y-1.5">
                <Label className="text-foreground/85 block text-xs font-medium">
                  {t("campaign.brief.fields.strategyDetail")}
                </Label>
                {editable ? (
                  <CampaignStrategyInput
                    value={draft.strategyDetail}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, strategyDetail: value }))
                    }
                    disabled={false}
                  />
                ) : stripRichTextHtml(draft.strategyDetail) ? (
                  <div className="border-border bg-background rounded-md border px-3 py-2 text-xs">
                    <RichTextContent value={draft.strategyDetail} />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs italic">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Khối 5: Định hướng thương hiệu & Lưu ý thực thi */}
          <div className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-1 lg:col-span-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                <Sparkles className="size-4 shrink-0" />
                <span>{t("campaign.brief.sections.brandAndNotes")}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("campaign.brief.sectionHints.brandAndNotes", {
                  defaultValue:
                    "Quy chuẩn giọng điệu, nhận diện thương hiệu và các lưu ý cần tránh khi sản xuất.",
                })}
              </p>
            </div>

            <div className="space-y-4 lg:col-span-8">
              <BriefChipGroup
                label={t("campaign.brief.fields.brandTones")}
                options={CAMPAIGN_BRAND_TONE_KEYS}
                selected={draft.brief.brandTones}
                editable={editable}
                onToggle={(option) =>
                  updateBriefField(
                    "brandTones",
                    toggleBriefOption(draft.brief.brandTones, option),
                  )
                }
                getLabel={(option) =>
                  t(`campaign.brief.brandToneOptions.${option}`, option)
                }
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {editable ? (
                  <RichTextInput
                    id="brief-brand-guideline"
                    label={
                      <span className="text-foreground/85 text-xs font-medium">
                        {t("campaign.brief.fields.brandGuideline")}
                      </span>
                    }
                    value={draft.brandGuideline}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, brandGuideline: value }))
                    }
                    placeholder={t(
                      "campaign.brief.fields.brandGuidelinePlaceholder",
                    )}
                    editorClassName="min-h-24 max-h-44 overflow-y-auto text-xs"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-foreground/85 text-xs font-medium">
                      {t("campaign.brief.fields.brandGuideline")}
                    </Label>
                    {stripRichTextHtml(draft.brandGuideline) ? (
                      <div className="border-border bg-background rounded-md border px-3 py-2 text-xs">
                        <RichTextContent value={draft.brandGuideline} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">—</p>
                    )}
                  </div>
                )}

                {editable ? (
                  <RichTextInput
                    id="brief-notes"
                    label={
                      <span className="text-foreground/85 text-xs font-medium">
                        {t("campaign.brief.fields.notes")}
                      </span>
                    }
                    value={draft.brief.notes}
                    onChange={(value) => updateBriefField("notes", value)}
                    placeholder={t(
                      "campaign.brief.fields.notesPlaceholder",
                    )}
                    editorClassName="min-h-24 max-h-44 overflow-y-auto text-xs"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-foreground/85 text-xs font-medium">
                      {t("campaign.brief.fields.notes")}
                    </Label>
                    {stripRichTextHtml(draft.brief.notes) ? (
                      <div className="border-border bg-background rounded-md border px-3 py-2 text-xs">
                        <RichTextContent value={draft.brief.notes} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">—</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Khối 6: Bản Brief Tổng Quan (Generate Brief cho AI & Gửi Client) */}
          <div className="py-5">
            <CampaignMasterBriefCard
              campaignName={campaign.name}
              generatedBrief={draft.brief.generatedBrief}
              updatedAt={draft.brief.generatedBriefUpdatedAt}
              editable={editable}
              busy={savingLocal || busy}
              onGenerate={handleGenerateBrief}
              onChange={(value) => updateBriefField("generatedBrief", value)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

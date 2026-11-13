import type {
  CampaignBrief,
  CampaignCommFormat,
  CampaignConceptType,
  CampaignEventFormat,
} from "@/pages/campaign/types";
import {
  taskInstant,
  taskLocalMinute,
} from "@/pages/tasks/utils/taskWorkflowDates";

const VALID_EVENT_FORMATS = new Set<CampaignEventFormat>([
  "OFFLINE",
  "ONLINE",
  "HYBRID",
  "",
]);

const VALID_COMM_FORMATS = new Set<CampaignCommFormat>([
  "DIGITAL_SOCIAL",
  "BRAND_LAUNCH",
  "OFFLINE_ACTIVATION",
  "INFLUENCER_PR",
  "PROMOTION_SEASONAL",
]);

const VALID_CONCEPT_TYPES = new Set<CampaignConceptType>([
  "EMOTIONAL_STORY",
  "TEASER_LAUNCH_BOOM",
  "EXPERIENTIAL_INTERACTIVE",
  "VIRAL_COMMUNITY_UGC",
  "EXPERT_TRUST_EDUCATIONAL",
  "CONVERSION_OFFER_PUSH",
  "",
]);

function parseStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

function parseCampaignBrief(raw: unknown): CampaignBrief | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const source = raw as Record<string, unknown>;
  const eventFormat =
    typeof source.eventFormat === "string" &&
    VALID_EVENT_FORMATS.has(source.eventFormat as CampaignEventFormat)
      ? (source.eventFormat as CampaignEventFormat)
      : undefined;
  const rawFormats = parseStringList(source.campaignFormats)?.filter(
    (item): item is CampaignCommFormat =>
      VALID_COMM_FORMATS.has(item as CampaignCommFormat),
  );
  const conceptType =
    typeof source.conceptType === "string" &&
    VALID_CONCEPT_TYPES.has(source.conceptType as CampaignConceptType)
      ? (source.conceptType as CampaignConceptType)
      : undefined;
  const brief: CampaignBrief = {
    ...(rawFormats ? { campaignFormats: rawFormats } : {}),
    ...(conceptType !== undefined ? { conceptType } : {}),
    ...(typeof source.conceptIdea === "string"
      ? { conceptIdea: source.conceptIdea }
      : {}),
    ...(parseStringList(source.objectives)
      ? { objectives: parseStringList(source.objectives) }
      : {}),
    ...(parseStringList(source.targetAudiences)
      ? { targetAudiences: parseStringList(source.targetAudiences) }
      : {}),
    ...(parseStringList(source.audienceInsights)
      ? { audienceInsights: parseStringList(source.audienceInsights) }
      : {}),
    ...(typeof source.audienceNote === "string"
      ? { audienceNote: source.audienceNote }
      : {}),
    ...(parseStringList(source.channels)
      ? { channels: parseStringList(source.channels) }
      : {}),
    ...(parseStringList(source.contentPillars)
      ? { contentPillars: parseStringList(source.contentPillars) }
      : {}),
    ...(typeof source.primaryCta === "string"
      ? { primaryCta: source.primaryCta }
      : {}),
    ...(eventFormat !== undefined ? { eventFormat } : {}),
    ...(typeof source.eventConcept === "string"
      ? { eventConcept: source.eventConcept }
      : {}),
    ...(typeof source.eventLocation === "string"
      ? { eventLocation: source.eventLocation }
      : {}),
    ...(typeof source.expectedScale === "string"
      ? { expectedScale: source.expectedScale }
      : {}),
    ...(parseStringList(source.eventHighlights)
      ? { eventHighlights: parseStringList(source.eventHighlights) }
      : {}),
    ...(parseStringList(source.launchPhases)
      ? { launchPhases: parseStringList(source.launchPhases) }
      : {}),
    ...(parseStringList(source.uspFocus)
      ? { uspFocus: parseStringList(source.uspFocus) }
      : {}),
    ...(parseStringList(source.digitalFormats)
      ? { digitalFormats: parseStringList(source.digitalFormats) }
      : {}),
    ...(parseStringList(source.kpiFocus)
      ? { kpiFocus: parseStringList(source.kpiFocus) }
      : {}),
    ...(parseStringList(source.kolTiers)
      ? { kolTiers: parseStringList(source.kolTiers) }
      : {}),
    ...(parseStringList(source.prAngles)
      ? { prAngles: parseStringList(source.prAngles) }
      : {}),
    ...(parseStringList(source.promoMechanics)
      ? { promoMechanics: parseStringList(source.promoMechanics) }
      : {}),
    ...(typeof source.seasonalHook === "string"
      ? { seasonalHook: source.seasonalHook }
      : {}),
    ...(typeof source.keyMessage === "string"
      ? { keyMessage: source.keyMessage }
      : {}),
    ...(parseStringList(source.brandTones)
      ? { brandTones: parseStringList(source.brandTones) }
      : {}),
    ...(typeof source.notes === "string" ? { notes: source.notes } : {}),
    ...(typeof source.generatedBrief === "string"
      ? { generatedBrief: source.generatedBrief }
      : {}),
    ...(typeof source.generatedBriefUpdatedAt === "string"
      ? { generatedBriefUpdatedAt: source.generatedBriefUpdatedAt }
      : {}),
  };
  return Object.keys(brief).length > 0 ? brief : undefined;
}
export const DAY_MS = 86400000;
export const dayNumber = (day: string) =>
  Math.floor(Date.parse(`${day}T00:00:00Z`) / DAY_MS);
export const dayString = (number: number) =>
  new Date(number * DAY_MS).toISOString().slice(0, 10);
export const addDays = (day: string, count: number) =>
  dayString(dayNumber(day) + count);
export const localDay = (iso: string | null, zone: string) =>
  iso ? taskLocalMinute(iso, zone).slice(0, 10) : "";
export const dayInstant = (day: string, zone: string) =>
  taskInstant(`${day}T00:00`, zone);
export const todayIn = (zone: string) =>
  localDay(new Date().toISOString(), zone);
export function parseTimeline(value: string): {
  startDate?: string;
  endDate?: string;
  milestones?: { name: string; date: string }[];
  brief?: CampaignBrief;
} {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const source = parsed as Record<string, unknown>;
    const validDay = (day: unknown): day is string =>
      typeof day === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(day) &&
      Number.isFinite(dayNumber(day));
    const brief = parseCampaignBrief(source.brief);
    return {
      ...(validDay(source.startDate) ? { startDate: source.startDate } : {}),
      ...(validDay(source.endDate) ? { endDate: source.endDate } : {}),
      milestones: Array.isArray(source.milestones)
        ? source.milestones.filter(
            (entry): entry is { name: string; date: string } =>
              !!entry &&
              typeof entry === "object" &&
              typeof entry.name === "string" &&
              validDay(entry.date),
          )
        : [],
      ...(brief ? { brief } : {}),
    };
  } catch {
    return {};
  }
}

/** Preserve additional timeline metadata when changing one presentation field. */
export function patchTimeline(
  value: string,
  patch: Partial<ReturnType<typeof parseTimeline>>,
) {
  let original: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      original = parsed as Record<string, unknown>;
  } catch {
    /* Legacy empty timeline is treated as an empty object. */
  }
  return JSON.stringify({ ...original, ...patch });
}

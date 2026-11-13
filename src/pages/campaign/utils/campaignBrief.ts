import type { TFunction } from "i18next";
import { stripRichTextHtml } from "@/components/ui/rich-text-input";
import type {
  Campaign,
  CampaignBrief,
  CampaignCommFormat,
  CampaignConceptType,
  CampaignEventFormat,
  Timeline,
} from "@/pages/campaign/types";

export const CAMPAIGN_COMM_FORMAT_KEYS: readonly CampaignCommFormat[] = [
  "DIGITAL_SOCIAL",
  "BRAND_LAUNCH",
  "OFFLINE_ACTIVATION",
  "INFLUENCER_PR",
  "PROMOTION_SEASONAL",
] as const;

export const CAMPAIGN_CONCEPT_TYPE_KEYS: readonly Exclude<
  CampaignConceptType,
  ""
>[] = [
  "TEASER_LAUNCH_BOOM",
  "EMOTIONAL_STORY",
  "EXPERIENTIAL_INTERACTIVE",
  "VIRAL_COMMUNITY_UGC",
  "EXPERT_TRUST_EDUCATIONAL",
  "CONVERSION_OFFER_PUSH",
] as const;

export const CAMPAIGN_OBJECTIVE_KEYS = [
  "BRAND_AWARENESS",
  "EVENT_LAUNCH",
  "REGISTRATION_LEADS",
  "COMMUNITY_ENGAGEMENT",
  "SALES_CONVERSION",
  "PR_CREDIBILITY",
] as const;

export const CAMPAIGN_CHANNEL_KEYS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Threads",
  "PR_PRESS",
  "EMAIL",
  "OFFLINE_EVENT",
] as const;

export const CAMPAIGN_AUDIENCE_KEYS = [
  "GEN_Z",
  "MILLENNIALS",
  "OFFICE_WORKERS",
  "YOUNG_FAMILIES",
  "B2B_PARTNERS",
  "STUDENTS",
] as const;

export const CAMPAIGN_AUDIENCE_INSIGHT_KEYS = [
  "VALUE_FOR_MONEY",
  "EXPERIENCE_NOVELTY",
  "SOCIAL_PROOF",
  "TIME_SAVING",
  "SELF_EXPRESSION",
  "TRUST_SECURITY",
] as const;

export const CAMPAIGN_CONTENT_PILLAR_KEYS = [
  "PRODUCT_SPOTLIGHT",
  "USER_STORIES_REVIEWS",
  "EXPERT_TIPS",
  "BEHIND_THE_SCENES",
  "PROMO_CTA",
  "COMMUNITY_MINIGAME",
] as const;

export const CAMPAIGN_PRIMARY_CTA_KEYS = [
  "REGISTER_NOW",
  "BUY_WITH_OFFER",
  "BOOK_DEMO_CONSULT",
  "JOIN_EVENT_CHECKIN",
  "FOLLOW_SHARE",
  "DOWNLOAD_GUIDE",
] as const;

export const CAMPAIGN_EVENT_FORMATS: CampaignEventFormat[] = [
  "OFFLINE",
  "ONLINE",
  "HYBRID",
];

export const EVENT_CONCEPT_KEYS = [
  "LAUNCH_PRESS",
  "WORKSHOP_TALKSHOW",
  "ROADSHOW_SAMPLING",
  "EXPERIENCE_BOOTH",
  "GALA_APPRECIATION",
] as const;

export const EVENT_HIGHLIGHT_KEYS = [
  "PHOTOBOOTH_CHECKIN",
  "MINIGAME_LUCKY_DRAW",
  "LIVE_PRODUCT_DEMO",
  "GUEST_SPEAKER_QA",
  "RECAP_CLIP_INSTANT",
] as const;

export const LAUNCH_PHASE_KEYS = [
  "TEASING",
  "LAUNCH_DAY",
  "AMPLIFY_SUSTAIN",
] as const;

export const USP_FOCUS_KEYS = [
  "NEW_TECH_FEATURE",
  "PREMIUM_DESIGN",
  "COMPETITIVE_PRICING",
  "LIMITED_EDITION",
  "ECO_SUSTAINABLE",
] as const;

export const DIGITAL_FORMAT_KEYS = [
  "SHORT_VIDEO_REELS",
  "CAROUSEL_INFOGRAPHIC",
  "LIFESTYLE_ALBUM",
  "STORYTELLING_SERIES",
  "THREADS_DISCUSSION",
] as const;

export const KPI_FOCUS_KEYS = [
  "REACH_IMPRESSIONS",
  "ENGAGEMENT_RATE",
  "LEADS_INBOX",
  "TRAFFIC_CLICKS",
  "VIDEO_VIEWS",
] as const;

export const KOL_TIER_KEYS = [
  "MEGA_MACRO",
  "MICRO_KOC",
  "INDUSTRY_EXPERT",
] as const;

export const PR_ANGLE_KEYS = [
  "OFFICIAL_ANNOUNCEMENT",
  "FOUNDER_BRAND_STORY",
  "MARKET_TREND_DATA",
  "HANDS_ON_REVIEW",
] as const;

export const PROMO_MECHANIC_KEYS = [
  "DIRECT_DISCOUNT",
  "GIFT_WITH_PURCHASE",
  "FLASH_VOUCHER",
  "BUNDLE_COMBO",
  "LUCKY_DRAW",
] as const;

export const SEASONAL_HOOK_KEYS = [
  "TET_HOLIDAY",
  "BACK_TO_SCHOOL",
  "MEGA_DOUBLE_DAY",
  "BRAND_BIRTHDAY",
  "CLEARANCE_SEASON",
] as const;

export const CAMPAIGN_BRAND_TONE_KEYS = [
  "PROFESSIONAL",
  "ENERGETIC",
  "CREATIVE",
  "FRIENDLY",
  "PREMIUM",
] as const;

export function normalizeBrief(brief?: CampaignBrief): Required<CampaignBrief> {
  return {
    campaignFormats: brief?.campaignFormats ?? [],
    conceptType: brief?.conceptType ?? "",
    conceptIdea: brief?.conceptIdea ?? "",
    objectives: brief?.objectives ?? [],
    targetAudiences: brief?.targetAudiences ?? [],
    audienceInsights: brief?.audienceInsights ?? [],
    audienceNote: brief?.audienceNote ?? "",
    channels: brief?.channels ?? [],
    contentPillars: brief?.contentPillars ?? [],
    primaryCta: brief?.primaryCta ?? "",
    eventFormat: brief?.eventFormat ?? "",
    eventConcept: brief?.eventConcept ?? "",
    eventLocation: brief?.eventLocation ?? "",
    expectedScale: brief?.expectedScale ?? "",
    eventHighlights: brief?.eventHighlights ?? [],
    launchPhases: brief?.launchPhases ?? [],
    uspFocus: brief?.uspFocus ?? [],
    digitalFormats: brief?.digitalFormats ?? [],
    kpiFocus: brief?.kpiFocus ?? [],
    kolTiers: brief?.kolTiers ?? [],
    prAngles: brief?.prAngles ?? [],
    promoMechanics: brief?.promoMechanics ?? [],
    seasonalHook: brief?.seasonalHook ?? "",
    keyMessage: brief?.keyMessage ?? "",
    brandTones: brief?.brandTones ?? [],
    notes: brief?.notes ?? "",
    generatedBrief: brief?.generatedBrief ?? "",
    generatedBriefUpdatedAt: brief?.generatedBriefUpdatedAt ?? "",
  };
}

export function serializeCompactBrief(
  brief: Required<CampaignBrief>,
): CampaignBrief | undefined {
  const next: CampaignBrief = {};
  if (brief.campaignFormats.length > 0)
    next.campaignFormats = brief.campaignFormats;
  if (brief.conceptType) next.conceptType = brief.conceptType;
  if (brief.conceptIdea.trim()) next.conceptIdea = brief.conceptIdea.trim();
  if (brief.objectives.length > 0) next.objectives = brief.objectives;
  if (brief.targetAudiences.length > 0)
    next.targetAudiences = brief.targetAudiences;
  if (brief.audienceInsights.length > 0)
    next.audienceInsights = brief.audienceInsights;
  if (brief.audienceNote.trim()) next.audienceNote = brief.audienceNote.trim();
  if (brief.channels.length > 0) next.channels = brief.channels;
  if (brief.contentPillars.length > 0)
    next.contentPillars = brief.contentPillars;
  if (brief.primaryCta) next.primaryCta = brief.primaryCta;
  if (brief.eventFormat) next.eventFormat = brief.eventFormat;
  if (brief.eventConcept) next.eventConcept = brief.eventConcept;
  if (brief.eventLocation.trim())
    next.eventLocation = brief.eventLocation.trim();
  if (brief.expectedScale.trim())
    next.expectedScale = brief.expectedScale.trim();
  if (brief.eventHighlights.length > 0)
    next.eventHighlights = brief.eventHighlights;
  if (brief.launchPhases.length > 0) next.launchPhases = brief.launchPhases;
  if (brief.uspFocus.length > 0) next.uspFocus = brief.uspFocus;
  if (brief.digitalFormats.length > 0)
    next.digitalFormats = brief.digitalFormats;
  if (brief.kpiFocus.length > 0) next.kpiFocus = brief.kpiFocus;
  if (brief.kolTiers.length > 0) next.kolTiers = brief.kolTiers;
  if (brief.prAngles.length > 0) next.prAngles = brief.prAngles;
  if (brief.promoMechanics.length > 0)
    next.promoMechanics = brief.promoMechanics;
  if (brief.seasonalHook) next.seasonalHook = brief.seasonalHook;
  if (brief.keyMessage.trim()) next.keyMessage = brief.keyMessage.trim();
  if (brief.brandTones.length > 0) next.brandTones = brief.brandTones;
  if (stripRichTextHtml(brief.notes)) next.notes = brief.notes;
  if (stripRichTextHtml(brief.generatedBrief))
    next.generatedBrief = brief.generatedBrief;
  if (brief.generatedBriefUpdatedAt)
    next.generatedBriefUpdatedAt = brief.generatedBriefUpdatedAt;
  return Object.keys(next).length > 0 ? next : undefined;
}

export function isBriefDraftEqual(
  left: {
    strategyDetail: string;
    brandGuideline: string;
    brief: Required<CampaignBrief>;
  },
  right: {
    strategyDetail: string;
    brandGuideline: string;
    brief: Required<CampaignBrief>;
  },
): boolean {
  return (
    left.strategyDetail === right.strategyDetail &&
    left.brandGuideline === right.brandGuideline &&
    JSON.stringify(serializeCompactBrief(left.brief) ?? {}) ===
      JSON.stringify(serializeCompactBrief(right.brief) ?? {})
  );
}

export function toggleBriefOption<T extends string>(list: T[], option: T): T[] {
  return list.includes(option)
    ? list.filter((item) => item !== option)
    : [...list, option];
}

export function countFilledBriefBlocks(
  campaign: Pick<Campaign, "strategyDetail" | "brandGuideline">,
  brief: Required<CampaignBrief>,
): { filled: number; total: number } {
  const hasFormatDetail =
    brief.launchPhases.length > 0 ||
    brief.uspFocus.length > 0 ||
    brief.digitalFormats.length > 0 ||
    brief.kpiFocus.length > 0 ||
    brief.kolTiers.length > 0 ||
    brief.prAngles.length > 0 ||
    brief.promoMechanics.length > 0 ||
    Boolean(brief.seasonalHook) ||
    Boolean(brief.eventFormat) ||
    Boolean(brief.eventConcept) ||
    Boolean(brief.eventLocation.trim()) ||
    Boolean(brief.expectedScale.trim()) ||
    brief.eventHighlights.length > 0;

  const checks = [
    brief.campaignFormats.length > 0 || Boolean(brief.conceptType),
    brief.objectives.length > 0 || brief.kpiFocus.length > 0,
    brief.channels.length > 0 || hasFormatDetail,
    brief.targetAudiences.length > 0 ||
      brief.audienceInsights.length > 0 ||
      Boolean(brief.audienceNote.trim()),
    Boolean(brief.keyMessage.trim()) ||
      brief.contentPillars.length > 0 ||
      Boolean(stripRichTextHtml(campaign.strategyDetail || "")),
    brief.brandTones.length > 0 ||
      Boolean(stripRichTextHtml(campaign.brandGuideline || "")) ||
      Boolean(stripRichTextHtml(brief.notes)),
  ];
  return {
    filled: checks.filter(Boolean).length,
    total: checks.length,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mapLabels(
  values: string[],
  prefix: string,
  t: TFunction,
): string[] {
  return values.map((val) => t(`${prefix}.${val}`, { defaultValue: val }));
}

export function generateCampaignMasterBrief({
  campaign,
  timeline,
  brief,
  strategyDetail,
  brandGuideline,
  t,
}: {
  campaign: Campaign;
  timeline: Timeline;
  brief: Required<CampaignBrief>;
  strategyDetail: string;
  brandGuideline: string;
  t: TFunction;
}): string {
  const sections: string[] = [];
  const liField = (label: string, value: string) =>
    `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`;
  const liMultilineField = (label: string, rawText: string) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:[-–—•*+]|\d+[.)])\s+/, "").trim())
      .filter(Boolean);
    if (lines.length <= 1) {
      return liField(label, lines[0] ?? rawText.trim());
    }
    return `<li><strong>${escapeHtml(label)}:</strong><ul>${lines
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("")}</ul></li>`;
  };
  const ul = (items: string[], escapeItems = true) =>
    items.length > 0
      ? `<ul>${items
          .map((item) => (escapeItems ? `<li>${escapeHtml(item)}</li>` : item))
          .join("")}</ul>`
      : "";

  // 1. Tổng quan chiến dịch
  const overviewItems: string[] = [
    liField(
      t("campaign.brief.generated.campaignName", {
        defaultValue: "Tên chiến dịch",
      }),
      campaign.name,
    ),
  ];
  if (timeline.startDate || timeline.endDate) {
    overviewItems.push(
      liField(
        t("campaign.brief.generated.timeframe", {
          defaultValue: "Thời gian triển khai",
        }),
        `${timeline.startDate || "..."} → ${timeline.endDate || "..."}`,
      ),
    );
  }
  if (brief.campaignFormats.length > 0) {
    overviewItems.push(
      liField(
        t("campaign.brief.fields.campaignFormats", {
          defaultValue: "Hình thức truyền thông",
        }),
        mapLabels(brief.campaignFormats, "campaign.brief.commFormatOptions", t).join(", "),
      ),
    );
  }
  if (brief.conceptType || brief.conceptIdea.trim()) {
    const conceptLabel = brief.conceptType
      ? t(`campaign.brief.conceptTypeOptions.${brief.conceptType}`, {
          defaultValue: brief.conceptType,
        })
      : "";
    overviewItems.push(
      liField(
        t("campaign.brief.fields.conceptType", {
          defaultValue: "Ý tưởng định hướng",
        }),
        [conceptLabel, brief.conceptIdea.trim()].filter(Boolean).join(" — "),
      ),
    );
  }
  sections.push(
    `<h2>1. ${escapeHtml(t("campaign.brief.generated.secOverview", { defaultValue: "Tổng quan chiến dịch" }))}</h2>${ul(overviewItems, false)}`,
  );

  // 2. Mục tiêu & Kênh & Đối tượng
  const targetItems: string[] = [];
  if (brief.objectives.length > 0) {
    targetItems.push(
      liField(
        t("campaign.brief.fields.objectives"),
        mapLabels(brief.objectives, "campaign.brief.objectiveOptions", t).join(", "),
      ),
    );
  }
  if (brief.channels.length > 0) {
    targetItems.push(
      liField(
        t("campaign.brief.fields.channels"),
        mapLabels(brief.channels, "campaign.brief.channelOptions", t).join(", "),
      ),
    );
  }
  if (brief.targetAudiences.length > 0) {
    targetItems.push(
      liField(
        t("campaign.brief.fields.targetAudiences"),
        mapLabels(brief.targetAudiences, "campaign.brief.audienceOptions", t).join(", "),
      ),
    );
  }
  if (brief.audienceInsights.length > 0) {
    targetItems.push(
      liField(
        t("campaign.brief.fields.audienceInsights", {
          defaultValue: "Động lực mua hàng của khách",
        }),
        mapLabels(brief.audienceInsights, "campaign.brief.audienceInsightOptions", t).join(", "),
      ),
    );
  }
  if (brief.audienceNote.trim()) {
    targetItems.push(
      liMultilineField(t("campaign.brief.fields.audienceNote"), brief.audienceNote.trim()),
    );
  }
  if (targetItems.length > 0) {
    sections.push(
      `<h2>2. ${escapeHtml(t("campaign.brief.generated.secAudience", { defaultValue: "Mục tiêu, Kênh & Khách hàng mục tiêu" }))}</h2>${ul(targetItems, false)}`,
    );
  }

  // 3. Triển khai đặc thù theo Hình thức truyền thông
  const formatBullets: string[] = [];
  if (brief.campaignFormats.includes("BRAND_LAUNCH") || brief.launchPhases.length > 0 || brief.uspFocus.length > 0) {
    if (brief.launchPhases.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.launchPhases", { defaultValue: "Giai đoạn ra mắt" }),
          mapLabels(brief.launchPhases, "campaign.brief.launchPhaseOptions", t).join(" → "),
        ),
      );
    }
    if (brief.uspFocus.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.uspFocus", { defaultValue: "Lợi thế cạnh tranh nổi bật" }),
          mapLabels(brief.uspFocus, "campaign.brief.uspFocusOptions", t).join(", "),
        ),
      );
    }
  }
  if (
    brief.campaignFormats.includes("OFFLINE_ACTIVATION") ||
    brief.eventFormat ||
    brief.eventConcept ||
    brief.eventLocation.trim() ||
    brief.expectedScale.trim() ||
    brief.eventHighlights.length > 0
  ) {
    if (brief.eventFormat) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.eventFormat"),
          t(`campaign.brief.eventFormatOptions.${brief.eventFormat}`, {
            defaultValue: brief.eventFormat,
          }),
        ),
      );
    }
    if (brief.eventConcept) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.eventConcept", { defaultValue: "Loại hình sự kiện" }),
          t(`campaign.brief.eventConceptOptions.${brief.eventConcept}`, {
            defaultValue: brief.eventConcept,
          }),
        ),
      );
    }
    if (brief.eventLocation.trim()) {
      formatBullets.push(
        liField(t("campaign.brief.fields.eventLocation"), brief.eventLocation.trim()),
      );
    }
    if (brief.expectedScale.trim()) {
      formatBullets.push(
        liField(t("campaign.brief.fields.expectedScale"), brief.expectedScale.trim()),
      );
    }
    if (brief.eventHighlights.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.eventHighlights", { defaultValue: "Điểm nhấn trải nghiệm" }),
          mapLabels(brief.eventHighlights, "campaign.brief.eventHighlightOptions", t).join(", "),
        ),
      );
    }
  }
  if (brief.campaignFormats.includes("DIGITAL_SOCIAL") || brief.digitalFormats.length > 0 || brief.kpiFocus.length > 0) {
    if (brief.digitalFormats.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.digitalFormats", { defaultValue: "Định dạng nội dung ưu tiên" }),
          mapLabels(brief.digitalFormats, "campaign.brief.digitalFormatOptions", t).join(", "),
        ),
      );
    }
    if (brief.kpiFocus.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.kpiFocus", { defaultValue: "KPI trọng tâm" }),
          mapLabels(brief.kpiFocus, "campaign.brief.kpiFocusOptions", t).join(", "),
        ),
      );
    }
  }
  if (brief.campaignFormats.includes("INFLUENCER_PR") || brief.kolTiers.length > 0 || brief.prAngles.length > 0) {
    if (brief.kolTiers.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.kolTiers", { defaultValue: "Nhóm KOL và KOC mục tiêu" }),
          mapLabels(brief.kolTiers, "campaign.brief.kolTierOptions", t).join(", "),
        ),
      );
    }
    if (brief.prAngles.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.prAngles", { defaultValue: "Góc độ khai thác báo chí PR" }),
          mapLabels(brief.prAngles, "campaign.brief.prAngleOptions", t).join(", "),
        ),
      );
    }
  }
  if (brief.campaignFormats.includes("PROMOTION_SEASONAL") || brief.promoMechanics.length > 0 || brief.seasonalHook) {
    if (brief.seasonalHook) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.seasonalHook", { defaultValue: "Dịp cao điểm theo mùa" }),
          t(`campaign.brief.seasonalHookOptions.${brief.seasonalHook}`, {
            defaultValue: brief.seasonalHook,
          }),
        ),
      );
    }
    if (brief.promoMechanics.length > 0) {
      formatBullets.push(
        liField(
          t("campaign.brief.fields.promoMechanics", { defaultValue: "Cơ chế ưu đãi" }),
          mapLabels(brief.promoMechanics, "campaign.brief.promoMechanicOptions", t).join(", "),
        ),
      );
    }
  }
  if (formatBullets.length > 0) {
    sections.push(
      `<h2>3. ${escapeHtml(t("campaign.brief.generated.secFormatPlan", { defaultValue: "Kế hoạch theo hình thức đã chọn" }))}</h2>${ul(formatBullets, false)}`,
    );
  }

  // 4. Thông điệp & Định hướng nội dung & Thương hiệu
  const messageItems: string[] = [];
  if (brief.keyMessage.trim()) {
    messageItems.push(liField(t("campaign.brief.fields.keyMessage"), brief.keyMessage.trim()));
  }
  if (brief.primaryCta) {
    messageItems.push(
      liField(
        t("campaign.brief.fields.primaryCta", { defaultValue: "Kêu gọi hành động chính" }),
        t(`campaign.brief.primaryCtaOptions.${brief.primaryCta}`, {
          defaultValue: brief.primaryCta,
        }),
      ),
    );
  }
  if (brief.contentPillars.length > 0) {
    messageItems.push(
      liField(
        t("campaign.brief.fields.contentPillars", { defaultValue: "Trụ cột nội dung" }),
        mapLabels(brief.contentPillars, "campaign.brief.contentPillarOptions", t).join(", "),
      ),
    );
  }
  if (brief.brandTones.length > 0) {
    messageItems.push(
      liField(
        t("campaign.brief.fields.brandTones"),
        mapLabels(brief.brandTones, "campaign.brief.brandToneOptions", t).join(", "),
      ),
    );
  }
  const cleanStrategy = stripRichTextHtml(strategyDetail);
  if (cleanStrategy) {
    messageItems.push(liMultilineField(t("campaign.brief.fields.strategyDetail"), cleanStrategy));
  }
  const cleanBrand = stripRichTextHtml(brandGuideline);
  if (cleanBrand) {
    messageItems.push(liMultilineField(t("campaign.brief.fields.brandGuideline"), cleanBrand));
  }
  const cleanNotes = stripRichTextHtml(brief.notes);
  if (cleanNotes) {
    messageItems.push(liMultilineField(t("campaign.brief.fields.notes"), cleanNotes));
  }
  if (messageItems.length > 0) {
    sections.push(
      `<h2>4. ${escapeHtml(t("campaign.brief.generated.secMessaging", { defaultValue: "Thông điệp, Định hướng nội dung & Thương hiệu" }))}</h2>${ul(messageItems, false)}`,
    );
  }

  // 5. Phạm vi bàn giao & Mốc chính
  const deliverableBullets = (campaign.deliverablePlan ?? []).map(
    (d) => `<li><strong>${escapeHtml(d.name)}</strong> (${escapeHtml(String(d.quantity))})</li>`,
  );
  const milestoneBullets = (timeline.milestones ?? []).map(
    (m) => `<li><strong>${escapeHtml(m.date)}:</strong> ${escapeHtml(m.name)}</li>`,
  );
  if (deliverableBullets.length > 0 || milestoneBullets.length > 0) {
    let scopeHtml = `<h2>5. ${escapeHtml(t("campaign.brief.generated.secDeliverables", { defaultValue: "Phạm vi bàn giao & Mốc kế hoạch" }))}</h2>`;
    if (deliverableBullets.length > 0) {
      scopeHtml += `<p><strong>${escapeHtml(t("campaign.brief.generated.deliverablesLabel", { defaultValue: "Hạng mục trong gói" }))}:</strong></p>${ul(deliverableBullets, false)}`;
    }
    if (milestoneBullets.length > 0) {
      scopeHtml += `<p><strong>${escapeHtml(t("campaign.brief.generated.milestonesLabel", { defaultValue: "Các mốc quan trọng" }))}:</strong></p>${ul(milestoneBullets, false)}`;
    }
    sections.push(scopeHtml);
  }

  return sections.join("");
}

export function buildAiPromptFromBrief(
  campaignName: string,
  generatedBriefHtml: string,
  t?: TFunction,
): string {
  const plain = stripRichTextHtml(generatedBriefHtml);
  if (t) {
    return [
      t("campaign.brief.generated.aiHeader", {
        name: campaignName,
        defaultValue: `[NGỮ CẢNH CHIẾN DỊCH BRANDHUB — "${campaignName}"]`,
      }),
      t("campaign.brief.generated.aiIntro", {
        defaultValue:
          "Hãy đóng vai Chuyên gia Hoạch định Nội dung cấp cao. Dưới đây là bản tổng quan chiến dịch truyền thông đã được thống nhất:",
      }),
      "",
      plain,
      "",
      t("campaign.brief.generated.aiFooter", {
        defaultValue:
          "Yêu cầu: Bám sát mục tiêu, chân dung khách hàng, động lực mua hàng, ý tưởng chủ đạo, thông điệp chính, kêu gọi hành động và tông giọng thương hiệu ở trên để đề xuất hoặc triển khai nội dung phù hợp cho từng kênh.",
      }),
    ].join("\n");
  }
  return [
    `[NGỮ CẢNH CHIẾN DỊCH BRANDHUB — "${campaignName}"]`,
    "Hãy đóng vai Chuyên gia Hoạch định Nội dung cấp cao. Dưới đây là bản tổng quan chiến dịch truyền thông đã được thống nhất:",
    "",
    plain,
    "",
    "Yêu cầu: Bám sát mục tiêu, chân dung khách hàng, động lực mua hàng, ý tưởng chủ đạo, thông điệp chính, kêu gọi hành động và tông giọng thương hiệu ở trên để đề xuất hoặc triển khai nội dung phù hợp cho từng kênh.",
  ].join("\n");
}

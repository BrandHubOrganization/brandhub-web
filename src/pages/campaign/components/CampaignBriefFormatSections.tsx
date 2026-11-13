import {
  CalendarClock,
  Globe,
  MapPin,
  Megaphone,
  Rocket,
  Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RubberSegment } from "@/components/micro";
import {
  BriefChipGroup,
  BriefSingleChipGroup,
} from "@/pages/campaign/components/CampaignBriefChipGroup";
import type {
  CampaignBrief,
  CampaignCommFormat,
  CampaignEventFormat,
} from "@/pages/campaign/types";
import {
  CAMPAIGN_EVENT_FORMATS,
  DIGITAL_FORMAT_KEYS,
  EVENT_CONCEPT_KEYS,
  EVENT_HIGHLIGHT_KEYS,
  KOL_TIER_KEYS,
  KPI_FOCUS_KEYS,
  LAUNCH_PHASE_KEYS,
  PR_ANGLE_KEYS,
  PROMO_MECHANIC_KEYS,
  SEASONAL_HOOK_KEYS,
  USP_FOCUS_KEYS,
  toggleBriefOption,
} from "@/pages/campaign/utils/campaignBrief";

export function CampaignBriefFormatSections({
  brief,
  editable,
  onUpdateField,
  onSelectFormatQuick,
}: {
  brief: Required<CampaignBrief>;
  editable: boolean;
  onUpdateField: <K extends keyof CampaignBrief>(
    key: K,
    value: Required<CampaignBrief>[K],
  ) => void;
  onSelectFormatQuick: (format: CampaignCommFormat) => void;
}) {
  const { t } = useTranslation();
  const has = (fmt: CampaignCommFormat) => brief.campaignFormats.includes(fmt);

  const showLaunch =
    has("BRAND_LAUNCH") ||
    brief.launchPhases.length > 0 ||
    brief.uspFocus.length > 0;
  const showEvent =
    has("OFFLINE_ACTIVATION") ||
    Boolean(brief.eventFormat) ||
    Boolean(brief.eventConcept) ||
    Boolean(brief.eventLocation.trim()) ||
    Boolean(brief.expectedScale.trim()) ||
    brief.eventHighlights.length > 0;
  const showDigital =
    has("DIGITAL_SOCIAL") ||
    brief.digitalFormats.length > 0 ||
    brief.kpiFocus.length > 0;
  const showPr =
    has("INFLUENCER_PR") ||
    brief.kolTiers.length > 0 ||
    brief.prAngles.length > 0;
  const showPromo =
    has("PROMOTION_SEASONAL") ||
    brief.promoMechanics.length > 0 ||
    Boolean(brief.seasonalHook);

  if (!showLaunch && !showEvent && !showDigital && !showPr && !showPromo) {
    return (
      <div className="border-border/70 bg-muted/25 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2.5">
        <p className="text-muted-foreground text-xs">
          {t("campaign.brief.noFormatHint")}
        </p>
        {editable && (
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                "DIGITAL_SOCIAL",
                "BRAND_LAUNCH",
                "OFFLINE_ACTIVATION",
              ] as const
            ).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onSelectFormatQuick(fmt)}
                className="border-border/80 bg-background text-foreground/85 hover:border-brand-orange hover:text-brand-orange cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
              >
                + {t(`campaign.brief.commFormatOptions.${fmt}`)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {showLaunch && (
        <div className="border-border/70 bg-muted/20 space-y-3 rounded-lg border p-3.5">
          <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
            <Rocket className="text-brand-orange size-3.5" />
            <span>{t("campaign.brief.commFormatOptions.BRAND_LAUNCH")}</span>
          </div>
          <BriefChipGroup
            label={t("campaign.brief.fields.launchPhases")}
            options={LAUNCH_PHASE_KEYS}
            selected={brief.launchPhases}
            editable={editable}
            onToggle={(option) =>
              onUpdateField(
                "launchPhases",
                toggleBriefOption(brief.launchPhases, option),
              )
            }
            getLabel={(option) =>
              t(`campaign.brief.launchPhaseOptions.${option}`, option)
            }
          />
          <BriefChipGroup
            label={t("campaign.brief.fields.uspFocus")}
            options={USP_FOCUS_KEYS}
            selected={brief.uspFocus}
            editable={editable}
            onToggle={(option) =>
              onUpdateField("uspFocus", toggleBriefOption(brief.uspFocus, option))
            }
            getLabel={(option) =>
              t(`campaign.brief.uspFocusOptions.${option}`, option)
            }
          />
        </div>
      )}

      {showDigital && (
        <div className="border-border/70 bg-muted/20 space-y-3 rounded-lg border p-3.5">
          <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
            <Globe className="text-brand-orange size-3.5" />
            <span>{t("campaign.brief.commFormatOptions.DIGITAL_SOCIAL")}</span>
          </div>
          <BriefChipGroup
            label={t("campaign.brief.fields.digitalFormats")}
            options={DIGITAL_FORMAT_KEYS}
            selected={brief.digitalFormats}
            editable={editable}
            onToggle={(option) =>
              onUpdateField(
                "digitalFormats",
                toggleBriefOption(brief.digitalFormats, option),
              )
            }
            getLabel={(option) =>
              t(`campaign.brief.digitalFormatOptions.${option}`, option)
            }
          />
          <BriefChipGroup
            label={t("campaign.brief.fields.kpiFocus")}
            options={KPI_FOCUS_KEYS}
            selected={brief.kpiFocus}
            editable={editable}
            onToggle={(option) =>
              onUpdateField("kpiFocus", toggleBriefOption(brief.kpiFocus, option))
            }
            getLabel={(option) =>
              t(`campaign.brief.kpiFocusOptions.${option}`, option)
            }
          />
        </div>
      )}

      {showEvent && (
        <div className="border-border/70 bg-muted/20 space-y-3 rounded-lg border p-3.5 lg:col-span-2">
          <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
            <CalendarClock className="text-brand-orange size-3.5" />
            <span>
              {t("campaign.brief.commFormatOptions.OFFLINE_ACTIVATION")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-brand-orange block text-xs font-semibold">
                {t("campaign.brief.fields.eventFormat")}
              </Label>
              {editable ? (
                <RubberSegment
                  size="xs"
                  variant="solid"
                  ariaLabel={t("campaign.brief.fields.eventFormat")}
                  value={brief.eventFormat || ""}
                  onValueChange={(next) =>
                    onUpdateField(
                      "eventFormat",
                      brief.eventFormat === next
                        ? ""
                        : (next as CampaignEventFormat),
                    )
                  }
                  className="w-full"
                  optionClassName="flex-1"
                  options={CAMPAIGN_EVENT_FORMATS.map((fmt) => ({
                    value: fmt,
                    label:
                      fmt === "OFFLINE"
                        ? "Offline"
                        : fmt === "ONLINE"
                          ? "Online"
                          : "Hybrid",
                  }))}
                />
              ) : (
                <p className="text-foreground text-xs font-medium">
                  {brief.eventFormat
                    ? t(`campaign.brief.eventFormatOptions.${brief.eventFormat}`)
                    : "—"}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="brief-event-location"
                className="text-foreground/85 flex items-center gap-1 text-xs font-medium"
              >
                <MapPin className="size-3" />
                <span>{t("campaign.brief.fields.eventLocation")}</span>
              </Label>
              {editable ? (
                <Input
                  id="brief-event-location"
                  value={brief.eventLocation}
                  onChange={(e) =>
                    onUpdateField("eventLocation", e.target.value)
                  }
                  placeholder={t(
                    "campaign.brief.fields.eventLocationPlaceholder",
                  )}
                  maxLength={300}
                  className="bg-background h-8 text-xs"
                />
              ) : (
                <p className="text-foreground text-xs">
                  {brief.eventLocation || "—"}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="brief-expected-scale"
                className="text-foreground/85 block text-xs font-medium"
              >
                {t("campaign.brief.fields.expectedScale")}
              </Label>
              {editable ? (
                <Input
                  id="brief-expected-scale"
                  value={brief.expectedScale}
                  onChange={(e) =>
                    onUpdateField("expectedScale", e.target.value)
                  }
                  placeholder={t(
                    "campaign.brief.fields.expectedScalePlaceholder",
                  )}
                  maxLength={200}
                  className="bg-background h-8 text-xs"
                />
              ) : (
                <p className="text-foreground text-xs">
                  {brief.expectedScale || "—"}
                </p>
              )}
            </div>
          </div>

          <BriefSingleChipGroup
            label={t("campaign.brief.fields.eventConcept")}
            options={EVENT_CONCEPT_KEYS}
            value={brief.eventConcept}
            editable={editable}
            onChange={(val) => onUpdateField("eventConcept", val)}
            getLabel={(option) =>
              t(`campaign.brief.eventConceptOptions.${option}`, option)
            }
          />
          <BriefChipGroup
            label={t("campaign.brief.fields.eventHighlights")}
            options={EVENT_HIGHLIGHT_KEYS}
            selected={brief.eventHighlights}
            editable={editable}
            onToggle={(option) =>
              onUpdateField(
                "eventHighlights",
                toggleBriefOption(brief.eventHighlights, option),
              )
            }
            getLabel={(option) =>
              t(`campaign.brief.eventHighlightOptions.${option}`, option)
            }
          />
        </div>
      )}

      {showPr && (
        <div className="border-border/70 bg-muted/20 space-y-3 rounded-lg border p-3.5">
          <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
            <Megaphone className="text-brand-orange size-3.5" />
            <span>{t("campaign.brief.commFormatOptions.INFLUENCER_PR")}</span>
          </div>
          <BriefChipGroup
            label={t("campaign.brief.fields.kolTiers")}
            options={KOL_TIER_KEYS}
            selected={brief.kolTiers}
            editable={editable}
            onToggle={(option) =>
              onUpdateField("kolTiers", toggleBriefOption(brief.kolTiers, option))
            }
            getLabel={(option) =>
              t(`campaign.brief.kolTierOptions.${option}`, option)
            }
          />
          <BriefChipGroup
            label={t("campaign.brief.fields.prAngles")}
            options={PR_ANGLE_KEYS}
            selected={brief.prAngles}
            editable={editable}
            onToggle={(option) =>
              onUpdateField("prAngles", toggleBriefOption(brief.prAngles, option))
            }
            getLabel={(option) =>
              t(`campaign.brief.prAngleOptions.${option}`, option)
            }
          />
        </div>
      )}

      {showPromo && (
        <div className="border-border/70 bg-muted/20 space-y-3 rounded-lg border p-3.5">
          <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
            <Tag className="text-brand-orange size-3.5" />
            <span>
              {t("campaign.brief.commFormatOptions.PROMOTION_SEASONAL")}
            </span>
          </div>
          <BriefSingleChipGroup
            label={t("campaign.brief.fields.seasonalHook")}
            options={SEASONAL_HOOK_KEYS}
            value={brief.seasonalHook}
            editable={editable}
            onChange={(val) => onUpdateField("seasonalHook", val)}
            getLabel={(option) =>
              t(`campaign.brief.seasonalHookOptions.${option}`, option)
            }
          />
          <BriefChipGroup
            label={t("campaign.brief.fields.promoMechanics")}
            options={PROMO_MECHANIC_KEYS}
            selected={brief.promoMechanics}
            editable={editable}
            onToggle={(option) =>
              onUpdateField(
                "promoMechanics",
                toggleBriefOption(brief.promoMechanics, option),
              )
            }
            getLabel={(option) =>
              t(`campaign.brief.promoMechanicOptions.${option}`, option)
            }
          />
        </div>
      )}
    </div>
  );
}

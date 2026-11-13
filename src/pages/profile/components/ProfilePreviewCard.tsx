import React from "react";
import { useTranslation } from "react-i18next";
import { RichTextContent } from "@/components/ui/rich-text-input";
import {
  BadgeCheck,
  Briefcase,
  Clock,
  ExternalLink,
  Eye,
  Languages,
  MapPin,
} from "lucide-react";
import type { ExtendedProfile } from "../types";
import {
  isCuratedJobTitle,
  isLanguage,
  isSkill,
  parseLanguages,
} from "../constants";
import { SocialIconButton } from "./SocialIcon";

interface ProfilePreviewCardProps {
  ext: ExtendedProfile;
  avatarUrl: string | null;
  name: string;
  professionalTitle: string;
  bio: string;
  portfolioUrls: string[];
  workingLanguage: string;
  timezone: string;
  socials: readonly { key: string; url: string }[];
}

export const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({
  ext,
  avatarUrl,
  name,
  professionalTitle,
  bio,
  portfolioUrls,
  workingLanguage,
  timezone,
  socials,
}) => {
  const { t } = useTranslation();

  const jobTitleDisplay = professionalTitle
    ? isCuratedJobTitle(professionalTitle)
      ? t(`profile.jobTitle.${professionalTitle}`)
      : professionalTitle
    : "";

  const parsedLanguages = workingLanguage
    ? parseLanguages(workingLanguage)
    : [];
  const languagesDisplay =
    parsedLanguages.length > 0
      ? parsedLanguages
          .map((c) => (isLanguage(c) ? t(`profile.language.${c}`) : c))
          .join(", ")
      : "";

  const validPortfolios = portfolioUrls.filter((u) => u.trim() !== "");

  const hasExperience = Boolean(ext.yearsOfExperience);
  const hasLanguage = Boolean(languagesDisplay);
  const hasLocation = Boolean(ext.location);
  const hasTimezone = Boolean(timezone);
  const hasGridInfo =
    hasExperience || hasLanguage || hasLocation || hasTimezone;

  return (
    <div className="border-border bg-card rounded-xl border p-6 lg:sticky lg:top-6">
      <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <Eye className="size-4" />
        {t("profile.preview.title")}
      </h3>
      <p className="text-muted-foreground mt-2 text-xs">
        {t("profile.preview.hint")}
      </p>

      <div className="border-border bg-card mt-4 overflow-hidden rounded-xl border">
        {/* Banner */}
        <div className="bg-muted/30 relative h-20 w-full">
          {ext.bannerUrl ? (
            <img
              src={ext.bannerUrl}
              alt={t("profile.edit.bannerLabel")}
              className="size-full object-cover"
            />
          ) : (
            <div className="via-brand-orange/5 text-muted-foreground text-3xs flex size-full items-center justify-center bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              {t("profile.edit.bannerPlaceholder")}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="space-y-3.5 p-4 pt-0">
          {/* Header Compact: Avatar + Name + Verified Badge + Professional Title */}
          <div className="flex items-start gap-3">
            <div className="relative z-10 -mt-6 shrink-0">
              <div className="border-card bg-card flex size-14 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center text-lg font-bold">
                    {(name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-0.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-foreground truncate text-sm font-semibold">
                  {name || t("profile.preview.nameEmpty")}
                </p>
                <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium">
                  <BadgeCheck className="size-3" />
                  {t("profile.verified")}
                </span>
              </div>
              {jobTitleDisplay && (
                <p className="text-muted-foreground truncate text-xs font-medium">
                  {jobTitleDisplay}
                </p>
              )}
            </div>
          </div>

          {/* Bio block: nếu có bio, hiển thị trang nhã (line-clamp-3, text-xs) */}
          {bio.trim() && (
            <div className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
              <RichTextContent value={bio} className="text-xs leading-relaxed" />
            </div>
          )}

          {/* Bố cục Lưới 2 Cột (2-Column Grid) */}
          {hasGridInfo && (
            <div className="bg-muted/30 border-border/50 grid grid-cols-2 gap-2 rounded-lg border p-2.5 text-xs">
              {/* Cột 1: Kinh nghiệm & Ngôn ngữ làm việc */}
              <div className="min-w-0 space-y-1.5">
                {hasExperience && (
                  <div
                    className="text-foreground flex items-center gap-1.5 truncate"
                    title={t("profile.view.yearsOfExperienceValue", {
                      years: Number(ext.yearsOfExperience),
                    })}
                  >
                    <Briefcase className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">
                      {t("profile.view.yearsOfExperienceValue", {
                        years: Number(ext.yearsOfExperience),
                      })}
                    </span>
                  </div>
                )}
                {hasLanguage && (
                  <div
                    className="text-foreground flex items-center gap-1.5 truncate"
                    title={languagesDisplay}
                  >
                    <Languages className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">{languagesDisplay}</span>
                  </div>
                )}
              </div>

              {/* Cột 2: Địa điểm & Múi giờ */}
              <div className="min-w-0 space-y-1.5">
                {hasLocation && (
                  <div
                    className="text-foreground flex items-center gap-1.5 truncate"
                    title={ext.location}
                  >
                    <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">{ext.location}</span>
                  </div>
                )}
                {hasTimezone && (
                  <div
                    className="text-foreground flex items-center gap-1.5 truncate"
                    title={timezone}
                  >
                    <Clock className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">{timezone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kỹ năng (Skills): badges bo tròn thanh lịch bg-brand-orange-soft text-brand-orange text-3xs font-medium */}
          {ext.skills.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-3xs font-medium tracking-wider uppercase">
                {t("profile.view.skillsLabel")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ext.skills.map((slug) => (
                  <span
                    key={slug}
                    className="bg-brand-orange-soft text-brand-orange text-3xs rounded-full px-2 py-0.5 font-medium"
                  >
                    {isSkill(slug) ? t(`profile.skill.${slug}`) : slug}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio URLs: hiển thị dạng link gọn gàng có icon ExternalLink (size-3) */}
          {validPortfolios.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-3xs font-medium tracking-wider uppercase">
                {t("profile.view.portfolioLabel")}
              </p>
              <ul className="space-y-1">
                {validPortfolios.map((url) => (
                  <li key={url} className="min-w-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-orange inline-flex max-w-full items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      <span className="truncate">
                        {url.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mạng xã hội cá nhân: Thanh Social Icon Bar nằm ngang */}
          {socials.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <p className="text-muted-foreground text-3xs font-medium tracking-wider uppercase">
                {t("profile.view.socialLabel")}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {socials.map((s) => (
                  <SocialIconButton
                    key={s.key}
                    socialKey={s.key}
                    url={s.url}
                    title={t(`profile.view.${s.key}Label`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

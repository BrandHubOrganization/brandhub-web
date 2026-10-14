import React from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Eye, Link2 } from "lucide-react";
import type { ExtendedProfile } from "../types";
import { isCuratedJobTitle, isLanguage, isSkill, parseLanguages } from "../constants";

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

  return (
    <div className="border-border bg-card rounded-xl border p-6 lg:sticky lg:top-6">
      <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <Eye className="size-4" />
        {t("profile.preview.title")}
      </h3>
      <p className="text-muted-foreground mt-2 text-xs">
        {t("profile.preview.hint")}
      </p>

      <div className="border-border mt-4 overflow-hidden rounded-xl border">
        <div className="relative h-20 w-full bg-muted/30">
          {ext.bannerUrl ? (
            <img
              src={ext.bannerUrl}
              alt={t("profile.edit.bannerLabel")}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-r from-orange-500/10 via-brand-orange/5 to-amber-500/10 text-muted-foreground text-3xs">
              {t("profile.edit.bannerPlaceholder")}
            </div>
          )}
        </div>
        <div className="space-y-4 p-4 pt-0">
          <div className="flex items-center gap-3">
            <div className="relative -mt-6 shrink-0 z-10">
              <div className="size-12 rounded-full border-2 border-card bg-card shadow-sm overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center text-base font-bold">
                    {(name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 space-y-0.5 mt-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {name || t("profile.preview.nameEmpty")}
              </p>
              <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                <BadgeCheck className="size-3" />
                {t("profile.verified")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-3xs">
              {t("profile.view.jobTitleLabel")}
            </p>
            <p className="text-foreground text-xs font-medium">
              {professionalTitle
                ? isCuratedJobTitle(professionalTitle)
                  ? t(`profile.jobTitle.${professionalTitle}`)
                  : professionalTitle
                : t("profile.view.jobTitleEmpty")}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-3xs">
              {t("profile.view.bioLabel")}
            </p>
            <p className="text-foreground text-xs font-medium whitespace-pre-wrap">
              {bio || t("profile.view.bioEmpty")}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-3xs">
              {t("profile.view.portfolioLabel")}
            </p>
            {portfolioUrls.filter((u) => u.trim() !== "").length > 0 ? (
              <ul className="mt-1 space-y-1">
                {portfolioUrls
                  .filter((u) => u.trim() !== "")
                  .map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-orange text-xs font-medium hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-foreground text-xs font-medium">
                {t("profile.view.portfolioEmpty")}
              </p>
            )}
          </div>

          <div>
            <p className="text-muted-foreground text-3xs">
              {t("profile.view.workingLanguageLabel")}
            </p>
            <p className="text-foreground text-xs font-medium">
              {workingLanguage
                ? parseLanguages(workingLanguage)
                    .map((c) =>
                      isLanguage(c) ? t(`profile.language.${c}`) : c,
                    )
                    .join(", ")
                : t("profile.view.workingLanguageEmpty")}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-3xs">
              {t("profile.view.timezoneLabel")}
            </p>
            <p className="text-foreground text-xs font-medium">{timezone}</p>
          </div>

          {ext.skills.length > 0 && (
            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.skillsLabel")}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
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

          {ext.location && (
            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.locationLabel")}
              </p>
              <p className="text-foreground text-xs font-medium">
                {ext.location}
              </p>
            </div>
          )}

          {ext.yearsOfExperience && (
            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.yearsOfExperienceLabel")}
              </p>
              <p className="text-foreground text-xs font-medium">
                {t("profile.view.yearsOfExperienceValue", {
                  years: Number(ext.yearsOfExperience),
                })}
              </p>
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.socialLabel")}
              </p>
              <ul className="mt-1 space-y-1">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-orange inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <Link2 className="size-3" />
                      {t(`profile.view.${s.key}Label`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

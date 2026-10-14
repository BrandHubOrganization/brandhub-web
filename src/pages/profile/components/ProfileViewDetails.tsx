import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BellRing,
  Briefcase,
  Calendar,
  Clock,
  Link2,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { ExtendedProfile } from "../types";
import { isCuratedJobTitle, isLanguage, isSkill, parseLanguages } from "../constants";

interface ProfileViewDetailsProps {
  role: string;
  phone: string;
  joinedAt?: string | number;
  lastLoginAt?: string | number;
  professionalTitle: string;
  workingLanguage: string;
  timezone: string;
  bio: string;
  portfolioUrls: string[];
  ext: ExtendedProfile;
  socials: readonly { key: string; url: string }[];
  onOpenLinkPhone: () => void;
}

export const ProfileViewDetails: React.FC<ProfileViewDetailsProps> = ({
  role,
  phone,
  joinedAt,
  lastLoginAt,
  professionalTitle,
  workingLanguage,
  timezone,
  bio,
  portfolioUrls,
  ext,
  socials,
  onOpenLinkPhone,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="text-muted-foreground size-4" />
        <div>
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.roleLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Phone className="text-muted-foreground size-4" />
        <div className="flex-1">
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.phoneLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">
            {phone || t("profile.view.phoneEmpty")}
          </p>
        </div>
        <button
          type="button"
          className="text-brand-orange text-3xs cursor-pointer font-medium hover:underline"
          onClick={onOpenLinkPhone}
        >
          {phone
            ? t("profile.linkPhone.changeLink")
            : t("profile.linkPhone.addLink")}
        </button>
      </div>
      <div className="flex items-center gap-2.5">
        <Calendar className="text-muted-foreground size-4" />
        <div>
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.joinedLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">
            {joinedAt ? new Date(joinedAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Clock className="text-muted-foreground size-4" />
        <div>
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.lastLoginLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">
            {lastLoginAt ? new Date(lastLoginAt).toLocaleString() : "—"}
          </p>
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
          {t("profile.view.workingLanguageLabel")}
        </p>
        <p className="text-foreground text-xs font-medium">
          {workingLanguage
            ? parseLanguages(workingLanguage)
                .map((c) => (isLanguage(c) ? t(`profile.language.${c}`) : c))
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
      <div className="sm:col-span-2">
        <p className="text-muted-foreground text-3xs">
          {t("profile.view.bioLabel")}
        </p>
        <p className="text-foreground text-xs font-medium whitespace-pre-wrap">
          {bio || t("profile.view.bioEmpty")}
        </p>
      </div>
      <div className="sm:col-span-2">
        <p className="text-muted-foreground text-3xs">
          {t("profile.view.portfolioLabel")}
        </p>
        {portfolioUrls.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {portfolioUrls.map((url) => (
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
      <div className="sm:col-span-2">
        <p className="text-muted-foreground text-3xs">
          {t("profile.view.skillsLabel")}
        </p>
        {ext.skills.length > 0 ? (
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
        ) : (
          <p className="text-foreground text-xs font-medium">
            {t("profile.view.skillsEmpty")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <MapPin className="text-muted-foreground size-4" />
        <div>
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.locationLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">
            {ext.location || t("profile.view.locationEmpty")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Briefcase className="text-muted-foreground size-4" />
        <div>
          <p className="text-muted-foreground text-3xs">
            {t("profile.view.yearsOfExperienceLabel")}
          </p>
          <p className="text-foreground text-xs font-medium">
            {ext.yearsOfExperience
              ? t("profile.view.yearsOfExperienceValue", {
                  years: Number(ext.yearsOfExperience),
                })
              : t("profile.view.yearsOfExperienceEmpty")}
          </p>
        </div>
      </div>
      <div className="sm:col-span-2">
        <p className="text-muted-foreground text-3xs">
          {t("profile.view.socialLabel")}
        </p>
        {socials.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
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
        ) : (
          <p className="text-foreground text-xs font-medium">
            {t("profile.view.socialEmpty")}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <Link
          to="/settings/notifications"
          className="text-brand-orange inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
        >
          <BellRing className="size-3.5" />
          {t("profile.view.notificationsLink")}
        </Link>
      </div>
    </div>
  );
};

import { createElement, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Globe, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { DEFAULT_AGENCY_COVER } from "@/pages/agency/agencyDefaults";

export interface AgencyProfileData {
  name: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  logoIcon?: string | null;
  tagline?: string | null;
  category?: string | null;
  companySize?: string | null;
  foundedYear?: string | number | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  location?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}

interface AgencyProfileCardProps {
  profile: AgencyProfileData;
  compact?: boolean;
  actions?: ReactNode;
  hint?: ReactNode;
}

function webLink(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const address = value.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(address) && !/^https?:\/\//i.test(address))
    return undefined;
  try {
    return new URL(
      /^https?:\/\//i.test(address) ? address : `https://${address}`,
    ).href;
  } catch {
    return undefined;
  }
}

export function AgencyProfileCard({
  profile,
  compact = false,
  actions,
  hint,
}: AgencyProfileCardProps) {
  const { t } = useTranslation();
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const [failedBanner, setFailedBanner] = useState<string | null>(null);
  const logoUrl =
    profile.logoUrl &&
    !profile.logoUrl.startsWith("seed:") &&
    failedLogo !== profile.logoUrl
      ? profile.logoUrl
      : null;
  const bannerUrl =
    profile.bannerUrl &&
    !profile.bannerUrl.startsWith("seed:") &&
    failedBanner !== profile.bannerUrl
      ? profile.bannerUrl
      : null;
  const hasContacts = [
    profile.website,
    profile.phone,
    profile.location,
    profile.facebookUrl,
    profile.linkedinUrl,
    profile.instagramUrl,
  ].some((value) => value?.trim());
  const socialLinks = [
    {
      label: "Facebook",
      url: profile.facebookUrl,
      Icon: FaFacebook,
      className:
        "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400",
    },
    {
      label: "LinkedIn",
      url: profile.linkedinUrl,
      Icon: FaLinkedin,
      className:
        "bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:text-sky-400",
    },
    {
      label: "Instagram",
      url: profile.instagramUrl,
      Icon: FaInstagram,
      className:
        "bg-pink-500/10 text-pink-600 hover:bg-pink-500/15 dark:text-pink-400",
    },
  ];

  return (
    <article className="border-border bg-card text-foreground min-w-0 overflow-hidden rounded-xl border">
      <div
        className={cn(
          "bg-brand-orange-soft relative w-full overflow-hidden",
          compact ? "h-28" : "h-36 sm:h-44",
        )}
      >
        <img
          src={bannerUrl || DEFAULT_AGENCY_COVER}
          alt=""
          className="size-full object-cover"
          onError={bannerUrl ? () => setFailedBanner(bannerUrl) : undefined}
        />
        {actions && <div className="absolute right-4 bottom-3">{actions}</div>}
      </div>
      <div
        className={cn(
          "space-y-5 pt-0",
          compact ? "px-3.5 pb-4" : "px-5 pb-6 sm:px-6",
        )}
      >
        <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
          <div
            className={cn(
              "border-card bg-background relative -mt-7 flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 shadow-xs",
              compact ? "size-14" : "size-20",
            )}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={profile.name}
                className="size-full object-cover"
                onError={() => setFailedLogo(logoUrl)}
              />
            ) : (
              <div className="bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center">
                {createElement(getLogoIcon(profile.logoIcon), {
                  className: compact ? "size-7" : "size-10",
                  "aria-hidden": true,
                })}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1 pt-2">
            <h2
              className={cn(
                "font-bold break-words",
                compact ? "text-base" : "text-xl sm:text-2xl",
              )}
            >
              {profile.name.trim() || t("agency.create.previewNameFallback")}
            </h2>
            {(profile.tagline?.trim() || compact) && (
              <p className="text-muted-foreground text-sm break-words">
                {profile.tagline?.trim() ||
                  t("agency.create.previewSubtitleFallback")}
              </p>
            )}
          </div>
        </div>
        {(profile.category || profile.companySize || profile.foundedYear) && (
          <div className="flex flex-wrap items-center gap-2">
            {profile.category && (
              <span className="bg-brand-orange-soft text-brand-orange rounded-full px-2.5 py-1 text-xs font-medium">
                {t(`agency.category.${profile.category}`)}
              </span>
            )}
            {profile.companySize && (
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                {t(`agency.companySize.${profile.companySize}`)}
              </span>
            )}
            {profile.foundedYear && (
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                {t("agency.list.foundedIn", { year: profile.foundedYear })}
              </span>
            )}
          </div>
        )}
        <section className="border-border space-y-2 border-t pt-4">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("agency.create.previewAbout")}
          </h3>
          {profile.description?.trim() ? (
            <div
              className={cn(
                "prose prose-sm dark:prose-invert text-foreground/80 max-w-none text-sm leading-relaxed break-words [&_a]:break-all [&_img]:max-w-full",
                compact && "line-clamp-3",
              )}
              dangerouslySetInnerHTML={{ __html: profile.description }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("agency.create.emptyDescription")}
            </p>
          )}
        </section>
        {hasContacts && (
          <section className="border-border space-y-3 border-t pt-4">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {t("agency.create.previewContact")}
            </h3>
            <div className="space-y-2 text-sm">
              {profile.website?.trim() && (
                <div className="flex items-start gap-2">
                  <Globe
                    className="text-brand-orange mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={webLink(profile.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-all hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.phone?.trim() && (
                <div className="flex items-start gap-2">
                  <Phone
                    className="text-brand-orange mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="break-words">{profile.phone}</span>
                </div>
              )}
              {profile.location?.trim() && (
                <div className="flex items-start gap-2">
                  <MapPin
                    className="text-brand-orange mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">
                    {profile.location}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {socialLinks
                .filter((social) => webLink(social.url))
                .map(({ label, url, Icon, className }) => (
                  <a
                    key={label}
                    href={webLink(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                      className,
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </a>
                ))}
            </div>
          </section>
        )}
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
    </article>
  );
}

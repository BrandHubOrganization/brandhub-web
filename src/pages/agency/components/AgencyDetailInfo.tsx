import React from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  Globe,
  Link2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import type { Agency } from "@/types/agency";

interface AgencyDetailInfoProps {
  agency: Agency;
}

export const AgencyDetailInfo: React.FC<AgencyDetailInfoProps> = ({ agency }) => {
  const { t } = useTranslation();

  return (
    <>
      {agency.description ? (
        <div
          className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: agency.description }}
        />
      ) : (
        <p className="text-muted-foreground text-sm">—</p>
      )}
      <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="text-muted-foreground size-4 shrink-0" />
          <span>
            {agency.category ? t(`agency.category.${agency.category}`) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="text-muted-foreground size-4 shrink-0" />
          <span>
            {agency.companySize
              ? t(`agency.companySize.${agency.companySize}`)
              : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Globe className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate">{agency.website || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="text-muted-foreground size-4 shrink-0" />
          <span>{agency.phone || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="text-muted-foreground size-4 shrink-0" />
          <span>{agency.location || "—"}</span>
        </div>
        {agency.foundedYear && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="text-muted-foreground size-4 shrink-0" />
            <span>{agency.foundedYear}</span>
          </div>
        )}
      </div>
      {(agency.facebookUrl || agency.linkedinUrl || agency.instagramUrl) && (
        <div className="flex items-center gap-2 border-t pt-4">
          {agency.facebookUrl && (
            <a
              href={agency.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link2 className="size-4" />
            </a>
          )}
          {agency.linkedinUrl && (
            <a
              href={agency.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link2 className="size-4" />
            </a>
          )}
          {agency.instagramUrl && (
            <a
              href={agency.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link2 className="size-4" />
            </a>
          )}
        </div>
      )}
    </>
  );
};

import { useTranslation } from "react-i18next";
import {
  Building2,
  Calendar,
  Globe,
  MapPin,
  Mail,
  Phone,
  Quote,
  Tag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { ClientProfileFormValues } from "./ClientProfileForm";

/** Một dòng thông tin trong preview — ẩn khi chưa có giá trị. */
function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-2xs">{label}</p>
        <p className="text-foreground truncate text-xs">{value}</p>
      </div>
    </div>
  );
}

/**
 * Card xem trước hồ sơ thương hiệu, cập nhật ngay khi user gõ ở form bên trái.
 * Dùng raw value của form (chuỗi) — chưa normalize/validate cho tới lúc submit.
 */
export function ClientProfilePreview({
  values,
}: {
  values: ClientProfileFormValues | null;
}) {
  const { t } = useTranslation();
  const v = values;
  const name = v?.displayName.trim() ?? "";

  return (
    <div>
      <h3 className="text-foreground text-sm font-semibold">
        {t("clientProfile.preview.title")}
      </h3>
      <p className="text-muted-foreground mb-4 text-xs">
        {t("clientProfile.preview.hint")}
      </p>

      <div className="flex items-center gap-3">
        {v?.logoUrl ? (
          <img
            src={v.logoUrl}
            alt=""
            className="border-border size-14 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <div className="bg-brand-orange-soft text-brand-orange flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold">
            {name ? (
              name.charAt(0).toUpperCase()
            ) : (
              <Building2 className="size-6" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {name || t("clientProfile.preview.emptyName")}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {v?.tagline.trim() ||
              v?.company.trim() ||
              t("clientProfile.preview.emptyTagline")}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {v?.industry ? (
          <Row
            icon={Tag}
            label={t("clientProfile.industryLabel")}
            value={t(`workspace.industry.${v.industry}`)}
          />
        ) : null}
        {v?.companySize ? (
          <Row
            icon={Users}
            label={t("clientProfile.companySizeLabel")}
            value={t(`agency.companySize.${v.companySize}`)}
          />
        ) : null}
        {v?.budgetRange ? (
          <Row
            icon={Wallet}
            label={t("clientProfile.budgetRangeLabel")}
            value={t(`clientProfile.budgetRange.${v.budgetRange}`)}
          />
        ) : null}
        {v?.foundedYear ? (
          <Row
            icon={Calendar}
            label={t("clientProfile.foundedYearLabel")}
            value={v.foundedYear}
          />
        ) : null}
        {v?.address.trim() || v?.location.trim() ? (
          <Row
            icon={MapPin}
            label={t("clientProfile.locationLabel")}
            value={v.address.trim() || v.location.trim()}
          />
        ) : null}
        {v?.website.trim() ? (
          <Row
            icon={Globe}
            label={t("clientProfile.websiteLabel")}
            value={v.website.trim()}
          />
        ) : null}
        {v?.contactName.trim() ? (
          <Row
            icon={User}
            label={t("clientProfile.contactNameLabel")}
            value={v.contactName.trim()}
          />
        ) : null}
        {v?.contactEmail.trim() ? (
          <Row
            icon={Mail}
            label={t("clientProfile.contactEmailLabel")}
            value={v.contactEmail.trim()}
          />
        ) : null}
        {v?.phone.trim() ? (
          <Row
            icon={Phone}
            label={t("clientProfile.phoneLabel")}
            value={v.phone.trim()}
          />
        ) : null}
      </div>

      {v?.description.trim() ? (
        <div className="border-border mt-4 border-t pt-4">
          <p className="text-muted-foreground text-2xs mb-1 flex items-center gap-1.5">
            <Quote className="size-3.5" />
            {t("clientProfile.descriptionLabel")}
          </p>
          <p className="text-foreground text-xs whitespace-pre-line">
            {v.description.trim()}
          </p>
        </div>
      ) : null}

      {v?.linkedin.trim() || v?.facebook.trim() || v?.instagram.trim() ? (
        <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-4">
          {[v.linkedin, v.facebook, v.instagram]
            .map((url) => url.trim())
            .filter(Boolean)
            .map((url) => (
              <span
                key={url}
                className="bg-muted text-muted-foreground text-2xs max-w-full truncate rounded-full px-2 py-0.5"
              >
                {url}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BUDGET_RANGES } from "@/pages/client-profiles/constants";
import { COMPANY_SIZES } from "@/pages/agency/constants";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import { clientProfileService } from "@/services/clientProfileService";
import { useAuthStore } from "@/store/authStore";
import type { CompanySize } from "@/types/agency";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";
import { extractErrorMessage } from "@/utils/error";

interface Props {
  initial?: ClientProfile | null;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (data: UpdateClientProfileRequest) => void;
  onCancel?: () => void;
  /** Báo cho cha biết form đã bị sửa — dùng để chặn đóng dialog mất dữ liệu. */
  onDirtyChange?: (dirty: boolean) => void;
  /** Đẩy giá trị đang gõ lên cha — dùng để render preview trực tiếp. */
  onValuesChange?: (values: ClientProfileFormValues) => void;
}

export type ClientProfileFormValues = {
  displayName: string;
  company: string;
  logoUrl: string;
  website: string;
  industry: string;
  location: string;
  tagline: string;
  foundedYear: string;
  companySize: string;
  budgetRange: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxCode: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  description: string;
  note: string;
};

// Thêm https:// nếu user dán kiểu "brandhub.vn" — tránh lưu URL thiếu scheme.
function normalizeUrl(value: string) {
  const s = value.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function isValidUrl(value: string) {
  try {
    return new URL(value).hostname.includes(".");
  } catch {
    return false;
  }
}

// Năm hiện tại — dùng cho cả validate (handleSubmit) lẫn max của input.
const THIS_YEAR = new Date().getFullYear();

const URL_FIELDS = [
  "logoUrl",
  "website",
  "linkedin",
  "facebook",
  "instagram",
] as const;

// Gom 1 state thay vì 20 useState — đổi lại kiểm tra "form đã sửa" chỉ là so
// với snapshot ban đầu, và handleSubmit không phải liệt kê từng biến.
function buildDefaults(
  initial: ClientProfile | null | undefined,
  prefill: { name?: string; email?: string; phone?: string },
): ClientProfileFormValues {
  const social = initial?.socialLinks ?? {};
  // Tạo mới thì điền sẵn từ tài khoản đang đăng nhập cho đỡ phải gõ lại.
  const seed = (v?: string) => (initial ? "" : (v ?? ""));
  return {
    displayName: initial?.displayName ?? "",
    company: initial?.company ?? "",
    logoUrl: initial?.logoUrl ?? "",
    website: initial?.website ?? "",
    industry: initial?.industry ?? "",
    location: initial?.location ?? "",
    tagline: initial?.tagline ?? "",
    foundedYear: initial?.foundedYear ? String(initial.foundedYear) : "",
    companySize: initial?.companySize ?? "",
    budgetRange: initial?.budgetRange ?? "",
    contactName: initial?.contactName ?? seed(prefill.name),
    contactEmail: initial?.contactEmail ?? seed(prefill.email),
    phone: initial?.phone ?? seed(prefill.phone),
    address: initial?.address ?? "",
    taxCode: initial?.taxCode ?? "",
    linkedin: social.linkedin ?? "",
    facebook: social.facebook ?? "",
    instagram: initial?.instagramUrl ?? "",
    description: initial?.description ?? "",
    note: initial?.note ?? "",
  };
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-foreground mb-1 block text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-destructive text-3xs mt-1">{error}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-3xs mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h4 className="text-muted-foreground border-border text-2xs border-b pb-1.5 font-semibold tracking-wide uppercase">
        {title}
      </h4>
      {children}
    </section>
  );
}

// Form field set dùng chung cho: tạo mới (list page), sửa (detail page),
// và tạo-mới-lúc-accept-invite (picker) — tránh 3 chỗ khai báo lại field.
export function ClientProfileForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  onDirtyChange,
  onValuesChange,
}: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const defaults = useMemo(
    () =>
      buildDefaults(initial, {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      }),
    [initial, user],
  );
  const [values, setValues] = useState<ClientProfileFormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () =>
      (Object.keys(values) as (keyof ClientProfileFormValues)[]).some(
        (k) => values[k] !== defaults[k],
      ),
    [values, defaults],
  );
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  const set =
    (key: keyof ClientProfileFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleLogoFile = async (file: File) => {
    setUploading(true);
    try {
      if (initial?.id) {
        const resp = await clientProfileService.uploadLogo(initial.id, file);
        setValues((prev) => ({
          ...prev,
          logoUrl: resp.data.data.logoUrl ?? "",
        }));
      } else {
        // Chưa có hồ sơ — upload lấy URL rồi gửi kèm lúc tạo.
        const resp = await clientProfileService.uploadLogoDraft(file);
        setValues((prev) => ({ ...prev, logoUrl: resp.data.data ?? "" }));
      }
      toast.success(t("clientProfile.logoUploadSuccess"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("clientProfile.logoUploadFailed")),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const urls = {
      logoUrl: normalizeUrl(values.logoUrl),
      website: normalizeUrl(values.website),
      linkedin: normalizeUrl(values.linkedin),
      facebook: normalizeUrl(values.facebook),
      instagram: normalizeUrl(values.instagram),
    };
    const next: Record<string, string> = {};
    if (!values.displayName.trim()) {
      next.displayName = t("clientProfile.displayNameRequired");
    }
    for (const k of URL_FIELDS) {
      if (urls[k] && !isValidUrl(urls[k])) {
        next[k] = t("clientProfile.invalidUrl");
      }
    }
    const rawYear = values.foundedYear.trim();
    const year = rawYear ? Number(rawYear) : null;
    if (
      rawYear &&
      (!Number.isInteger(year) || year! < 1800 || year! > THIS_YEAR)
    ) {
      next.foundedYear = t("clientProfile.invalidYear");
    }
    if (Object.keys(next).length) {
      setErrors(next);
      setValues((prev) => ({ ...prev, ...urls }));
      return;
    }
    setErrors({});

    const socialLinks: Record<string, string> = {};
    if (urls.linkedin) socialLinks.linkedin = urls.linkedin;
    if (urls.facebook) socialLinks.facebook = urls.facebook;

    onSubmit({
      displayName: values.displayName.trim(),
      company: values.company.trim() || undefined,
      phone: values.phone.trim() || undefined,
      note: values.note.trim() || undefined,
      logoUrl: urls.logoUrl || undefined,
      website: urls.website || undefined,
      industry: values.industry || undefined,
      location: values.location.trim() || undefined,
      description: values.description.trim() || undefined,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
      contactName: values.contactName.trim() || undefined,
      contactEmail: values.contactEmail.trim() || undefined,
      companySize: (values.companySize || undefined) as CompanySize | undefined,
      instagramUrl: urls.instagram || undefined,
      taxCode: values.taxCode.trim() || undefined,
      address: values.address.trim() || undefined,
      tagline: values.tagline.trim() || undefined,
      foundedYear: year ?? undefined,
      budgetRange: values.budgetRange || undefined,
    });
  };

  const previewUrl = normalizeUrl(values.logoUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title={t("clientProfile.sectionGeneral")}>
        <Field
          label={t("clientProfile.displayNameLabel")}
          required
          error={errors.displayName}
        >
          <Input
            value={values.displayName}
            onChange={set("displayName")}
            placeholder={t("clientProfile.displayNamePlaceholder")}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("clientProfile.companyLabel")}>
            <Input value={values.company} onChange={set("company")} />
          </Field>
          <Field label={t("clientProfile.taglineLabel")}>
            <Input
              value={values.tagline}
              onChange={set("tagline")}
              placeholder={t("clientProfile.taglinePlaceholder")}
            />
          </Field>
        </div>
        <Field label={t("clientProfile.logoUrlLabel")} error={errors.logoUrl}>
          <div className="flex items-start gap-2">
            <Input
              value={values.logoUrl}
              placeholder="https://…"
              onChange={set("logoUrl")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" />
              {t("clientProfile.logoUpload")}
            </Button>
            {values.logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                title={t("clientProfile.logoRemove")}
                onClick={() => setValues((prev) => ({ ...prev, logoUrl: "" }))}
              >
                <X className="size-3.5" />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleLogoFile(file);
                e.target.value = "";
              }}
            />
          </div>
          {previewUrl && isValidUrl(previewUrl) && (
            <img
              src={previewUrl}
              alt=""
              className="border-border mt-2 size-16 rounded-md border object-cover"
            />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("clientProfile.websiteLabel")} error={errors.website}>
            <Input
              value={values.website}
              placeholder="https://…"
              onChange={set("website")}
            />
          </Field>
          <Field label={t("clientProfile.locationLabel")}>
            <Input
              value={values.location}
              onChange={set("location")}
              placeholder={t("clientProfile.locationPlaceholder")}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("clientProfile.industryLabel")}>
            <Select value={values.industry} onChange={set("industry")}>
              <option value="">{t("clientProfile.industryPlaceholder")}</option>
              {values.industry &&
                !(WORKSPACE_INDUSTRIES as readonly string[]).includes(
                  values.industry,
                ) && <option value={values.industry}>{values.industry}</option>}
              {WORKSPACE_INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {t(`workspace.industry.${i}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("clientProfile.companySizeLabel")}>
            <Select value={values.companySize} onChange={set("companySize")}>
              <option value="">
                {t("clientProfile.companySizePlaceholder")}
              </option>
              {values.companySize &&
                !(COMPANY_SIZES as readonly string[]).includes(
                  values.companySize,
                ) && (
                  <option value={values.companySize}>
                    {values.companySize}
                  </option>
                )}
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {t(`agency.companySize.${s}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label={t("clientProfile.foundedYearLabel")}
            error={errors.foundedYear}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={1800}
              max={THIS_YEAR}
              value={values.foundedYear}
              onChange={set("foundedYear")}
              placeholder="2018"
            />
          </Field>
          <Field label={t("clientProfile.budgetRangeLabel")}>
            <Select value={values.budgetRange} onChange={set("budgetRange")}>
              <option value="">
                {t("clientProfile.budgetRangePlaceholder")}
              </option>
              {values.budgetRange &&
                !(BUDGET_RANGES as readonly string[]).includes(
                  values.budgetRange,
                ) && (
                  <option value={values.budgetRange}>
                    {values.budgetRange}
                  </option>
                )}
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {t(`clientProfile.budgetRange.${b}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title={t("clientProfile.sectionContact")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("clientProfile.contactNameLabel")}>
            <Input value={values.contactName} onChange={set("contactName")} />
          </Field>
          <Field label={t("clientProfile.contactEmailLabel")}>
            <Input
              type="email"
              value={values.contactEmail}
              onChange={set("contactEmail")}
              placeholder="contact@brand.vn"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("clientProfile.phoneLabel")}>
            <Input
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={set("phone")}
              placeholder="0901234567"
            />
          </Field>
          <Field label={t("clientProfile.taxCodeLabel")}>
            <Input
              value={values.taxCode}
              onChange={set("taxCode")}
              inputMode="numeric"
              placeholder="0312345678"
            />
          </Field>
        </div>
        <Field label={t("clientProfile.addressLabel")}>
          <Input
            value={values.address}
            onChange={set("address")}
            placeholder={t("clientProfile.addressPlaceholder")}
          />
        </Field>
      </Section>

      <Section title={t("clientProfile.sectionSocial")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label={t("clientProfile.linkedinLabel")}
            error={errors.linkedin}
          >
            <Input
              value={values.linkedin}
              placeholder="https://linkedin.com/company/…"
              onChange={set("linkedin")}
            />
          </Field>
          <Field
            label={t("clientProfile.facebookLabel")}
            error={errors.facebook}
          >
            <Input
              value={values.facebook}
              placeholder="https://facebook.com/…"
              onChange={set("facebook")}
            />
          </Field>
        </div>
        <Field
          label={t("clientProfile.instagramLabel")}
          error={errors.instagram}
        >
          <Input
            value={values.instagram}
            placeholder="https://instagram.com/…"
            onChange={set("instagram")}
          />
        </Field>
      </Section>

      <Section title={t("clientProfile.sectionOther")}>
        <Field
          label={t("clientProfile.descriptionLabel")}
          hint={t("clientProfile.descriptionHint")}
        >
          <Textarea
            value={values.description}
            onChange={set("description")}
            rows={4}
          />
        </Field>
        <Field label={t("clientProfile.noteLabel")}>
          <Textarea value={values.note} onChange={set("note")} />
        </Field>
      </Section>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("clientProfile.cancelEdit")}
          </Button>
        )}
        <Button type="submit" variant="orange" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

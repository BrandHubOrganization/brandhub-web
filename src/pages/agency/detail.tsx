import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  FolderOpen,
  Globe,
  IdCard,
  Link2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Upload,
  User,
  Users,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProvinceSelect } from "@/components/ui/province-select";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { agencyService } from "@/services/agencyService";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage } from "@/utils/error";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import type {
  Agency,
  AgencyCategory,
  AgencyMember,
  CompanySize,
} from "@/types/agency";

const CURRENT_YEAR = new Date().getFullYear();
const URL_RE = /^https?:\/\/.+/i;
const PHONE_RE = /^[0-9+\-\s()]{6,20}$/;

const NAV_ITEMS = [
  { id: "profile", icon: IdCard, labelKey: "agency.detail.nav.profile" },
  { id: "members", icon: Users, labelKey: "agency.detail.nav.members" },
  { id: "stats", icon: BarChart3, labelKey: "agency.detail.nav.stats" },
];

export function AgencyDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const workspaces = useWorkspaceStore((s) => s.workspaceList);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) setCurrentAgencyId(id);
  }, [id, setCurrentAgencyId]);

  const [agency, setAgency] = useState<Agency | null>(null);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState<AgencyCategory | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [brandColor, setBrandColor] = useState("#f05a28");
  const [logoIcon, setLogoIcon] = useState(LOGO_ICON_OPTIONS[0].name);
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  type FieldErrors = Partial<
    Record<
      | "name"
      | "website"
      | "phone"
      | "facebookUrl"
      | "linkedinUrl"
      | "instagramUrl"
      | "foundedYear",
      string
    >
  >;
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateField = (field: keyof FieldErrors, value: string) => {
    let message: string | undefined;
    switch (field) {
      case "name":
        if (!value.trim()) message = t("agency.detail.errors.nameRequired");
        break;
      case "website":
      case "facebookUrl":
      case "linkedinUrl":
      case "instagramUrl":
        if (value.trim() && !URL_RE.test(value.trim()))
          message = t("agency.detail.errors.invalidUrl");
        break;
      case "phone":
        if (value.trim() && !PHONE_RE.test(value.trim()))
          message = t("agency.detail.errors.invalidPhone");
        break;
      case "foundedYear":
        if (value) {
          const y = Number(value);
          if (!Number.isFinite(y) || y < 1900 || y > CURRENT_YEAR)
            message = t("agency.detail.errors.invalidYear", {
              max: CURRENT_YEAR,
            });
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: message }));
    return !message;
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const applyAgency = (a: Agency) => {
    setAgency(a);
    setName(a.name);
    setDescription(a.description ?? "");
    setLogoUrl(a.logoUrl ?? "");
    setCategory(a.category ?? "");
    setCompanySize(a.companySize ?? "");
    setWebsite(a.website ?? "");
    setPhone(a.phone ?? "");
    setLocation(a.location ?? "");
    setBrandColor(a.brandColor ?? "#f05a28");
    setLogoIcon(a.logoIcon ?? LOGO_ICON_OPTIONS[0].name);
    setTagline(a.tagline ?? "");
    setFoundedYear(a.foundedYear ? String(a.foundedYear) : "");
    setFacebookUrl(a.facebookUrl ?? "");
    setLinkedinUrl(a.linkedinUrl ?? "");
    setInstagramUrl(a.instagramUrl ?? "");
  };

  useEffect(() => {
    if (!id) return;
    agencyService
      .getById(id)
      .then(({ data }) => applyAgency(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadOneFailed"))),
      )
      .finally(() => setLoading(false));

    agencyService
      .listMembers(id)
      .then(({ data }) => setMembers(data.data))
      .catch(() => setMembers([]));
  }, [id, t]);

  const isOwner =
    !!agency && !!currentUser && agency.ownerId === currentUser.id;

  const agencyWorkspaceCount = workspaces.filter(
    (ws) => ws.agencyId === id,
  ).length;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const yearNum = foundedYear ? Number(foundedYear) : undefined;
      const { data } = await agencyService.update(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        category: category || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum >= 1900 && yearNum <= CURRENT_YEAR
            ? yearNum
            : undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
      });
      applyAgency(data.data);
      setIsEditing(false);
      toast.success(t("agency.detail.saveSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.updateFailed")));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!agency) return;
    applyAgency(agency);
    setErrors({});
    setIsEditing(false);
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !id) return;
    setUploadingLogo(true);
    try {
      const { data } = await agencyService.uploadLogo(id, file);
      applyAgency(data.data);
      toast.success(t("agency.detail.uploadLogoSuccess"));
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("agency.detail.uploadLogoFailed")),
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) return null;
  if (!agency) return null;

  const FallbackIcon = getLogoIcon(agency.logoIcon);

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-6 p-4 pb-24 md:flex-row md:p-8">
      <aside className="shrink-0 md:sticky md:top-4 md:h-fit md:w-56">
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map(({ id: sectionId, icon: Icon, labelKey }) => (
            <button
              key={sectionId}
              type="button"
              onClick={() => scrollToSection(sectionId)}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <Icon className="size-4 shrink-0" />
              {t(labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-10">
        <section id="profile" className="scroll-mt-6 space-y-6">
          <div className="bg-card flex flex-col gap-4 rounded-xl border p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                style={{
                  background: agency.logoUrl
                    ? undefined
                    : `${agency.brandColor ?? "#f05a28"}1a`,
                  color: agency.brandColor ?? undefined,
                }}
              >
                {agency.logoUrl ? (
                  <img
                    src={agency.logoUrl}
                    alt={agency.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <FallbackIcon
                    className="size-6"
                    style={{ color: agency.brandColor ?? undefined }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">
                  {agency.name}
                </p>
                {agency.tagline && (
                  <p className="text-muted-foreground truncate text-xs">
                    {agency.tagline}
                  </p>
                )}
                {!isOwner && (
                  <p className="text-muted-foreground text-xs">
                    {t("agency.detail.ownerOnlyHint")}
                  </p>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label={t("agency.create.nameLabel")}
                  placeholder={t("agency.create.namePlaceholder")}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateField("name", e.target.value);
                  }}
                  error={errors.name}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold tracking-wide">
                    {t("agency.detail.logoLabel")}
                  </Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                      style={{
                        background: logoUrl ? undefined : `${brandColor}1a`,
                      }}
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        (() => {
                          const Icon = getLogoIcon(logoIcon);
                          return (
                            <Icon
                              className="size-6"
                              style={{ color: brandColor }}
                            />
                          );
                        })()
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleLogoFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={uploadingLogo}
                      className="cursor-pointer gap-1.5"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="size-3.5" />
                      {t("agency.detail.uploadLogoButton")}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-2xs">
                    {t("agency.detail.logoPostSaveHint")}
                  </p>
                </div>

                <RichTextInput
                  label={t("agency.create.descriptionLabel")}
                  placeholder={t("agency.create.descriptionPlaceholder")}
                  value={description}
                  onChange={setDescription}
                />
                <Input
                  label={t("agency.create.taglineLabel")}
                  placeholder={t("agency.create.taglinePlaceholder")}
                  maxLength={140}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wide">
                      {t("agency.create.categoryLabel")}
                    </Label>
                    <Select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as AgencyCategory | "")
                      }
                    >
                      <option value="">
                        {t("agency.create.categoryPlaceholder")}
                      </option>
                      {AGENCY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(`agency.category.${c}`)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wide">
                      {t("agency.create.companySizeLabel")}
                    </Label>
                    <Select
                      value={companySize}
                      onChange={(e) =>
                        setCompanySize(e.target.value as CompanySize | "")
                      }
                    >
                      <option value="">
                        {t("agency.create.companySizePlaceholder")}
                      </option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {t(`agency.companySize.${s}`)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Input
                  label={t("agency.create.websiteLabel")}
                  placeholder={t("agency.create.websitePlaceholder")}
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    validateField("website", e.target.value);
                  }}
                  error={errors.website}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t("agency.create.phoneLabel")}
                    placeholder={t("agency.create.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      validateField("phone", e.target.value);
                    }}
                    error={errors.phone}
                  />
                  <ProvinceSelect
                    label={t("agency.create.locationLabel")}
                    value={location}
                    onChange={setLocation}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wide">
                      {t("agency.create.brandColorLabel")}
                    </Label>
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="border-input h-9 w-full cursor-pointer rounded-md border"
                    />
                  </div>
                  <Input
                    label={t("agency.create.foundedYearLabel")}
                    type="number"
                    min={1900}
                    max={CURRENT_YEAR}
                    value={foundedYear}
                    onChange={(e) => {
                      setFoundedYear(e.target.value);
                      validateField("foundedYear", e.target.value);
                    }}
                    error={errors.foundedYear}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold tracking-wide">
                    {t("agency.create.logoIconLabel")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setLogoIcon(iconName)}
                        className={cn(
                          "flex size-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                          logoIcon === iconName
                            ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="size-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    label={t("agency.create.facebookUrlLabel")}
                    placeholder="https://facebook.com/..."
                    value={facebookUrl}
                    onChange={(e) => {
                      setFacebookUrl(e.target.value);
                      validateField("facebookUrl", e.target.value);
                    }}
                    error={errors.facebookUrl}
                  />
                  <Input
                    label={t("agency.create.linkedinUrlLabel")}
                    placeholder="https://linkedin.com/..."
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      validateField("linkedinUrl", e.target.value);
                    }}
                    error={errors.linkedinUrl}
                  />
                  <Input
                    label={t("agency.create.instagramUrlLabel")}
                    placeholder="https://instagram.com/..."
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      validateField("instagramUrl", e.target.value);
                    }}
                    error={errors.instagramUrl}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="cursor-pointer"
                  >
                    {t("agency.detail.cancelButton")}
                  </Button>
                  <Button
                    loading={saving}
                    disabled={hasErrors || !name.trim()}
                    onClick={handleSave}
                    className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
                  >
                    {t("agency.detail.saveButton")}
                  </Button>
                </div>
              </div>
            ) : (
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
                      {agency.category
                        ? t(`agency.category.${agency.category}`)
                        : "—"}
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
                {(agency.facebookUrl ||
                  agency.linkedinUrl ||
                  agency.instagramUrl) && (
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
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit cursor-pointer gap-1.5"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="size-3.5" />
                    {t("agency.detail.editButton")}
                  </Button>
                )}
              </>
            )}
          </div>

          {isOwner && !isEditing && (
            <div className="bg-brand-orange-soft flex flex-col gap-3 rounded-xl border border-dashed p-5">
              <p className="text-sm font-semibold">
                {t("agency.detail.createWorkspaceCta")}
              </p>
              <Button
                className="bg-brand-orange hover:bg-brand-orange/90 w-fit cursor-pointer gap-1.5 text-white"
                onClick={() => navigate(`/workspaces/create?agencyId=${id}`)}
              >
                <Plus className="size-4" />
                {t("workspace.create.title")}
              </Button>
            </div>
          )}

          {!isEditing && (
            <Button
              variant="outline"
              className="w-fit cursor-pointer gap-1.5"
              onClick={() => navigate(`/client-profile?agencyId=${id}`)}
            >
              <User className="size-3.5" />
              {t("agency.detail.viewClientProfile")}
            </Button>
          )}

          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/agency")}
          >
            {t("agency.detail.back")}
          </Button>
        </section>

        <div className="border-border border-t" />

        <section id="members" className="scroll-mt-6 space-y-4">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              {t("agency.detail.nav.members")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("agency.detail.membersPreviewDescription")}
            </p>
          </div>
          <div className="rounded-xl border">
            {members.length === 0 ? (
              <p className="text-muted-foreground p-5 text-sm">
                {t("agency.members.empty")}
              </p>
            ) : (
              <div className="divide-y">
                {members.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt=""
                        className="size-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {(m.fullName || m.email || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.fullName || m.email || "—"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-2xs rounded-full px-2 py-0.5 font-semibold",
                        m.role === "OWNER"
                          ? "bg-brand-orange-soft text-brand-orange"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => navigate(`/agency/${id}/members`)}
          >
            <Users className="size-3.5" />
            {t("agency.detail.viewAllMembers")}
          </Button>
        </section>

        <div className="border-border border-t" />

        <section id="stats" className="scroll-mt-6 space-y-4">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              {t("agency.detail.nav.stats")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("agency.detail.statsDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-card rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Users className="size-3.5" />
                {t("agency.detail.statsMembers")}
              </div>
              <p className="mt-1 text-2xl font-bold">{members.length}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <FolderOpen className="size-3.5" />
                {t("agency.detail.statsWorkspaces")}
              </div>
              <p className="mt-1 text-2xl font-bold">{agencyWorkspaceCount}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <BarChart3 className="size-3.5" />
                {t("agency.detail.statsActivity")}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("agency.detail.statsActivityPlaceholder")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AgencyDetailPage;

import { createElement, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import { FrequencyToggle } from "@/pages/workspace/components/FrequencyToggle";
import { IndustrySpecificFields } from "@/pages/workspace/components/IndustrySpecificFields";
import { PlatformToggle } from "@/pages/workspace/components/PlatformToggle";
import { TimezoneSelect } from "@/pages/workspace/components/TimezoneSelect";
import { WorkspaceCreateLivePreview } from "@/pages/workspace/components/WorkspaceCreateLivePreview";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import {
  isValidFoundedYear,
  isValidPhone,
  isValidUrl,
  normalizeUrl,
} from "@/utils/validation";
import type {
  CompanySize,
  ReportFrequency,
  WorkspaceIndustry,
  WorkspaceTemplate,
} from "@/types/workspace";

type ScopeFilter = "all" | "global" | "agency";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

const BRAND_COLOR_PRESETS = [
  "#f05a28",
  "#ea580c",
  "#e11d48",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#18181b",
] as const;

const INDUSTRY_DEFAULT_ICON: Record<WorkspaceIndustry, string> = {
  FNB: "coffee",
  FASHION: "bag",
  BEAUTY: "sparkles",
  TECHNOLOGY: "layers",
  REAL_ESTATE: "building",
  EDUCATION: "lightbulb",
  HEALTHCARE: "shield",
  SERVICES: "briefcase",
  RETAIL: "bag",
  OTHER: "globe",
};

/** Subtle, editorial accent colors per industry when a template has no custom brandColor */
const INDUSTRY_TONE: Record<WorkspaceIndustry, string> = {
  FNB: "#d97706",
  FASHION: "#e11d48",
  BEAUTY: "#9333ea",
  TECHNOLOGY: "#2563eb",
  REAL_ESTATE: "#059669",
  EDUCATION: "#0284c7",
  HEALTHCARE: "#0d9488",
  SERVICES: "#4f46e5",
  RETAIL: "#ea580c",
  OTHER: "#52525b",
};

const INDUSTRY_FIELD_I18N_KEY: Record<string, string> = {
  cuisineType: "workspace.industryFields.fnb.cuisineType",
  seatingCapacity: "workspace.industryFields.fnb.seatingCapacity",
  deliveryPlatforms: "workspace.industryFields.fnb.deliveryPlatforms",
  productCategories: "workspace.industryFields.fashion.productCategories",
  seasonalCollections: "workspace.industryFields.fashion.seasonalCollections",
  serviceTypes: "workspace.industryFields.beauty.serviceTypes",
  certifications: "workspace.industryFields.beauty.certifications",
  techStack: "workspace.industryFields.technology.techStack",
  productType: "workspace.industryFields.technology.productType",
  propertyTypes: "workspace.industryFields.realEstate.propertyTypes",
  serviceAreas: "workspace.industryFields.realEstate.serviceAreas",
  specialization: "workspace.industryFields.other.specialization",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const CURRENT_YEAR = new Date().getFullYear();

export function WorkspaceTemplateLibraryPage() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<WorkspaceIndustry | "">(
    "",
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // View mode: directory vs full-page create builder
  const [createMode, setCreateMode] = useState(false);

  // Detail sheet & Delete confirmation
  const [previewTemplate, setPreviewTemplate] =
    useState<WorkspaceTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceTemplate | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Create Global Template form state (all workspace fields)
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [foundedYear, setFoundedYear] = useState("");
  const [brandColor, setBrandColor] = useState<string>("#f05a28");
  const [logoIcon, setLogoIcon] = useState<string>(LOGO_ICON_OPTIONS[0].name);
  const [timezone, setTimezone] = useState<string>("Asia/Ho_Chi_Minh");
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>([
    "facebook",
    "instagram",
  ]);
  const [reportFrequency, setReportFrequency] =
    useState<ReportFrequency | null>("WEEKLY");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [industryFields, setIndustryFields] = useState<Record<string, unknown>>(
    {},
  );

  const loadTemplates = () => {
    setLoading(true);
    workspaceTemplateService
      .listAll()
      .then(({ data }) => setTemplates(data.data))
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, t("workspace.templates.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setName("");
    setTagline("");
    setDescription("");
    setIndustry("");
    setCompanySize("");
    setFoundedYear("");
    setBrandColor("#f05a28");
    setLogoIcon(LOGO_ICON_OPTIONS[0].name);
    setTimezone("Asia/Ho_Chi_Minh");
    setDefaultPlatforms(["facebook", "instagram"]);
    setReportFrequency("WEEKLY");
    setLocation("");
    setWebsite("");
    setPhone("");
    setFacebookUrl("");
    setInstagramUrl("");
    setLinkedinUrl("");
    setIndustryFields({});
    setFormErrors({});
  };

  const togglePlatform = (platform: string) => {
    setDefaultPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform],
    );
  };

  const toggleReportFrequency = (freq: ReportFrequency) => {
    setReportFrequency((prev) => (prev === freq ? null : freq));
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = t(
        "common.validation.required",
        "Trường này là bắt buộc",
      );
    }
    if (foundedYear.trim() && !isValidFoundedYear(foundedYear)) {
      nextErrors.foundedYear = t(
        "common.validation.invalidYear",
        `Năm thành lập phải từ 1900 đến ${CURRENT_YEAR}`,
      );
    }
    if (website.trim() && !isValidUrl(website)) {
      nextErrors.website = t(
        "common.validation.invalidUrl",
        "Địa chỉ website không hợp lệ",
      );
    }
    if (phone.trim() && !isValidPhone(phone)) {
      nextErrors.phone = t(
        "common.validation.invalidPhone",
        "Số điện thoại không hợp lệ",
      );
    }
    if (facebookUrl.trim() && !isValidUrl(facebookUrl)) {
      nextErrors.facebookUrl = t(
        "common.validation.invalidUrl",
        "Đường dẫn không hợp lệ",
      );
    }
    if (instagramUrl.trim() && !isValidUrl(instagramUrl)) {
      nextErrors.instagramUrl = t(
        "common.validation.invalidUrl",
        "Đường dẫn không hợp lệ",
      );
    }
    if (linkedinUrl.trim() && !isValidUrl(linkedinUrl)) {
      nextErrors.linkedinUrl = t(
        "common.validation.invalidUrl",
        "Đường dẫn không hợp lệ",
      );
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const cleanIndustryFields = Object.fromEntries(
      Object.entries(industryFields).filter(([, v]) => v !== "" && v !== null),
    );
    const parsedYear = foundedYear.trim()
      ? Number.parseInt(foundedYear.trim(), 10)
      : null;

    try {
      await workspaceTemplateService.saveGlobal({
        name: name.trim(),
        config: {
          industry: industry || null,
          companySize: companySize || null,
          website: website.trim() ? normalizeUrl(website.trim()) : null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          description: description.trim() || null,
          brandColor: brandColor || null,
          logoIcon: logoIcon || null,
          tagline: tagline.trim() || null,
          foundedYear:
            parsedYear && !Number.isNaN(parsedYear) ? parsedYear : null,
          facebookUrl: facebookUrl.trim()
            ? normalizeUrl(facebookUrl.trim())
            : null,
          linkedinUrl: linkedinUrl.trim()
            ? normalizeUrl(linkedinUrl.trim())
            : null,
          instagramUrl: instagramUrl.trim()
            ? normalizeUrl(instagramUrl.trim())
            : null,
          timezone: timezone || null,
          defaultPlatforms:
            defaultPlatforms.length > 0 ? defaultPlatforms : null,
          reportFrequency: reportFrequency || null,
          industryFields:
            Object.keys(cleanIndustryFields).length > 0
              ? cleanIndustryFields
              : null,
        },
      });
      toast.success(t("workspace.templates.adminCreateSuccess"));
      setCreateMode(false);
      resetForm();
      loadTemplates();
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.templates.adminCreateError")),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await workspaceTemplateService.remove(deleteTarget.id);
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== deleteTarget.id));
      if (previewTemplate?.id === deleteTarget.id) {
        setPreviewTemplate(null);
      }
      setDeleteTarget(null);
      toast.success(t("workspace.templates.deleteSuccess"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.templates.deleteError")),
      );
    } finally {
      setDeleting(false);
    }
  };

  const counts = useMemo(() => {
    let globalCount = 0;
    let agencyCount = 0;
    const byIndustry: Record<string, number> = {};
    for (const tpl of templates) {
      if (tpl.agencyId) agencyCount++;
      else globalCount++;
      if (tpl.config.industry) {
        byIndustry[tpl.config.industry] =
          (byIndustry[tpl.config.industry] || 0) + 1;
      }
    }
    return {
      total: templates.length,
      global: globalCount,
      agency: agencyCount,
      byIndustry,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = templates.filter((tpl) => {
      if (scopeFilter === "global" && tpl.agencyId) return false;
      if (scopeFilter === "agency" && !tpl.agencyId) return false;
      if (categoryFilter && tpl.config.industry !== categoryFilter) {
        return false;
      }
      if (q) {
        const industryLabel = tpl.config.industry
          ? t(`workspace.industry.${tpl.config.industry}`).toLowerCase()
          : "";
        const hay = [
          tpl.name,
          tpl.config.tagline,
          tpl.config.description,
          tpl.config.location,
          tpl.config.website,
          industryLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sortBy === "name_desc") return b.name.localeCompare(a.name, "vi");
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
    });
  }, [templates, scopeFilter, categoryFilter, searchQuery, sortBy, t]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    scopeFilter !== "all" ||
    categoryFilter !== "" ||
    sortBy !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setScopeFilter("all");
    setCategoryFilter("");
    setSortBy("newest");
  };

  // ── CREATE GLOBAL TEMPLATE BUILDER VIEW (2-Column Split like /workspaces/create) ──
  if (createMode) {
    return (
      <PageWrapper
        title={t("workspace.templates.adminCreateButton")}
        description="Thiết lập bộ thông số chuẩn để các agency có thể khởi tạo nhanh không gian làm việc theo ngành."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              setCreateMode(false);
              resetForm();
            }}
          >
            <ArrowLeft className="size-3.5" />
            Quay lại thư viện
          </Button>
        }
      >
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Complete Workspace Configuration Form */}
          <form
            onSubmit={handleCreate}
            className="border-border bg-card space-y-6 rounded-xl border p-6 lg:col-span-7"
          >
            {/* Section 1: Thông tin cơ bản & Ngành */}
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Thông tin cơ bản
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Tên mẫu, định vị thương hiệu và phân loại ngành hàng.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("workspace.settings.template.nameLabel")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("workspace.settings.template.namePlaceholder")}
                  required
                  error={formErrors.name}
                />
                <Input
                  label={t("workspace.create.taglineLabel")}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={t("workspace.create.taglinePlaceholder")}
                  maxLength={140}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">
                    {t("workspace.create.industryLabel")}
                  </Label>
                  <Select
                    value={industry}
                    onChange={(e) => {
                      const nextInd = e.target.value as WorkspaceIndustry | "";
                      setIndustry(nextInd);
                      if (nextInd) {
                        setLogoIcon(INDUSTRY_DEFAULT_ICON[nextInd]);
                        setBrandColor(INDUSTRY_TONE[nextInd]);
                      }
                    }}
                  >
                    <option value="">
                      {t("workspace.create.industryPlaceholder")}
                    </option>
                    {WORKSPACE_INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {t(`workspace.industry.${i}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">
                    {t("workspace.create.companySizeLabel")}
                  </Label>
                  <Select
                    value={companySize}
                    onChange={(e) =>
                      setCompanySize(e.target.value as CompanySize | "")
                    }
                  >
                    <option value="">
                      {t("workspace.create.companySizePlaceholder")}
                    </option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {t(`agency.companySize.${s}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  label={t("workspace.create.foundedYearLabel")}
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  max={CURRENT_YEAR}
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="2024"
                  error={formErrors.foundedYear}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">
                  {t("workspace.create.descriptionLabel")}
                </Label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("workspace.create.description")}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-xs outline-none focus-visible:ring-1"
                />
              </div>

              <IndustrySpecificFields
                industry={industry}
                value={industryFields}
                onChange={setIndustryFields}
              />
            </div>

            {/* Section 2: Nhận diện & Quy chuẩn vận hành */}
            <div className="border-border/70 space-y-4 border-t pt-6">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Nhận diện & Vận hành
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Màu sắc, biểu tượng đại diện, múi giờ và lịch báo cáo mặc định.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium">
                    {t("workspace.create.brandColorLabel")}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {BRAND_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBrandColor(color)}
                        className={cn(
                          "size-6 cursor-pointer rounded-full border-2 transition-transform",
                          brandColor.toLowerCase() === color.toLowerCase()
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="border-input h-7 w-10 cursor-pointer rounded border p-0.5"
                    />
                  </div>
                </div>

                <TimezoneSelect value={timezone} onChange={setTimezone} />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium">
                  {t("workspace.create.logoIconLabel")}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setLogoIcon(iconName)}
                      className={cn(
                        "flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors",
                        logoIcon === iconName
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PlatformToggle
                  value={defaultPlatforms}
                  onToggle={togglePlatform}
                />
                <FrequencyToggle
                  value={reportFrequency}
                  onToggle={toggleReportFrequency}
                />
              </div>
            </div>

            {/* Section 3: Liên hệ & Kênh mạng xã hội */}
            <div className="border-border/70 space-y-4 border-t pt-6">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Thông tin liên hệ & Kênh xã hội
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Khu vực hoạt động, website và liên kết mạng xã hội mẫu.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label={t("workspace.create.locationLabel")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                />
                <Input
                  label={t("workspace.create.phoneLabel")}
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  error={formErrors.phone}
                />
                <Input
                  label={t("workspace.create.websiteLabel")}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://brandhub.vn"
                  error={formErrors.website}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label={t("workspace.create.facebookUrlLabel")}
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="facebook.com/brand"
                  error={formErrors.facebookUrl}
                />
                <Input
                  label={t("workspace.create.instagramUrlLabel")}
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="instagram.com/brand"
                  error={formErrors.instagramUrl}
                />
                <Input
                  label={t("workspace.create.linkedinUrlLabel")}
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/company/brand"
                  error={formErrors.linkedinUrl}
                />
              </div>
            </div>

            <div className="border-border/70 flex items-center justify-end gap-2.5 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreateMode(false);
                  resetForm();
                }}
              >
                {t("workspace.settings.cancelButton")}
              </Button>
              <Button
                type="submit"
                variant="orange"
                size="sm"
                loading={saving}
                disabled={!name.trim() || saving}
              >
                {t("workspace.settings.template.saveButton")}
              </Button>
            </div>
          </form>

          {/* Right Column: Live Preview (Matches /workspaces/create) */}
          <WorkspaceCreateLivePreview
            name={name}
            tagline={tagline}
            description={description}
            brandColor={brandColor}
            logoIcon={logoIcon}
            foundedYear={foundedYear}
            industry={industry}
            companySize={companySize}
            website={website}
            phone={phone}
            location={location}
            facebookUrl={facebookUrl}
            linkedinUrl={linkedinUrl}
            instagramUrl={instagramUrl}
            industryFields={industryFields}
          />
        </div>
      </PageWrapper>
    );
  }

  // ── DIRECTORY VIEW (Two-Column Sidebar + Editorial Grid) ──
  return (
    <PageWrapper
      title={t("workspace.templates.adminTitle")}
      description={t("workspace.templates.adminDescription")}
      actions={
        <Button
          variant="orange"
          size="sm"
          className="h-9 gap-1.5 px-3.5 text-xs font-medium"
          onClick={() => setCreateMode(true)}
        >
          <Plus className="size-3.5" />
          {t("workspace.templates.adminCreateButton")}
        </Button>
      }
    >
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        {/* Left Sidebar Directory: Scope + Industry Categories */}
        <aside className="w-full shrink-0 space-y-6 lg:w-52">
          {/* Scope Filter Group */}
          <div>
            <p className="text-muted-foreground mb-2 px-2.5 text-[11px] font-medium tracking-wider uppercase">
              Phạm vi
            </p>
            <nav className="space-y-0.5">
              {(
                [
                  {
                    key: "all",
                    label: t("workspace.templates.scopeAll", "Tất cả mẫu"),
                    count: counts.total,
                  },
                  {
                    key: "global",
                    label: t("workspace.templates.scopeGlobal", "Mẫu chung"),
                    count: counts.global,
                  },
                  {
                    key: "agency",
                    label: t("workspace.templates.scopeAgency", "Mẫu Agency"),
                    count: counts.agency,
                  },
                ] as const
              ).map((item) => {
                const active = scopeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setScopeFilter(item.key)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="text-muted-foreground text-[11px] tabular-nums">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Industry Category Directory */}
          <div>
            <p className="text-muted-foreground mb-2 px-2.5 text-[11px] font-medium tracking-wider uppercase">
              {t("workspace.create.industryLabel")}
            </p>
            <nav className="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
              <button
                type="button"
                onClick={() => setCategoryFilter("")}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors lg:w-full",
                  categoryFilter === ""
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span>
                  {t("workspace.templates.allCategories", "Tất cả ngành")}
                </span>
                <span className="text-muted-foreground ml-2 text-[11px] tabular-nums">
                  {counts.total}
                </span>
              </button>

              {WORKSPACE_INDUSTRIES.map((ind) => {
                const count = counts.byIndustry[ind] || 0;
                const active = categoryFilter === ind;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setCategoryFilter(active ? "" : ind)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors lg:w-full",
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : count > 0
                          ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          : "text-muted-foreground/50 hover:text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {t(`workspace.industry.${ind}`)}
                    </span>
                    {count > 0 && (
                      <span className="text-muted-foreground ml-2 text-[11px] tabular-nums">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Area: Search/Sort Bar + Editorial Cards */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Clean Unboxed Search & Sort Bar */}
          <div className="border-border/70 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "workspace.templates.searchPlaceholder",
                  "Tìm theo tên mẫu, slogan, khu vực...",
                )}
                className="h-8.5 pr-8 pl-8.5 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-muted-foreground text-xs tabular-nums">
                {filteredTemplates.length} mẫu
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-foreground/80 hover:text-foreground cursor-pointer text-xs underline underline-offset-4"
                >
                  {t("workspace.templates.clearFilters", "Đặt lại")}
                </button>
              )}

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-8.5 py-0 pr-7 text-xs"
                wrapperClassName="w-[136px]"
              >
                <option value="newest">
                  {t("workspace.templates.sortNewest", "Mới nhất")}
                </option>
                <option value="oldest">
                  {t("workspace.templates.sortOldest", "Cũ nhất")}
                </option>
                <option value="name_asc">
                  {t("workspace.templates.sortNameAsc", "Tên A → Z")}
                </option>
                <option value="name_desc">
                  {t("workspace.templates.sortNameDesc", "Tên Z → A")}
                </option>
              </Select>
            </div>
          </div>

          {/* Template Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-border bg-card h-36 animate-pulse rounded-lg border p-4"
                />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="border-border/70 flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center">
              <p className="text-muted-foreground text-xs">
                {templates.length === 0
                  ? t("workspace.templates.empty")
                  : t(
                      "workspace.templates.noResults",
                      "Không tìm thấy mẫu phù hợp.",
                    )}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-foreground mt-2 cursor-pointer text-xs font-medium underline underline-offset-4"
                >
                  {t("workspace.templates.clearFilters", "Xóa lọc")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTemplates.map((tpl) => {
                const cfg = tpl.config;
                const isDefaultColor =
                  !cfg.brandColor ||
                  cfg.brandColor.toLowerCase() === "#f05a28";
                const tone =
                  !isDefaultColor && cfg.brandColor
                    ? cfg.brandColor
                    : cfg.industry
                      ? INDUSTRY_TONE[cfg.industry]
                      : "#52525b";
                const isDefaultIcon =
                  !cfg.logoIcon || cfg.logoIcon === "briefcase";
                const iconKey =
                  !isDefaultIcon && cfg.logoIcon
                    ? cfg.logoIcon
                    : cfg.industry
                      ? INDUSTRY_DEFAULT_ICON[cfg.industry]
                      : cfg.logoIcon || "building";
                const isGlobal = !tpl.agencyId;

                const metaParts: string[] = [];
                if (cfg.industry) {
                  metaParts.push(t(`workspace.industry.${cfg.industry}`));
                }
                if (cfg.companySize) {
                  metaParts.push(t(`agency.companySize.${cfg.companySize}`));
                }

                const channelSummary =
                  cfg.defaultPlatforms && cfg.defaultPlatforms.length > 0
                    ? cfg.defaultPlatforms
                        .map((p) => PLATFORM_LABELS[p] || p)
                        .join(", ")
                    : null;

                const summaryText =
                  cfg.description ||
                  cfg.tagline ||
                  (cfg.location ? `Khu vực: ${cfg.location}` : null);

                return (
                  <article
                    key={tpl.id}
                    onClick={() => setPreviewTemplate(tpl)}
                    className="group border-border bg-card hover:border-foreground/25 flex cursor-pointer flex-col justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div>
                      {/* Header: Soft Tinted Icon + Title + Quiet Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${tone}15`,
                              color: tone,
                            }}
                          >
                            {createElement(getLogoIcon(iconKey), {
                              className: "size-4",
                            })}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-foreground truncate text-sm font-semibold leading-snug">
                              {tpl.name}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                              {metaParts.length > 0
                                ? metaParts.join(" · ")
                                : t("workspace.templates.adminGlobalBadge")}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex shrink-0 items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isGlobal ? (
                            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                              Agency
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(tpl)}
                              title={t("workspace.templates.deleteButton")}
                              className="text-muted-foreground hover:text-destructive flex size-6 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Concise Editorial Summary */}
                      {summaryText && (
                        <p className="text-muted-foreground mt-3 line-clamp-2 text-xs leading-relaxed">
                          {summaryText}
                        </p>
                      )}
                    </div>

                    {/* Clean Typographic Footer */}
                    <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-2.5 text-[11px]">
                      <span className="truncate">
                        {[
                          channelSummary,
                          cfg.reportFrequency
                            ? t(
                                `workspace.reportFrequency.${cfg.reportFrequency}`,
                              )
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          new Date(tpl.createdAt).toLocaleDateString("vi-VN")}
                      </span>

                      <span className="text-muted-foreground group-hover:text-foreground ml-2 inline-flex shrink-0 items-center gap-0.5 font-medium transition-colors">
                        Chi tiết
                        <ArrowUpRight className="size-3" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Specification Sheet Dialog (Clean Property Table Style) */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 text-left">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${
                        previewTemplate.config.brandColor ||
                        (previewTemplate.config.industry
                          ? INDUSTRY_TONE[previewTemplate.config.industry]
                          : "#52525b")
                      }15`,
                      color:
                        previewTemplate.config.brandColor ||
                        (previewTemplate.config.industry
                          ? INDUSTRY_TONE[previewTemplate.config.industry]
                          : "#52525b"),
                    }}
                  >
                    {createElement(
                      getLogoIcon(
                        previewTemplate.config.logoIcon ||
                          (previewTemplate.config.industry
                            ? INDUSTRY_DEFAULT_ICON[
                                previewTemplate.config.industry
                              ]
                            : "building"),
                      ),
                      { className: "size-5" },
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base font-semibold">
                      {previewTemplate.name}
                    </DialogTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {previewTemplate.config.tagline ||
                        (previewTemplate.agencyId
                          ? `Mẫu riêng của Agency (#${previewTemplate.agencyId.slice(0, 8)})`
                          : "Mẫu cấu hình chuẩn toàn hệ thống")}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {previewTemplate.config.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {previewTemplate.config.description}
                  </p>
                )}

                {/* Property List */}
                <dl className="divide-border/60 border-border/70 divide-y border-y">
                  {previewTemplate.config.industry && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.create.industryLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {t(
                          `workspace.industry.${previewTemplate.config.industry}`,
                        )}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.companySize && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.create.companySizeLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {t(
                          `agency.companySize.${previewTemplate.config.companySize}`,
                        )}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.foundedYear && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.create.foundedYearLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {previewTemplate.config.foundedYear}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.timezone && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.settings.timezoneLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {previewTemplate.config.timezone}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.reportFrequency && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.settings.reportFrequencyLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {t(
                          `workspace.reportFrequency.${previewTemplate.config.reportFrequency}`,
                        )}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.defaultPlatforms &&
                    previewTemplate.config.defaultPlatforms.length > 0 && (
                      <div className="flex justify-between py-2">
                        <dt className="text-muted-foreground">
                          {t("workspace.settings.defaultPlatformsLabel")}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {previewTemplate.config.defaultPlatforms
                            .map((p) => PLATFORM_LABELS[p] || p)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                  {previewTemplate.config.location && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.create.locationLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {previewTemplate.config.location}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.phone && (
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">
                        {t("workspace.create.phoneLabel")}
                      </dt>
                      <dd className="text-foreground font-medium">
                        {previewTemplate.config.phone}
                      </dd>
                    </div>
                  )}
                  {previewTemplate.config.website && (
                    <div className="flex justify-between gap-4 py-2">
                      <dt className="text-muted-foreground shrink-0">
                        {t("workspace.create.websiteLabel")}
                      </dt>
                      <dd className="text-foreground truncate font-medium">
                        {previewTemplate.config.website}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Industry-specific fields */}
                {previewTemplate.config.industryFields &&
                  Object.entries(previewTemplate.config.industryFields).filter(
                    ([, v]) => v !== null && v !== "",
                  ).length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-[11px] font-medium">
                        {t("workspace.createPreview.industrySpecific")}
                      </p>
                      <dl className="divide-border/60 border-border/70 divide-y rounded-md border px-3">
                        {Object.entries(previewTemplate.config.industryFields)
                          .filter(([, v]) => v !== null && v !== "")
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="flex justify-between gap-4 py-2"
                            >
                              <dt className="text-muted-foreground">
                                {INDUSTRY_FIELD_I18N_KEY[k]
                                  ? t(INDUSTRY_FIELD_I18N_KEY[k], k)
                                  : k}
                              </dt>
                              <dd className="text-foreground text-right font-medium">
                                {String(v)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  )}
              </div>

              <DialogFooter className="flex items-center justify-between">
                {!previewTemplate.agencyId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive mr-auto text-xs"
                    onClick={() => setDeleteTarget(previewTemplate)}
                  >
                    <Trash2 className="mr-1.5 size-3.5" />
                    {t("workspace.templates.deleteButton")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("workspace.templates.deleteConfirmTitle")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {t("workspace.templates.deleteConfirmDescription", {
              name: deleteTarget?.name || "",
            })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              {t("workspace.settings.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              {t("workspace.templates.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export default WorkspaceTemplateLibraryPage;

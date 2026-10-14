import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Pencil,
  Plus,
  TriangleAlert,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import { extractErrorMessage } from "@/utils/error";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import { AgencyOrgChart } from "@/pages/agency/components/AgencyOrgChart";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { WorkspaceCardGrid } from "@/pages/workspace/components/WorkspaceCardGrid";
import { ImageCropperModal, RecentAssetsModal } from "@/components/shared/image-editor";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";
import type { Agency, AgencyCategory, CompanySize } from "@/types/agency";
import type { Workspace } from "@/types/workspace";
import {
  AgencyDetailEditForm,
  type AgencyDetailFieldErrors,
} from "./components/AgencyDetailEditForm";
import { AgencyDetailInfo } from "./components/AgencyDetailInfo";

const CURRENT_YEAR = new Date().getFullYear();
const URL_RE = /^https?:\/\/.+/i;
const PHONE_RE = /^[0-9+\-\s()]{6,20}$/;

export function AgencyDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  // Cropper & Recent Modals state
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [logoCropperSrc, setLogoCropperSrc] = useState<string | null>(null);
  const [logoRecentModalOpen, setLogoRecentModalOpen] = useState(false);

  const [bannerCropperOpen, setBannerCropperOpen] = useState(false);
  const [bannerCropperSrc, setBannerCropperSrc] = useState<string | null>(null);
  const [bannerRecentModalOpen, setBannerRecentModalOpen] = useState(false);

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

  const [errors, setErrors] = useState<AgencyDetailFieldErrors>({});

  const validateField = (field: keyof AgencyDetailFieldErrors, value: string) => {
    let message: string | undefined;
    switch (field) {
      case "name":
        if (!value.trim()) message = t("agency.detail.errors.nameRequired");
        break;
      case "website":
        if (value && !URL_RE.test(value))
          message = t("agency.detail.errors.invalidUrl");
        break;
      case "phone":
        if (value && !PHONE_RE.test(value))
          message = t("agency.detail.errors.invalidPhone");
        break;
      case "facebookUrl":
        if (value && !URL_RE.test(value))
          message = t("agency.detail.errors.invalidFacebookUrl");
        break;
      case "linkedinUrl":
        if (value && !URL_RE.test(value))
          message = t("agency.detail.errors.invalidLinkedinUrl");
        break;
      case "instagramUrl":
        if (value && !URL_RE.test(value))
          message = t("agency.detail.errors.invalidInstagramUrl");
        break;
      case "foundedYear":
        if (value) {
          const y = parseInt(value, 10);
          if (isNaN(y) || y <= 0 || y > CURRENT_YEAR)
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
    setName(a.name || "");
    setDescription(a.description || "");
    setLogoUrl(a.logoUrl || "");
    setCategory((a.category as AgencyCategory) || "");
    setCompanySize((a.companySize as CompanySize) || "");
    setWebsite(a.website || "");
    setPhone(a.phone || "");
    setLocation(a.location || "");
    setBrandColor(a.brandColor || "#f05a28");
    setLogoIcon(a.logoIcon || LOGO_ICON_OPTIONS[0].name);
    setTagline(a.tagline || "");
    setFoundedYear(a.foundedYear ? String(a.foundedYear) : "");
    setFacebookUrl(a.facebookUrl || "");
    setLinkedinUrl(a.linkedinUrl || "");
    setInstagramUrl(a.instagramUrl || "");
    setErrors({});
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
  }, [id, t]);

  const isOwner = !!agency && !!currentUser && agency.ownerId === currentUser.id;
  const isClientView = !!agency && !isOwner && !agency.myRole;

  useEffect(() => {
    if (id && !isClientView) setCurrentAgencyId(id);
  }, [id, isClientView, setCurrentAgencyId]);

  useEffect(() => {
    if (!id || isClientView) return;
    workspaceService
      .list()
      .then(({ data }) =>
        setWorkspaces(data.data.filter((w) => w.agencyId === id)),
      )
      .catch(() => setWorkspaces([]));
  }, [id, isClientView]);

  const handleSave = async () => {
    if (!agency || !id) return;

    const isNameValid = validateField("name", name);
    const isWebsiteValid = validateField("website", website);
    const isPhoneValid = validateField("phone", phone);
    const isYearValid = validateField("foundedYear", foundedYear);
    const isFbValid = validateField("facebookUrl", facebookUrl);
    const isLiValid = validateField("linkedinUrl", linkedinUrl);
    const isIgValid = validateField("instagramUrl", instagramUrl);

    if (
      !isNameValid ||
      !isWebsiteValid ||
      !isPhoneValid ||
      !isYearValid ||
      !isFbValid ||
      !isLiValid ||
      !isIgValid
    ) {
      toast.error(t("agency.detail.fixErrorsBeforeSaving"));
      return;
    }

    setSaving(true);
    try {
      const yearNum = foundedYear ? parseInt(foundedYear, 10) : undefined;
      const { data } = await agencyService.update(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        category: (category as AgencyCategory) || undefined,
        companySize: (companySize as CompanySize) || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum > 0 && yearNum <= CURRENT_YEAR
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
    if (agency) applyAgency(agency);
    setIsEditing(false);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoCropperSrc(url);
    setLogoCropperOpen(true);
  };

  const handleLogoCropConfirm = async (croppedFile: File) => {
    if (!id) return;
    setLogoCropperOpen(false);
    setUploadingLogo(true);
    try {
      const { data } = await agencyService.uploadLogo(id, croppedFile);
      const newLogoUrl = data.data.logoUrl ?? "";
      setLogoUrl(newLogoUrl);
      setAgency((prev) => (prev ? { ...prev, logoUrl: newLogoUrl } : prev));
      if (newLogoUrl) saveRecentAsset("logo", newLogoUrl);
      toast.success(t("agency.detail.logoUploadSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.uploadLogoFailed")));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSelectRecentLogo = async (url: string) => {
    setLogoRecentModalOpen(false);
    setLogoCropperSrc(url);
    setLogoCropperOpen(true);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerCropperSrc(url);
    setBannerCropperOpen(true);
  };

  const handleBannerCropConfirm = async (croppedFile: File) => {
    if (!id) return;
    setBannerCropperOpen(false);
    setUploadingBanner(true);
    try {
      const { data } = await agencyService.uploadBanner(id, croppedFile);
      const newBannerUrl = data.data.bannerUrl ?? "";
      setAgency((prev) => (prev ? { ...prev, bannerUrl: newBannerUrl } : prev));
      if (newBannerUrl) saveRecentAsset("banner", newBannerUrl);
      toast.success(t("agency.detail.bannerUploadSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.uploadBannerFailed")));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSelectRecentBanner = async (url: string) => {
    setBannerRecentModalOpen(false);
    setBannerCropperSrc(url);
    setBannerCropperOpen(true);
  };

  const handleRestore = async () => {
    if (!id) return;
    setRestoring(true);
    try {
      const { data } = await agencyService.restore(id);
      applyAgency(data.data);
      toast.success(t("agency.detail.restoreSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.restoreFailed")));
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-brand-orange size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="w-full px-4 py-12 text-center md:px-8">
        <p className="text-muted-foreground">{t("agency.detail.notFound")}</p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => navigate("/agency")}
        >
          {t("agency.detail.back")}
        </Button>
      </div>
    );
  }

  const isDeleted = agency.status === "SOFT_DELETED";

  return (
    <div className="w-full space-y-6 px-4 py-4 pb-24 md:px-8 md:py-6">
      {/* Soft-Deleted Alert Banner */}
      {isDeleted && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:text-amber-200">
          <div className="flex items-center gap-3">
            <TriangleAlert className="size-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold">
                {t("agency.detail.deletedBannerTitle")}
              </p>
              <p className="text-xs opacity-80">
                {t("agency.detail.deletedBannerDesc")}
              </p>
            </div>
          </div>
          {isOwner && (
            <Button
              size="sm"
              loading={restoring}
              className="bg-amber-600 hover:bg-amber-700 w-fit cursor-pointer text-white"
              onClick={handleRestore}
            >
              {t("agency.detail.restoreButton")}
            </Button>
          )}
        </div>
      )}

      {/* Main Agency Content */}
      <div className="space-y-6">
        <section id="agency-detail" className="scroll-mt-6 space-y-6">
          <ProfileBannerHeader
            bannerUrl={agency.bannerUrl || null}
            bannerEmptyLabel={t("agency.detail.bannerEmptyLabel")}
            uploadBannerLabel={t("agency.detail.uploadBannerButton")}
            uploadingBanner={uploadingBanner}
            bannerInputRef={bannerInputRef}
            onBannerFileChange={handleBannerFileChange}
            canEditBanner={Boolean(isOwner && isEditing)}
            logo={
              isEditing ? (
                logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  (() => {
                    const CurrentLogoIcon = getLogoIcon(logoIcon);
                    return (
                      <div
                        className="flex size-full items-center justify-center transition-colors text-white"
                        style={{
                          backgroundColor: brandColor || "#f05a28",
                          color: "#ffffff",
                        }}
                      >
                        <CurrentLogoIcon
                          className="size-10 sm:size-12 transition-transform text-white"
                        />
                      </div>
                    );
                  })()
                )
              ) : agency.logoUrl ? (
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="size-full object-cover"
                />
              ) : (
                (() => {
                  const CurrentLogoIcon = getLogoIcon(agency.logoIcon);
                  return (
                    <div
                      className="flex size-full items-center justify-center transition-colors text-white"
                      style={{
                        backgroundColor: agency.brandColor || "#f05a28",
                        color: "#ffffff",
                      }}
                    >
                      <CurrentLogoIcon
                        className="size-10 sm:size-12 transition-transform text-white"
                      />
                    </div>
                  );
                })()
              )
            }
            canEditLogo={Boolean(isOwner && isEditing)}
            uploadingLogo={uploadingLogo}
            logoInputRef={logoInputRef}
            onLogoFileChange={handleLogoFileChange}
            uploadLogoTitle={t("agency.detail.uploadLogoButton")}
            title={isEditing ? name || agency.name : agency.name}
            subtitle={agency.tagline}
            hint={!isOwner ? t("agency.detail.ownerOnlyHint") : null}
            actions={
              isOwner && !isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit cursor-pointer gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  {t("agency.detail.editButton")}
                </Button>
              ) : isOwner && isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="cursor-pointer"
                  >
                    {t("agency.detail.cancelButton")}
                  </Button>
                  <Button
                    size="sm"
                    loading={saving}
                    disabled={hasErrors || !name.trim()}
                    onClick={handleSave}
                    className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
                  >
                    {t("agency.detail.saveButton")}
                  </Button>
                </div>
              ) : null
            }
          >
            {isEditing ? (
              <AgencyDetailEditForm
                name={name}
                setName={setName}
                validateField={validateField}
                errors={errors}
                logoUrl={logoUrl}
                brandColor={brandColor}
                setBrandColor={setBrandColor}
                logoIcon={logoIcon}
                setLogoIcon={setLogoIcon}
                logoInputRef={logoInputRef}
                handleLogoFileChange={handleLogoFileChange}
                uploadingLogo={uploadingLogo}
                onOpenLogoCropper={() => {
                  if (logoUrl) {
                    setLogoCropperSrc(logoUrl);
                    setLogoCropperOpen(true);
                  }
                }}
                onOpenLogoRecent={() => setLogoRecentModalOpen(true)}
                description={description}
                setDescription={setDescription}
                tagline={tagline}
                setTagline={setTagline}
                category={category}
                setCategory={setCategory}
                companySize={companySize}
                setCompanySize={setCompanySize}
                website={website}
                setWebsite={setWebsite}
                phone={phone}
                setPhone={setPhone}
                location={location}
                setLocation={setLocation}
                foundedYear={foundedYear}
                setFoundedYear={setFoundedYear}
                facebookUrl={facebookUrl}
                setFacebookUrl={setFacebookUrl}
                linkedinUrl={linkedinUrl}
                setLinkedinUrl={setLinkedinUrl}
                instagramUrl={instagramUrl}
                setInstagramUrl={setInstagramUrl}
                handleCancelEdit={handleCancelEdit}
                handleSave={handleSave}
                saving={saving}
                hasErrors={hasErrors}
              />
            ) : (
              <AgencyDetailInfo agency={agency} />
            )}
          </ProfileBannerHeader>

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

          {!isEditing && workspaces.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-foreground text-sm font-semibold">
                {t("agency.detail.workspacesTitle")}
              </h3>
              <WorkspaceCardGrid
                workspaces={workspaces}
                onOpen={(wsId) => navigate(`/workspaces/${wsId}/dashboard`)}
              />
            </div>
          )}

          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/agency")}
          >
            {t("agency.detail.back")}
          </Button>
        </section>

        {!isClientView && (
          <>
            <div className="border-border border-t" />

            <section className="space-y-4">
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  {t("agency.detail.nav.members")}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t("agency.detail.membersPreviewDescription")}
                </p>
              </div>
              {id && <AgencyOrgChart agencyId={id} />}
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => navigate(`/agency/${id}/members`)}
              >
                <User className="size-3.5" />
                {t("agency.detail.viewAllMembers")}
              </Button>
            </section>
          </>
        )}
      </div>

      {/* Modals for Image Cropping and Recent Assets */}
      <ImageCropperModal
        isOpen={logoCropperOpen}
        onClose={() => setLogoCropperOpen(false)}
        cropType="logo"
        imageUrl={logoCropperSrc}
        onConfirm={handleLogoCropConfirm}
      />

      <RecentAssetsModal
        isOpen={logoRecentModalOpen}
        onClose={() => setLogoRecentModalOpen(false)}
        category="logo"
        onSelect={handleSelectRecentLogo}
      />

      <ImageCropperModal
        isOpen={bannerCropperOpen}
        onClose={() => setBannerCropperOpen(false)}
        cropType="banner"
        imageUrl={bannerCropperSrc}
        onConfirm={handleBannerCropConfirm}
      />

      <RecentAssetsModal
        isOpen={bannerRecentModalOpen}
        onClose={() => setBannerRecentModalOpen(false)}
        category="banner"
        onSelect={handleSelectRecentBanner}
      />
    </div>
  );
}

export default AgencyDetailPage;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import {
  isValidFoundedYear,
  isValidUrl,
  normalizeUrl,
  isValidPhone,
} from "@/utils/validation";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";
import type {
  CompanySize,
  MemberRole,
  ReportFrequency,
  WorkspaceIndustry,
} from "@/types/workspace";

export const MAX_LOGO_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface WorkspaceProfileSnapshot {
  name: string;
  timezone: string;
  defaultPlatforms: string[];
  reportFrequency: ReportFrequency | null;
  brandColor: string | null;
  logoIcon: string;
  industry: WorkspaceIndustry | "";
  companySize: CompanySize | "";
  website: string;
  phone: string;
  location: string;
  description: string;
  tagline: string;
  foundedYear: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
}

export function useWorkspaceSettings() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const workspaceInStore = useWorkspaceStore((s) =>
    s.workspaceList.find((w) => w.id === workspaceId),
  );
  const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(() => defaultTz);
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>([]);
  const [reportFrequency, setReportFrequency] =
    useState<ReportFrequency | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const [logoIcon, setLogoIcon] = useState("");
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [workspaceMyRole, setWorkspaceMyRole] = useState<MemberRole | null>(
    null,
  );
  const [memberRole, setMemberRole] = useState<MemberRole | null>(null);
  // deleteWorkspace ở BE chỉ cho Agency OWNER thật (so ownerId của Agency, không
  // phải role WorkspaceMember) — canManage (MANAGER/OWNER workspace) không đủ
  // điều kiện, MANAGER bấm Delete sẽ luôn dính 403 FORBIDDEN nếu chỉ gate bằng canManage.
  const [canDelete, setCanDelete] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const savedSnapshotRef = useRef<WorkspaceProfileSnapshot>({
    name: "",
    timezone: defaultTz,
    defaultPlatforms: [],
    reportFrequency: null,
    brandColor: null,
    logoIcon: "",
    industry: "",
    companySize: "",
    website: "",
    phone: "",
    location: "",
    description: "",
    tagline: "",
    foundedYear: "",
    facebookUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
  });

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getById(workspaceId)
      .then(({ data }) => {
        const ws = data.data;
        const resolvedTz = ws.settings.timezone || defaultTz;
        const resolvedPlatforms = ws.settings.defaultPlatforms ?? [];
        const resolvedFreq = ws.settings.reportFrequency ?? null;
        const resolvedBrandColor = ws.brandColor ?? null;
        const resolvedLogoIcon = ws.logoIcon ?? "";
        const resolvedIndustry = ws.industry ?? "";
        const resolvedCompanySize = ws.companySize ?? "";
        const resolvedWebsite = ws.website ?? "";
        const resolvedPhone = ws.phone ?? "";
        const resolvedLocation = ws.location ?? "";
        const resolvedDescription = ws.description ?? "";
        const resolvedTagline = ws.tagline ?? "";
        const resolvedFoundedYear = ws.foundedYear
          ? String(ws.foundedYear)
          : "";
        const resolvedFacebook = ws.facebookUrl ?? "";
        const resolvedLinkedin = ws.linkedinUrl ?? "";
        const resolvedInstagram = ws.instagramUrl ?? "";

        setName(ws.name);
        setLogoUrl(ws.logoUrl);
        setBannerUrl(ws.bannerUrl);
        setBrandColor(resolvedBrandColor);
        setLogoIcon(resolvedLogoIcon);
        setWorkspaceMyRole(ws.myRole);
        if (ws.settings.timezone) setTimezone(ws.settings.timezone);
        setDefaultPlatforms(resolvedPlatforms);
        setReportFrequency(resolvedFreq);
        setIndustry(resolvedIndustry);
        setCompanySize(resolvedCompanySize);
        setWebsite(resolvedWebsite);
        setPhone(resolvedPhone);
        setLocation(resolvedLocation);
        setDescription(resolvedDescription);
        setTagline(resolvedTagline);
        setFoundedYear(resolvedFoundedYear);
        setFacebookUrl(resolvedFacebook);
        setLinkedinUrl(resolvedLinkedin);
        setInstagramUrl(resolvedInstagram);

        savedSnapshotRef.current = {
          name: ws.name,
          timezone: resolvedTz,
          defaultPlatforms: resolvedPlatforms,
          reportFrequency: resolvedFreq,
          brandColor: resolvedBrandColor,
          logoIcon: resolvedLogoIcon,
          industry: resolvedIndustry,
          companySize: resolvedCompanySize,
          website: resolvedWebsite,
          phone: resolvedPhone,
          location: resolvedLocation,
          description: resolvedDescription,
          tagline: resolvedTagline,
          foundedYear: resolvedFoundedYear,
          facebookUrl: resolvedFacebook,
          linkedinUrl: resolvedLinkedin,
          instagramUrl: resolvedInstagram,
        };

        return ws.agencyId ? agencyService.getById(ws.agencyId) : null;
      })
      .then((res) =>
        setCanDelete(Boolean(userId && res?.data.data.ownerId === userId)),
      )
      .catch((err: unknown) => {
        setCanDelete(false);
        toast.error(extractErrorMessage(err, t("common.loadFailed")));
      })
      .finally(() => setLoading(false));

    workspaceService
      .listMembers(workspaceId)
      .then(({ data }) => {
        const me = data.data.find((m) => m.userId === userId);
        setMemberRole(me?.role ?? null);
      })
      .catch(() => setMemberRole(null));
  }, [workspaceId, userId, t, defaultTz]);

  const effectiveRole: MemberRole | undefined =
    memberRole ??
    workspaceMyRole ??
    workspaceInStore?.myRole ??
    currentMemberRole ??
    (canDelete ? "OWNER" : undefined);
  const canManage = effectiveRole === "OWNER" || effectiveRole === "MANAGER";

  const toggleWorkspacePlatform = (platform: string) => {
    setDefaultPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const toggleReportFrequency = (value: ReportFrequency) => {
    setReportFrequency((prev) => (prev === value ? null : value));
  };

  const handleCancelEdit = () => {
    const snap = savedSnapshotRef.current;
    setName(snap.name);
    setTimezone(snap.timezone);
    setDefaultPlatforms(snap.defaultPlatforms);
    setReportFrequency(snap.reportFrequency);
    setBrandColor(snap.brandColor);
    setLogoIcon(snap.logoIcon);
    setIndustry(snap.industry);
    setCompanySize(snap.companySize);
    setWebsite(snap.website);
    setPhone(snap.phone);
    setLocation(snap.location);
    setDescription(snap.description);
    setTagline(snap.tagline);
    setFoundedYear(snap.foundedYear);
    setFacebookUrl(snap.facebookUrl);
    setLinkedinUrl(snap.linkedinUrl);
    setInstagramUrl(snap.instagramUrl);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !workspaceId) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      toast.error(t("workspace.settings.logoInvalidType"));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error(t("workspace.settings.logoTooLarge"));
      return;
    }

    setUploadingLogo(true);
    try {
      const { data } = await workspaceService.uploadLogo(workspaceId, file);
      setLogoUrl(data.data.logoUrl);
      if (data.data.logoUrl) saveRecentAsset("logo", data.data.logoUrl);
      toast.success(t("workspace.settings.logoUploadSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerChange = async (file: File) => {
    if (!workspaceId) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      toast.error(t("workspace.settings.logoInvalidType"));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error(t("workspace.settings.logoTooLarge"));
      return;
    }

    setUploadingBanner(true);
    try {
      const { data } = await workspaceService.uploadBanner(workspaceId, file);
      setBannerUrl(data.data.bannerUrl);
      if (data.data.bannerUrl) saveRecentAsset("banner", data.data.bannerUrl);
      toast.success(t("workspace.settings.bannerUploadSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    if (
      !name.trim() ||
      (foundedYear.trim() && !isValidFoundedYear(foundedYear)) ||
      (phone.trim() && !isValidPhone(phone)) ||
      [website, facebookUrl, linkedinUrl, instagramUrl].some(
        (value) => value.trim() && !isValidUrl(normalizeUrl(value)),
      )
    ) {
      toast.error(
        t("common.formError", "Vui lòng kiểm tra lại các trường thông tin"),
      );
      return;
    }
    setSaving(true);
    try {
      const parsedYear = foundedYear.trim()
        ? Number(foundedYear.trim())
        : undefined;
      await workspaceService.updateSettings(workspaceId, {
        name: name.trim(),
        timezone,
        defaultPlatforms,
        reportFrequency: reportFrequency ?? "",
        industry: industry || undefined,
        companySize: companySize || undefined,
        website: website.trim() ? normalizeUrl(website) : "",
        phone: phone.trim(),
        location: location.trim(),
        description: description.trim(),
        tagline: tagline.trim(),
        brandColor: brandColor ?? "",
        logoIcon: logoIcon.trim(),
        foundedYear: parsedYear,
        facebookUrl: facebookUrl.trim() ? normalizeUrl(facebookUrl) : "",
        linkedinUrl: linkedinUrl.trim() ? normalizeUrl(linkedinUrl) : "",
        instagramUrl: instagramUrl.trim() ? normalizeUrl(instagramUrl) : "",
        clearFields: [
          ...(!industry ? ["industry" as const] : []),
          ...(!companySize ? ["companySize" as const] : []),
          ...(!foundedYear.trim() ? ["foundedYear" as const] : []),
        ],
      });
      savedSnapshotRef.current = {
        name: name.trim(),
        timezone,
        defaultPlatforms,
        reportFrequency,
        brandColor,
        logoIcon,
        industry,
        companySize,
        website: website.trim(),
        phone: phone.trim(),
        location: location.trim(),
        description: description.trim(),
        tagline: tagline.trim(),
        foundedYear: foundedYear.trim(),
        facebookUrl: facebookUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        instagramUrl: instagramUrl.trim(),
      };
      toast.success(t("workspace.settings.saveSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setSaving(false);
    }
  };

  return {
    workspaceId,
    loading,
    saving,
    name,
    setName,
    timezone,
    setTimezone,
    defaultPlatforms,
    reportFrequency,
    logoUrl,
    bannerUrl,
    brandColor,
    setBrandColor,
    logoIcon,
    setLogoIcon,
    industry,
    setIndustry,
    companySize,
    setCompanySize,
    website,
    setWebsite,
    phone,
    setPhone,
    location,
    setLocation,
    description,
    setDescription,
    tagline,
    setTagline,
    foundedYear,
    setFoundedYear,
    facebookUrl,
    setFacebookUrl,
    linkedinUrl,
    setLinkedinUrl,
    instagramUrl,
    setInstagramUrl,
    canManage,
    canDelete,
    uploadingLogo,
    uploadingBanner,
    fileInputRef,
    bannerInputRef,
    toggleWorkspacePlatform,
    toggleReportFrequency,
    handleCancelEdit,
    handleLogoChange,
    handleBannerChange,
    handleSubmit,
  };
}

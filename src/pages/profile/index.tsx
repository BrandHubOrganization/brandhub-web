import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BadgeCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { extractErrorMessage } from "@/utils/error";
import type { User } from "@/types/user";
import { AvatarUploadModal } from "./components/AvatarUploadModal";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { ImageCropperModal, RecentAssetsModal } from "@/components/shared/image-editor";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";
import { LinkPhoneModal } from "./components/LinkPhoneModal";
import { ProfilePreviewCard } from "./components/ProfilePreviewCard";
import { ProfileEditForm } from "./components/ProfileEditForm";
import { ProfileViewDetails } from "./components/ProfileViewDetails";
import {
  type ExtendedProfile,
  type VisibilityField,
  EMPTY_EXTENDED,
  defaultVisibility,
  toVisibility,
} from "./types";

/** API → state. Dùng chung cho cả lần load đầu và lần save (2 chiều đều nhận UserProfileResponse). */
function toExtended(p: {
  skills?: string[];
  location?: string | null;
  yearsOfExperience?: number | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  website?: string | null;
  bannerUrl?: string | null;
}): ExtendedProfile {
  return {
    skills: p.skills ?? [],
    location: p.location ?? "",
    yearsOfExperience:
      p.yearsOfExperience === null || p.yearsOfExperience === undefined
        ? ""
        : String(p.yearsOfExperience),
    linkedinUrl: p.linkedinUrl ?? "",
    facebookUrl: p.facebookUrl ?? "",
    instagramUrl: p.instagramUrl ?? "",
    tiktokUrl: p.tiktokUrl ?? "",
    website: p.website ?? "",
    bannerUrl: p.bannerUrl ?? "",
  };
}

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [linkPhoneOpen, setLinkPhoneOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar ?? null,
  );
  const [role, setRole] = useState(user?.role ?? "—");
  const [joinedAt, setJoinedAt] = useState<string | null>(
    user?.createdAt ?? null,
  );
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [workingLanguage, setWorkingLanguage] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [ext, setExt] = useState<ExtendedProfile>(EMPTY_EXTENDED);
  const [visibility, setVisibility] =
    useState<Record<VisibilityField, boolean>>(defaultVisibility());
  const savedVisibility =
    useRef<Record<VisibilityField, boolean>>(defaultVisibility());
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerCropperOpen, setBannerCropperOpen] = useState(false);
  const [bannerCropperSrc, setBannerCropperSrc] = useState<string | null>(null);
  const [bannerRecentModalOpen, setBannerRecentModalOpen] = useState(false);
  const email = user?.email ?? "";
  const savedProfile = useRef({
    name: "",
    phone: "",
    professionalTitle: "",
    bio: "",
    portfolioUrls: [] as string[],
    workingLanguage: "",
    timezone: "Asia/Ho_Chi_Minh",
  });
  const savedExt = useRef<ExtendedProfile>(EMPTY_EXTENDED);

  const patchExt = (patch: Partial<ExtendedProfile>) =>
    setExt((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    userService
      .getProfile()
      .then((resp) => {
        const p = resp.data.data;
        setName(p.fullName);
        setPhone(p.phone ?? "");
        setAvatarUrl(p.avatarUrl);
        setRole(p.role);
        setJoinedAt(p.createdAt);
        setProfessionalTitle(p.professionalTitle ?? "");
        setBio(p.bio ?? "");
        setPortfolioUrls(p.portfolioUrls ?? []);
        setWorkingLanguage(p.workingLanguage ?? "");
        setTimezone(p.timezone ?? "Asia/Ho_Chi_Minh");
        const loaded = toExtended(p);
        setExt(loaded);
        savedExt.current = loaded;
        const loadedVisibility = toVisibility(p.profileVisibility);
        setVisibility(loadedVisibility);
        savedVisibility.current = loadedVisibility;
        savedProfile.current = {
          name: p.fullName,
          phone: p.phone ?? "",
          professionalTitle: p.professionalTitle ?? "",
          bio: p.bio ?? "",
          portfolioUrls: p.portfolioUrls ?? [],
          workingLanguage: p.workingLanguage ?? "",
          timezone: p.timezone ?? "Asia/Ho_Chi_Minh",
        };
      })
      .catch(() => {
        // fall back to authStore data already rendered
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const years = ext.yearsOfExperience.trim();
      const resp = await userService.updateProfile({
        fullName: name,
        phone: phone || undefined,
        professionalTitle: professionalTitle || undefined,
        bio: bio || undefined,
        portfolioUrls: portfolioUrls.filter((u) => u.trim() !== ""),
        workingLanguage: workingLanguage || undefined,
        skills: ext.skills,
        location: ext.location.trim() || undefined,
        yearsOfExperience: years === "" ? undefined : Number(years),
        linkedinUrl: ext.linkedinUrl.trim() || undefined,
        facebookUrl: ext.facebookUrl.trim() || undefined,
        instagramUrl: ext.instagramUrl.trim() || undefined,
        tiktokUrl: ext.tiktokUrl.trim() || undefined,
        website: ext.website.trim() || undefined,
        bannerUrl: ext.bannerUrl.trim() || undefined,
        timezone: timezone || undefined,
        profileVisibility: visibility,
      });
      const p = resp.data.data;
      setUser({
        ...(user ?? ({} as User)),
        id: p.userId,
        name: p.fullName,
        email: p.email,
        avatar: p.avatarUrl ?? undefined,
        phone: p.phone ?? undefined,
        role: p.role as User["role"],
      });
      setName(p.fullName);
      setPhone(p.phone ?? "");
      setProfessionalTitle(p.professionalTitle ?? "");
      setBio(p.bio ?? "");
      setPortfolioUrls(p.portfolioUrls ?? []);
      setWorkingLanguage(p.workingLanguage ?? "");
      setTimezone(p.timezone ?? "Asia/Ho_Chi_Minh");
      const nextExt = toExtended(p);
      setExt(nextExt);
      savedExt.current = nextExt;
      const nextVisibility = toVisibility(p.profileVisibility);
      setVisibility(nextVisibility);
      savedVisibility.current = nextVisibility;
      savedProfile.current = {
        name: p.fullName,
        phone: p.phone ?? "",
        professionalTitle: p.professionalTitle ?? "",
        bio: p.bio ?? "",
        portfolioUrls: p.portfolioUrls ?? [],
        workingLanguage: p.workingLanguage ?? "",
        timezone: p.timezone ?? "Asia/Ho_Chi_Minh",
      };
      setIsEditing(false);
      toast.success(t("settings.profile.saveSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const saved = savedProfile.current;
    setName(saved.name);
    setPhone(saved.phone);
    setProfessionalTitle(saved.professionalTitle);
    setBio(saved.bio);
    setPortfolioUrls(saved.portfolioUrls);
    setWorkingLanguage(saved.workingLanguage);
    setTimezone(saved.timezone);
    setExt(savedExt.current);
    setVisibility(savedVisibility.current);
    setIsEditing(false);
  };

  const handleAvatarUploaded = (url: string) => {
    setAvatarUrl(url);
    if (user) setUser({ ...user, avatar: url });
  };

  // Upload banner: endpoint ghi URL S3 vào DB ngay, nên state chỉ cần đồng bộ
  // URL trả về (giống avatar). Dán URL tay thì đi qua handleSave như field thường.
  const handleBannerFile = async (file: File) => {
    setBannerUploading(true);
    try {
      const resp = await userService.uploadBanner(file);
      const url = resp.data.data.bannerUrl;
      saveRecentAsset("banner", url);
      patchExt({ bannerUrl: url });
      savedExt.current = { ...savedExt.current, bannerUrl: url };
      toast.success(t("profile.edit.bannerUploadSuccess", "Tải ảnh bìa thành công"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("profile.edit.bannerUploadFailed")),
      );
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerCropperSrc(url);
    setBannerCropperOpen(true);
  };

  const handleBannerCropConfirm = (croppedFile: File) => {
    setBannerCropperOpen(false);
    void handleBannerFile(croppedFile);
  };

  const handleSelectRecentBanner = (url: string) => {
    setBannerRecentModalOpen(false);
    patchExt({ bannerUrl: url });
    toast.success("Đã chọn ảnh bìa từ lịch sử");
  };

  // Chỉ những kênh user thực sự điền mới hiển thị.
  const socials = (
    [
      { key: "linkedin", url: ext.linkedinUrl },
      { key: "facebook", url: ext.facebookUrl },
      { key: "instagram", url: ext.instagramUrl },
      { key: "tiktok", url: ext.tiktokUrl },
      { key: "website", url: ext.website },
    ] as const
  ).filter((s) => s.url.trim() !== "");

  return (
    <section id="profile" className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold">
          {t("profile.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("profile.description")}
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileBannerHeader
            bannerUrl={ext.bannerUrl || null}
            bannerEmptyLabel={t("profile.edit.bannerPlaceholder")}
            uploadBannerLabel={t("profile.edit.bannerUpload")}
            uploadingBanner={bannerUploading}
            bannerInputRef={bannerInputRef}
            onBannerFileChange={handleBannerFileChange}
            canEditBanner={isEditing}
            isAvatarRound={true}
            logo={
              avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center text-xl font-bold">
                  {(name || "?").charAt(0).toUpperCase()}
                </div>
              )
            }
            canEditLogo={isEditing}
            onLogoClick={() => setAvatarModalOpen(true)}
            uploadLogoTitle={t("profile.avatar.upload")}
            title={name}
            subtitle={email}
            badges={
              <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                <BadgeCheck className="size-3" />
                {t("profile.verified")}
              </span>
            }
            actions={
              !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  {t("profile.editButton")}
                </Button>
              )
            }
          >
            {isEditing ? (
              <ProfileEditForm
                name={name}
                setName={setName}
                email={email}
                phone={phone}
                setPhone={setPhone}
                professionalTitle={professionalTitle}
                setProfessionalTitle={setProfessionalTitle}
                workingLanguage={workingLanguage}
                setWorkingLanguage={setWorkingLanguage}
                timezone={timezone}
                setTimezone={setTimezone}
                bio={bio}
                setBio={setBio}
                portfolioUrls={portfolioUrls}
                setPortfolioUrls={setPortfolioUrls}
                ext={ext}
                patchExt={patchExt}
                bannerUploading={bannerUploading}
                bannerInputRef={bannerInputRef}
                handleBannerFileChange={handleBannerFileChange}
                onOpenBannerCropper={() => {
                  if (ext.bannerUrl) {
                    setBannerCropperSrc(ext.bannerUrl);
                    setBannerCropperOpen(true);
                  }
                }}
                onOpenBannerRecent={() => setBannerRecentModalOpen(true)}
                visibility={visibility}
                setVisibility={setVisibility}
                handleCancelEdit={handleCancelEdit}
                handleSave={handleSave}
                saving={saving}
              />
            ) : (
              <ProfileViewDetails
                role={role}
                phone={phone}
                joinedAt={joinedAt ?? undefined}
                lastLoginAt={user?.lastLoginAt}
                professionalTitle={professionalTitle}
                workingLanguage={workingLanguage}
                timezone={timezone}
                bio={bio}
                portfolioUrls={portfolioUrls}
                ext={ext}
                socials={socials}
                onOpenLinkPhone={() => setLinkPhoneOpen(true)}
              />
            )}
          </ProfileBannerHeader>
        </div>

        <ProfilePreviewCard
          ext={ext}
          avatarUrl={avatarUrl}
          name={name}
          professionalTitle={professionalTitle}
          bio={bio}
          portfolioUrls={portfolioUrls}
          workingLanguage={workingLanguage}
          timezone={timezone}
          socials={socials}
        />
      </div>

      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSave={handleAvatarUploaded}
      />

      <LinkPhoneModal
        isOpen={linkPhoneOpen}
        onClose={() => setLinkPhoneOpen(false)}
        onLinked={(linkedPhone) => {
          setPhone(linkedPhone);
          savedProfile.current.phone = linkedPhone;
        }}
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
    </section>
  );
}

export default ProfilePage;

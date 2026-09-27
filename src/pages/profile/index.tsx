import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BadgeCheck,
  BellRing,
  Briefcase,
  Calendar,
  Camera,
  Clock,
  Eye,
  ImagePlus,
  Link2,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { extractErrorMessage } from "@/utils/error";
import type { User } from "@/types/user";
import { AvatarUploadModal } from "./components/AvatarUploadModal";
import { LinkPhoneModal } from "./components/LinkPhoneModal";
import { JobTitleSelect } from "./components/JobTitleSelect";
import { LanguageChipSelect } from "./components/LanguageChipSelect";
import { SkillsChipSelect } from "./components/SkillsChipSelect";
import { TimezoneSelect } from "@/pages/workspace/components/TimezoneSelect";
import {
  isCuratedJobTitle,
  isLanguage,
  isSkill,
  parseLanguages,
} from "./constants";

/**
 * Các trường mở rộng của hồ sơ (skills/vị trí/kinh nghiệm/social/banner).
 * Gom 1 object để mọi điểm đồng bộ (load / save / cancel) chỉ cần 1 dòng,
 * thay vì 9 state rời rạc × 6 chỗ.
 */
interface ExtendedProfile {
  skills: string[];
  location: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  website: string;
  bannerUrl: string;
}

const EMPTY_EXTENDED: ExtendedProfile = {
  skills: [],
  location: "",
  yearsOfExperience: "",
  linkedinUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  website: "",
  bannerUrl: "",
};

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
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
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
      patchExt({ bannerUrl: url });
      savedExt.current = { ...savedExt.current, bannerUrl: url };
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("profile.edit.bannerUploadFailed")),
      );
    } finally {
      setBannerUploading(false);
    }
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
          <div className="border-border bg-card rounded-xl border p-6">
            {ext.bannerUrl && (
              <img
                src={ext.bannerUrl}
                alt={t("profile.edit.bannerLabel")}
                className="border-border mb-4 h-32 w-full rounded-lg border object-cover"
              />
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="border-border size-16 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-16 items-center justify-center rounded-full border text-xl font-bold">
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="bg-brand-orange absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full text-white shadow-xs"
                      title={t("profile.avatar.upload")}
                    >
                      <Camera className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-foreground text-base font-semibold">
                    {name}
                  </h2>
                  <p className="text-muted-foreground text-xs">{email}</p>
                  <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                    <BadgeCheck className="size-3" />
                    {t("profile.verified")}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  {t("profile.editButton")}
                </Button>
              )}
            </div>

            {isEditing ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("settings.profile.fullNameLabel")}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("settings.profile.emailLabel")}
                    </label>
                    <Input value={email} readOnly />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.phoneLabel")}
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("profile.edit.phonePlaceholder")}
                    />
                  </div>
                  <div>
                    <JobTitleSelect
                      value={professionalTitle}
                      onChange={setProfessionalTitle}
                    />
                  </div>
                  <div>
                    <LanguageChipSelect
                      value={workingLanguage}
                      onChange={setWorkingLanguage}
                    />
                  </div>
                  <TimezoneSelect value={timezone} onChange={setTimezone} />
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.bioLabel")}
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t("profile.edit.bioPlaceholder")}
                      rows={3}
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.portfolioLabel")}
                    </label>
                    <div className="space-y-2">
                      {portfolioUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const next = [...portfolioUrls];
                              next[idx] = e.target.value;
                              setPortfolioUrls(next);
                            }}
                            placeholder={t("profile.edit.portfolioPlaceholder")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPortfolioUrls(
                                portfolioUrls.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            {t("profile.edit.portfolioRemove")}
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPortfolioUrls([...portfolioUrls, ""])}
                      >
                        {t("profile.edit.portfolioAdd")}
                      </Button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <SkillsChipSelect
                      value={ext.skills}
                      onChange={(skills) => patchExt({ skills })}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.locationLabel")}
                    </label>
                    <Input
                      value={ext.location}
                      onChange={(e) => patchExt({ location: e.target.value })}
                      placeholder={t("profile.edit.locationPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.yearsOfExperienceLabel")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={70}
                      value={ext.yearsOfExperience}
                      onChange={(e) =>
                        patchExt({ yearsOfExperience: e.target.value })
                      }
                      placeholder={t(
                        "profile.edit.yearsOfExperiencePlaceholder",
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.linkedinLabel")}
                    </label>
                    <Input
                      value={ext.linkedinUrl}
                      onChange={(e) =>
                        patchExt({ linkedinUrl: e.target.value })
                      }
                      placeholder={t("profile.edit.socialPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.facebookLabel")}
                    </label>
                    <Input
                      value={ext.facebookUrl}
                      onChange={(e) =>
                        patchExt({ facebookUrl: e.target.value })
                      }
                      placeholder={t("profile.edit.socialPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.instagramLabel")}
                    </label>
                    <Input
                      value={ext.instagramUrl}
                      onChange={(e) =>
                        patchExt({ instagramUrl: e.target.value })
                      }
                      placeholder={t("profile.edit.socialPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.tiktokLabel")}
                    </label>
                    <Input
                      value={ext.tiktokUrl}
                      onChange={(e) => patchExt({ tiktokUrl: e.target.value })}
                      placeholder={t("profile.edit.socialPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.websiteLabel")}
                    </label>
                    <Input
                      value={ext.website}
                      onChange={(e) => patchExt({ website: e.target.value })}
                      placeholder={t("profile.edit.socialPlaceholder")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      {t("profile.edit.bannerLabel")}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={ext.bannerUrl}
                        onChange={(e) =>
                          patchExt({ bannerUrl: e.target.value })
                        }
                        placeholder={t("profile.edit.bannerPlaceholder")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        loading={bannerUploading}
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <ImagePlus className="size-3.5" />
                        {t("profile.edit.bannerUpload")}
                      </Button>
                      {ext.bannerUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          title={t("profile.edit.bannerRemove")}
                          onClick={() => patchExt({ bannerUrl: "" })}
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-3xs mt-1">
                      {t("profile.edit.bannerHint")}
                    </p>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleBannerFile(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {t("profile.cancelEdit")}
                  </Button>
                  <Button
                    variant="orange"
                    onClick={handleSave}
                    loading={saving}
                  >
                    {t("settings.profile.save")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-3xs">
                      {t("profile.view.roleLabel")}
                    </p>
                    <p className="text-foreground text-xs font-medium">
                      {role}
                    </p>
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
                    onClick={() => setLinkPhoneOpen(true)}
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
                      {user?.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "—"}
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
                          .map((c) =>
                            isLanguage(c) ? t(`profile.language.${c}`) : c,
                          )
                          .join(", ")
                      : t("profile.view.workingLanguageEmpty")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-3xs">
                    {t("profile.view.timezoneLabel")}
                  </p>
                  <p className="text-foreground text-xs font-medium">
                    {timezone}
                  </p>
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
            )}
          </div>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 lg:sticky lg:top-6">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Eye className="size-4" />
            {t("profile.preview.title")}
          </h3>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("profile.preview.hint")}
          </p>

          <div className="border-border mt-4 space-y-4 border-t pt-4">
            {ext.bannerUrl && (
              <img
                src={ext.bannerUrl}
                alt={t("profile.edit.bannerLabel")}
                className="border-border h-20 w-full rounded-lg border object-cover"
              />
            )}
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="border-border size-12 rounded-full border object-cover"
                />
              ) : (
                <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-12 items-center justify-center rounded-full border text-base font-bold">
                  {(name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <p className="text-foreground truncate text-sm font-semibold">
                  {name || t("profile.preview.nameEmpty")}
                </p>
                <span className="bg-brand-orange-soft text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                  <BadgeCheck className="size-3" />
                  {t("profile.verified")}
                </span>
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
                {t("profile.view.bioLabel")}
              </p>
              <p className="text-foreground text-xs font-medium whitespace-pre-wrap">
                {bio || t("profile.view.bioEmpty")}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.portfolioLabel")}
              </p>
              {portfolioUrls.filter((u) => u.trim() !== "").length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {portfolioUrls
                    .filter((u) => u.trim() !== "")
                    .map((url) => (
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

            <div>
              <p className="text-muted-foreground text-3xs">
                {t("profile.view.workingLanguageLabel")}
              </p>
              <p className="text-foreground text-xs font-medium">
                {workingLanguage
                  ? parseLanguages(workingLanguage)
                      .map((c) =>
                        isLanguage(c) ? t(`profile.language.${c}`) : c,
                      )
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

            {ext.skills.length > 0 && (
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("profile.view.skillsLabel")}
                </p>
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
              </div>
            )}

            {ext.location && (
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("profile.view.locationLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {ext.location}
                </p>
              </div>
            )}

            {ext.yearsOfExperience && (
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("profile.view.yearsOfExperienceLabel")}
                </p>
                <p className="text-foreground text-xs font-medium">
                  {t("profile.view.yearsOfExperienceValue", {
                    years: Number(ext.yearsOfExperience),
                  })}
                </p>
              </div>
            )}

            {socials.length > 0 && (
              <div>
                <p className="text-muted-foreground text-3xs">
                  {t("profile.view.socialLabel")}
                </p>
                <ul className="mt-1 space-y-1">
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
              </div>
            )}
          </div>
        </div>
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
    </section>
  );
}

export default ProfilePage;

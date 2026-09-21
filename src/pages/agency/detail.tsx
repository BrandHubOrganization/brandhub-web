import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  User,
  Users,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { agencyService } from "@/services/agencyService";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/utils/error";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import type { Agency, AgencyCategory, CompanySize } from "@/types/agency";

export function AgencyDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);

  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState<AgencyCategory | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!id) return;
    agencyService
      .getById(id)
      .then(({ data }) => {
        const a = data.data;
        setAgency(a);
        setName(a.name);
        setDescription(a.description ?? "");
        setLogoUrl(a.logoUrl ?? "");
        setCategory(a.category ?? "");
        setCompanySize(a.companySize ?? "");
        setWebsite(a.website ?? "");
        setPhone(a.phone ?? "");
        setLocation(a.location ?? "");
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadOneFailed"))),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  const isOwner =
    !!agency && !!currentUser && agency.ownerId === currentUser.id;

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { data } = await agencyService.update(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        category: category || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });
      setAgency(data.data);
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
    setName(agency.name);
    setDescription(agency.description ?? "");
    setLogoUrl(agency.logoUrl ?? "");
    setCategory(agency.category ?? "");
    setCompanySize(agency.companySize ?? "");
    setWebsite(agency.website ?? "");
    setPhone(agency.phone ?? "");
    setLocation(agency.location ?? "");
    setIsEditing(false);
  };

  if (loading) return null;
  if (!agency) return null;

  return (
    <PageWrapper
      title={t("agency.detail.title")}
      description={t("agency.detail.description")}
    >
      <div className="max-w-md space-y-6">
        <div className="bg-card flex flex-col gap-4 rounded-xl border p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-brand-orange/10 text-brand-orange flex size-12 shrink-0 items-center justify-center rounded-lg">
              <Building2 className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{agency.name}</p>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={t("agency.detail.logoUrlLabel")}
                placeholder={t("agency.detail.logoUrlPlaceholder")}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <Input
                label={t("agency.create.descriptionLabel")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("agency.create.phoneLabel")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label={t("agency.create.locationLabel")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  onClick={handleSave}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
                >
                  {t("agency.detail.saveButton")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                {agency.description || "—"}
              </p>
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
              </div>
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
              onClick={() => navigate("/workspaces/create")}
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
      </div>
    </PageWrapper>
  );
}

export default AgencyDetailPage;

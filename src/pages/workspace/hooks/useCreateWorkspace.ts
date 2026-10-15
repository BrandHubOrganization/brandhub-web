import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  workspaceService,
  type AssignEntry,
} from "@/services/workspaceService";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import type {
  CompanySize,
  WorkspaceIndustry,
  WorkspaceTemplate,
} from "@/types/workspace";
import {
  isValidFoundedYear,
  normalizeUrl,
  isValidUrl,
  isValidPhone,
} from "@/utils/validation";

export function useCreateWorkspace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  const templateId = searchParams.get("templateId");
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  // No agency chosen yet — creating a workspace requires picking one first.
  useEffect(() => {
    if (!agencyId) {
      toast.error(t("workspace.create.agencyRequired"));
      navigate("/agency", { replace: true });
    }
  }, [agencyId, navigate, t]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#f05a28");
  const [logoIcon, setLogoIcon] = useState(LOGO_ICON_OPTIONS[0].name);
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [assignMembers, setAssignMembers] = useState<AssignEntry[]>([]);
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Field bị ẩn mặc định (trùng Agency) — chỉ hiện khi có template đang áp.
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [industryFields, setIndustryFields] = useState<Record<string, unknown>>(
    {},
  );
  const [appliedTemplateName, setAppliedTemplateName] = useState<string | null>(
    null,
  );
  const [availableTemplates, setAvailableTemplates] = useState<
    WorkspaceTemplate[]
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    workspaceTemplateService
      .list()
      .then(({ data }) => setAvailableTemplates(data.data))
      .catch(() => setAvailableTemplates([]));
  }, []);

  const applyTemplateConfig = (tpl: WorkspaceTemplate) => {
    const cfg = tpl.config;
    setAppliedTemplateName(tpl.name);
    if (cfg.industry) setIndustry(cfg.industry);
    if (cfg.companySize) setCompanySize(cfg.companySize);
    if (cfg.website) setWebsite(cfg.website);
    if (cfg.phone) setPhone(cfg.phone);
    if (cfg.location) setLocation(cfg.location);
    if (cfg.description) setDescription(cfg.description);
    if (cfg.brandColor) setBrandColor(cfg.brandColor);
    if (cfg.logoIcon) setLogoIcon(cfg.logoIcon);
    if (cfg.tagline) setTagline(cfg.tagline);
    if (cfg.foundedYear) setFoundedYear(String(cfg.foundedYear));
    if (cfg.facebookUrl) setFacebookUrl(cfg.facebookUrl);
    if (cfg.linkedinUrl) setLinkedinUrl(cfg.linkedinUrl);
    if (cfg.instagramUrl) setInstagramUrl(cfg.instagramUrl);
    if (cfg.industryFields) setIndustryFields(cfg.industryFields);
  };

  useEffect(() => {
    if (!templateId) return;
    setSelectedTemplateId(templateId);
    workspaceTemplateService
      .getById(templateId)
      .then(({ data }) => applyTemplateConfig(data.data))
      .catch(() => {
        /* template load lỗi — không chặn tạo workspace, chỉ bỏ prefill */
      });
  }, [templateId]);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setAppliedTemplateName(null);
      return;
    }
    const tpl = availableTemplates.find((t) => t.id === id);
    if (tpl) applyTemplateConfig(tpl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = t(
        "workspace.create.nameRequired",
        "Vui lòng nhập tên workspace",
      );
    }
    if (foundedYear.trim() && !isValidFoundedYear(foundedYear)) {
      newErrors.foundedYear = t(
        "clientProfile.invalidYear",
        "Năm thành lập không hợp lệ",
      );
    }
    if (website.trim() && !isValidUrl(normalizeUrl(website))) {
      newErrors.website = t(
        "agency.detail.errors.invalidUrl",
        "Định dạng URL không hợp lệ",
      );
    }
    if (phone.trim() && !isValidPhone(phone)) {
      newErrors.phone = t(
        "agency.detail.errors.invalidPhone",
        "Số điện thoại không hợp lệ (10-11 số)",
      );
    }
    if (facebookUrl.trim() && !isValidUrl(normalizeUrl(facebookUrl))) {
      newErrors.facebookUrl = t(
        "agency.detail.errors.invalidUrl",
        "Định dạng URL không hợp lệ",
      );
    }
    if (linkedinUrl.trim() && !isValidUrl(normalizeUrl(linkedinUrl))) {
      newErrors.linkedinUrl = t(
        "agency.detail.errors.invalidUrl",
        "Định dạng URL không hợp lệ",
      );
    }
    if (instagramUrl.trim() && !isValidUrl(normalizeUrl(instagramUrl))) {
      newErrors.instagramUrl = t(
        "agency.detail.errors.invalidUrl",
        "Định dạng URL không hợp lệ",
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(
        t("common.formError", "Vui lòng kiểm tra lại các trường thông tin"),
      );
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const yearNum = foundedYear.trim() ? Number(foundedYear) : undefined;
      const { data } = await workspaceService.create({
        name: name.trim(),
        agencyId,
        description: description.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear: yearNum,
        industry: industry || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        industryFields:
          Object.keys(industryFields).length > 0 ? industryFields : undefined,
        assignMembers,
      });
      // Gửi lời mời CLIENT (nếu có) vào workspace vừa tạo — đồng bộ logic với trang Khách hàng (AddClientDialog)
      const validEmails = clientEmails.map((e) => e.trim()).filter(Boolean);
      if (validEmails.length > 0) {
        const results = await Promise.allSettled(
          validEmails.map((email) =>
            workspaceService.inviteMember(data.data.id, {
              email,
              role: "CLIENT",
            }),
          ),
        );
        const failedCount = results.filter(
          (r) => r.status === "rejected",
        ).length;
        if (failedCount > 0) {
          toast.error(
            t("workspace.create.clientInviteFailed", { count: failedCount }),
          );
        }
      }

      // Workspace mới tạo trở thành agency + workspace đang active.
      setCurrentAgencyId(agencyId);
      setCurrentWorkspace(data.data);
      await fetchWorkspaces();
      navigate(`/workspaces/${data.data.id}/settings`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    brandColor,
    setBrandColor,
    logoIcon,
    setLogoIcon,
    tagline,
    setTagline,
    foundedYear,
    setFoundedYear,
    assignMembers,
    setAssignMembers,
    clientEmails,
    setClientEmails,
    agencyId,
    loading,
    handleSubmit,
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
    facebookUrl,
    setFacebookUrl,
    linkedinUrl,
    setLinkedinUrl,
    instagramUrl,
    setInstagramUrl,
    industryFields,
    setIndustryFields,
    appliedTemplateName,
    availableTemplates,
    selectedTemplateId,
    handleTemplateSelect,
    errors,
    clearError,
  };
}

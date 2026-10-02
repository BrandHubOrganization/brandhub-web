import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  workspaceService,
  type AssignEntry,
} from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
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

const CURRENT_YEAR = new Date().getFullYear();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setLoading(true);
    try {
      const yearNum = foundedYear ? Number(foundedYear) : undefined;
      const { data } = await workspaceService.create({
        name: name.trim(),
        agencyId,
        description: description.trim() || undefined,
        brandColor: brandColor || undefined,
        logoIcon: logoIcon || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum >= 1900 && yearNum <= CURRENT_YEAR
            ? yearNum
            : undefined,
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
      // Gửi lời mời CLIENT (nếu có) kèm sẵn workspace vừa tạo — không chặn
      // luồng chính nếu 1 email lỗi (email trùng, đã có lời mời, v.v.).
      const validEmails = clientEmails.map((e) => e.trim()).filter(Boolean);
      if (validEmails.length > 0) {
        const results = await Promise.allSettled(
          validEmails.map((email) =>
            agencyService.inviteMember(agencyId, {
              email,
              workspaceId: data.data.id,
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
  };
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { IndustrySpecificFields } from "@/pages/workspace/components/IndustrySpecificFields";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import type {
  CompanySize,
  WorkspaceIndustry,
  WorkspaceTemplate,
} from "@/types/workspace";

/** Admin — xem (read-only) toàn bộ workspace template mọi agency. */
export function WorkspaceTemplateLibraryPage() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<WorkspaceIndustry | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [industryFields, setIndustryFields] = useState<Record<string, unknown>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  const loadTemplates = () => {
    setLoading(true);
    workspaceTemplateService
      .listAll()
      .then(({ data }) => setTemplates(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("workspace.templates.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(loadTemplates, [t]);

  const resetForm = () => {
    setName("");
    setIndustry("");
    setCompanySize("");
    setIndustryFields({});
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await workspaceTemplateService.saveGlobal({
        name: name.trim(),
        config: {
          industry: industry || null,
          companySize: companySize || null,
          website: null,
          phone: null,
          location: null,
          description: null,
          brandColor: null,
          logoIcon: null,
          tagline: null,
          foundedYear: null,
          facebookUrl: null,
          linkedinUrl: null,
          instagramUrl: null,
          timezone: null,
          defaultPlatforms: null,
          reportFrequency: null,
          industryFields:
            Object.keys(industryFields).length > 0 ? industryFields : null,
        },
      });
      toast.success(t("workspace.templates.adminCreateSuccess"));
      setCreateOpen(false);
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

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.templates.adminTitle")}
      description={t("workspace.templates.adminDescription")}
    >
      <div className="mb-4">
        <Button variant="orange" size="sm" onClick={() => setCreateOpen(true)}>
          {t("workspace.templates.adminCreateButton")}
        </Button>
      </div>
      {templates.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("workspace.templates.empty")}
        </p>
      ) : (
        <div className="flex max-w-2xl flex-col gap-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="border-border bg-card rounded-xl border p-4"
            >
              <p className="text-foreground text-sm font-medium">{tpl.name}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {tpl.agencyId
                  ? `${t("workspace.templates.adminAgencyId")}: ${tpl.agencyId}`
                  : t("workspace.templates.adminGlobalBadge")}
                {" · "}
                {new Date(tpl.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {tpl.config.industry && (
                  <span className="text-muted-foreground">
                    {t("workspace.create.industryLabel")}:{" "}
                    <span className="text-foreground">
                      {t(`workspace.industry.${tpl.config.industry}`)}
                    </span>
                  </span>
                )}
                {tpl.config.companySize && (
                  <span className="text-muted-foreground">
                    {t("workspace.create.companySizeLabel")}:{" "}
                    <span className="text-foreground">
                      {t(`agency.companySize.${tpl.config.companySize}`)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("workspace.templates.adminCreateButton")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              label={t("workspace.settings.template.nameLabel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("workspace.settings.template.namePlaceholder")}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold tracking-wide">
                  {t("workspace.create.industryLabel")}
                </Label>
                <Select
                  value={industry}
                  onChange={(e) =>
                    setIndustry(e.target.value as WorkspaceIndustry | "")
                  }
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
                <Label className="text-xs font-semibold tracking-wide">
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
            </div>
            <IndustrySpecificFields
              industry={industry}
              value={industryFields}
              onChange={setIndustryFields}
            />
          </div>
          <DialogFooter>
            <Button
              variant="orange"
              loading={saving}
              disabled={!name.trim() || saving}
              onClick={handleCreate}
            >
              {t("workspace.settings.template.saveButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export default WorkspaceTemplateLibraryPage;

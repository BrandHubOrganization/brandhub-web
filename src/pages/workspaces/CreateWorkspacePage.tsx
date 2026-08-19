import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";

export function CreateWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await workspaceService.create({
        name: name.trim(),
        industry: industry.trim() || undefined,
      });
      navigate(`/workspaces/${data.data.id}/settings`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title={t("workspace.create.title")}
      description={t("workspace.create.description")}
    >
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-lg border p-6"
      >
        <Input
          label={t("workspace.create.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={t("workspace.create.industryLabel")}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <Button
          variant="orange"
          type="submit"
          loading={loading}
          className="mt-1 gap-2 font-semibold"
        >
          {t("workspace.create.submit")}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";

export function CreateAgencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await agencyService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(t("agency.create.success"));
      navigate(`/agency/${data.data.id}/members`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.createFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title={t("agency.create.title")}
      description={t("agency.create.description")}
    >
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label={t("agency.create.nameLabel")}
          placeholder={t("agency.create.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={t("agency.create.descriptionLabel")}
          placeholder={t("agency.create.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/agency")}
            className="cursor-pointer"
          >
            {t("agency.create.cancel")}
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
          >
            {t("agency.create.submit")}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}

export default CreateAgencyPage;

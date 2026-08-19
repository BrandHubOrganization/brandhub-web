import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  onNameChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateWorkspaceForm({
  name,
  onNameChange,
  industry,
  onIndustryChange,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-lg border p-6"
    >
      <Input
        label={t("workspace.create.nameLabel")}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
      />
      <Input
        label={t("workspace.create.industryLabel")}
        value={industry}
        onChange={(e) => onIndustryChange(e.target.value)}
      />
      <Button
        variant="orange"
        type="submit"
        loading={submitting}
        className="mt-1 gap-2 font-semibold"
      >
        {t("workspace.create.submit")}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

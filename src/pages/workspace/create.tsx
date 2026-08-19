import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useCreateWorkspace } from "./hooks/useCreateWorkspace";
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";

export function CreateWorkspacePage() {
  const { t } = useTranslation();
  const { name, setName, industry, setIndustry, loading, handleSubmit } =
    useCreateWorkspace();

  return (
    <PageWrapper
      title={t("workspace.create.title")}
      description={t("workspace.create.description")}
    >
      <CreateWorkspaceForm
        name={name}
        onNameChange={setName}
        industry={industry}
        onIndustryChange={setIndustry}
        submitting={loading}
        onSubmit={handleSubmit}
      />
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

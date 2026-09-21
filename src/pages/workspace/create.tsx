import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useCreateWorkspace } from "./hooks/useCreateWorkspace";
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";

export function CreateWorkspacePage() {
  const { t } = useTranslation();
  const {
    name,
    setName,
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
    loading,
    handleSubmit,
  } = useCreateWorkspace();

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
        companySize={companySize}
        onCompanySizeChange={setCompanySize}
        website={website}
        onWebsiteChange={setWebsite}
        phone={phone}
        onPhoneChange={setPhone}
        location={location}
        onLocationChange={setLocation}
        submitting={loading}
        onSubmit={handleSubmit}
      />
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

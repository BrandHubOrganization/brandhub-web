import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useCreateWorkspace } from "./hooks/useCreateWorkspace";
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";

export function CreateWorkspacePage() {
  const { t } = useTranslation();
  const {
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
    agencyId,
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
        description={description}
        onDescriptionChange={setDescription}
        brandColor={brandColor}
        onBrandColorChange={setBrandColor}
        logoIcon={logoIcon}
        onLogoIconChange={setLogoIcon}
        tagline={tagline}
        onTaglineChange={setTagline}
        foundedYear={foundedYear}
        onFoundedYearChange={setFoundedYear}
        agencyId={agencyId}
        assignMembers={assignMembers}
        onAssignMembersChange={setAssignMembers}
        submitting={loading}
        onSubmit={handleSubmit}
      />
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

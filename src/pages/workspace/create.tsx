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
  } = useCreateWorkspace();

  return (
    <PageWrapper
      title={t("workspace.create.title")}
      description={t("workspace.create.description")}
    >
      <CreateWorkspaceForm
        name={name}
        onNameChange={(val) => {
          setName(val);
          clearError("name");
        }}
        description={description}
        onDescriptionChange={setDescription}
        brandColor={brandColor}
        onBrandColorChange={setBrandColor}
        logoIcon={logoIcon}
        onLogoIconChange={setLogoIcon}
        tagline={tagline}
        onTaglineChange={setTagline}
        foundedYear={foundedYear}
        onFoundedYearChange={(val) => {
          setFoundedYear(val);
          clearError("foundedYear");
        }}
        agencyId={agencyId}
        assignMembers={assignMembers}
        onAssignMembersChange={setAssignMembers}
        clientEmails={clientEmails}
        onClientEmailsChange={setClientEmails}
        submitting={loading}
        onSubmit={handleSubmit}
        appliedTemplateName={appliedTemplateName}
        industry={industry}
        onIndustryChange={setIndustry}
        companySize={companySize}
        onCompanySizeChange={setCompanySize}
        website={website}
        onWebsiteChange={(val) => {
          setWebsite(val);
          clearError("website");
        }}
        phone={phone}
        onPhoneChange={(val) => {
          setPhone(val);
          clearError("phone");
        }}
        location={location}
        onLocationChange={setLocation}
        facebookUrl={facebookUrl}
        onFacebookUrlChange={(val) => {
          setFacebookUrl(val);
          clearError("facebookUrl");
        }}
        linkedinUrl={linkedinUrl}
        onLinkedinUrlChange={(val) => {
          setLinkedinUrl(val);
          clearError("linkedinUrl");
        }}
        instagramUrl={instagramUrl}
        onInstagramUrlChange={(val) => {
          setInstagramUrl(val);
          clearError("instagramUrl");
        }}
        industryFields={industryFields}
        onIndustryFieldsChange={setIndustryFields}
        availableTemplates={availableTemplates}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={handleTemplateSelect}
        errors={errors}
      />
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

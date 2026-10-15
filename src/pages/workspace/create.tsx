import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useCreateWorkspace } from "./hooks/useCreateWorkspace";
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";
import { WorkspaceCreateLivePreview } from "./components/WorkspaceCreateLivePreview";

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
      fullWidth
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 xl:col-span-7">
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
        </div>

        {/* RIGHT COLUMN: Live Profile Preview (Sticky) */}
        <WorkspaceCreateLivePreview
          name={name}
          tagline={tagline}
          description={description}
          brandColor={brandColor}
          logoIcon={logoIcon}
          foundedYear={foundedYear}
          industry={industry}
          companySize={companySize}
          website={website}
          phone={phone}
          location={location}
          facebookUrl={facebookUrl}
          linkedinUrl={linkedinUrl}
          instagramUrl={instagramUrl}
          industryFields={industryFields}
          assignMembers={assignMembers}
          clientEmails={clientEmails}
          appliedTemplateName={appliedTemplateName}
        />
      </div>
    </PageWrapper>
  );
}

export default CreateWorkspacePage;

import { SAMPLE_DIRECTORY_PARTNERS } from "../sampleCollaborators";
import { directoryService } from "./directoryService";

export async function seedSamplePartnersToAgency(agencyId: string) {
  const existingResponse = await directoryService.list(agencyId, {
    page: 0,
    search: "",
  });
  const existingNames = new Set(
    (existingResponse.data.data?.content ?? []).map((item) =>
      item.partnerName.trim().toLowerCase(),
    ),
  );

  const missing = SAMPLE_DIRECTORY_PARTNERS.filter(
    (sample) => !existingNames.has(sample.partnerName.trim().toLowerCase()),
  );

  for (const sample of missing) {
    await directoryService.create(agencyId, {
      partnerName: sample.partnerName,
      partnerType: sample.partnerType,
      contactInfo: {
        contactName:
          typeof sample.contactInfo.contactName === "string"
            ? sample.contactInfo.contactName
            : "",
        phone:
          typeof sample.contactInfo.phone === "string"
            ? sample.contactInfo.phone
            : "",
        email:
          typeof sample.contactInfo.email === "string"
            ? sample.contactInfo.email
            : "",
        website:
          typeof sample.contactInfo.website === "string"
            ? sample.contactInfo.website
            : "",
      },
      notes: sample.notes ?? "",
    });
  }

  return {
    created: missing.length,
    total: SAMPLE_DIRECTORY_PARTNERS.length,
  };
}

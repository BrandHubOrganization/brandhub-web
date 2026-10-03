export interface ExtendedProfile {
  skills: string[];
  location: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  website: string;
  bannerUrl: string;
}

export const EMPTY_EXTENDED: ExtendedProfile = {
  skills: [],
  location: "",
  yearsOfExperience: "",
  linkedinUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  website: "",
  bannerUrl: "",
};

export const VISIBILITY_FIELDS = [
  "phone",
  "professionalTitle",
  "bio",
  "location",
  "yearsOfExperience",
  "workingLanguage",
  "skills",
  "portfolioUrls",
  "linkedinUrl",
  "facebookUrl",
  "instagramUrl",
  "tiktokUrl",
  "website",
] as const;

export type VisibilityField = (typeof VISIBILITY_FIELDS)[number];

export const VISIBILITY_LABEL_KEY: Record<VisibilityField, string> = {
  phone: "phoneLabel",
  professionalTitle: "jobTitleLabel",
  bio: "bioLabel",
  location: "locationLabel",
  yearsOfExperience: "yearsOfExperienceLabel",
  workingLanguage: "workingLanguageLabel",
  skills: "skillsLabel",
  portfolioUrls: "portfolioLabel",
  linkedinUrl: "linkedinLabel",
  facebookUrl: "facebookLabel",
  instagramUrl: "instagramLabel",
  tiktokUrl: "tiktokLabel",
  website: "websiteLabel",
};

export function defaultVisibility(): Record<VisibilityField, boolean> {
  return Object.fromEntries(VISIBILITY_FIELDS.map((f) => [f, true])) as Record<
    VisibilityField,
    boolean
  >;
}

export function toVisibility(
  raw: Record<string, boolean> | null | undefined,
): Record<VisibilityField, boolean> {
  const v = defaultVisibility();
  if (!raw) return v;
  for (const f of VISIBILITY_FIELDS) {
    if (typeof raw[f] === "boolean") v[f] = raw[f];
  }
  return v;
}

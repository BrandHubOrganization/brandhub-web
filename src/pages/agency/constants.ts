import type { AgencyCategory, CompanySize } from "@/types/agency";

/**
 * Danh sách cố định cho dropdown Category/Company Size — khớp đúng enum
 * Postgres `agency_category`/`company_size` phía BE (AgencyServiceImpl).
 * Label lấy qua i18n key `agency.category.<value>` / `agency.companySize.<value>`.
 */
export const AGENCY_CATEGORIES: AgencyCategory[] = [
  "MARKETING",
  "FNB",
  "FASHION",
  "BEAUTY",
  "TECHNOLOGY",
  "REAL_ESTATE",
  "EDUCATION",
  "HEALTHCARE",
  "RETAIL",
  "FINANCE",
  "ENTERTAINMENT",
  "OTHER",
];

export const COMPANY_SIZES: CompanySize[] = [
  "SIZE_1_10",
  "SIZE_11_50",
  "SIZE_51_200",
  "SIZE_201_500",
  "SIZE_500_PLUS",
];

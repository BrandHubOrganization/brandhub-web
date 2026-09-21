import type { WorkspaceIndustry } from "@/types/workspace";

export { COMPANY_SIZES } from "@/pages/agency/constants";

/**
 * Khớp đúng enum Postgres `workspace_industry` phía BE (WorkspaceServiceImpl).
 * Label lấy qua i18n key `workspace.industry.<value>`.
 */
export const WORKSPACE_INDUSTRIES: WorkspaceIndustry[] = [
  "FNB",
  "FASHION",
  "BEAUTY",
  "TECHNOLOGY",
  "REAL_ESTATE",
  "EDUCATION",
  "HEALTHCARE",
  "SERVICES",
  "RETAIL",
  "OTHER",
];

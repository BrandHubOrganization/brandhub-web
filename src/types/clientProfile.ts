import type { CompanySize } from "@/types/agency";

export interface ClientProfile {
  id: string;
  userId: string;
  displayName: string;
  company: string | null;
  phone: string | null;
  note: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  socialLinks: Record<string, string> | null;
  contactName: string | null;
  contactEmail: string | null;
  companySize: CompanySize | null;
  instagramUrl: string | null;
  taxCode: string | null;
  address: string | null;
  tagline: string | null;
  foundedYear: number | null;
  budgetRange: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClientProfileRequest {
  displayName: string;
  company?: string;
  phone?: string;
  note?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
  socialLinks?: Record<string, string>;
  contactName?: string;
  contactEmail?: string;
  companySize?: CompanySize;
  instagramUrl?: string;
  taxCode?: string;
  address?: string;
  tagline?: string;
  foundedYear?: number;
  budgetRange?: string;
}

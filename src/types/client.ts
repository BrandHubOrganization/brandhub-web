import type { Platform } from "./post";

export interface ServicePackage {
  maxPostsPerMonth: number;
  platforms: Platform[];
  aiCreditsPerMonth: number;
  reportFrequency: "WEEKLY" | "MONTHLY";
}

export interface Client {
  id: string;
  workspaceId: string;
  name: string;
  logo?: string;
  industry?: string;
  accountManagerId: string;
  servicePackage: ServicePackage;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

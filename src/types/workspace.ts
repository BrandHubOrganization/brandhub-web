export interface WorkspaceSettings {
  defaultPlatforms: string[];
  timezone: string;
  language: "vi" | "en";
}

export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  ownerId: string;
  description?: string;
  subscriptionId?: string;
  settings: WorkspaceSettings;
  createdAt: string;
}

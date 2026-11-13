import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type { TaskType } from "@/types/task";

export interface CatalogSectionDef {
  key: string;
  visibility: "OUTPUT" | "INTERNAL";
}
export interface CatalogRoleDef {
  role: string;
  name: string;
  sections: CatalogSectionDef[];
}
export interface TaskCatalogResponse {
  taskType: TaskType;
  roles: CatalogRoleDef[];
  sections: CatalogSectionDef[];
}

const data = <T,>(r: { data: ApiResponse<T> }) => r.data.data;

export const taskCatalogService = {
  get: (taskType: TaskType) =>
    api
      .get<ApiResponse<TaskCatalogResponse>>(`/api/v1/task-catalog/${taskType}`)
      .then(data),
};

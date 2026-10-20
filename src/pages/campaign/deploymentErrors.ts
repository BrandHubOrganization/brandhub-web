import { isAxiosError } from "axios";

/** An absent outbox is expected before deploy; arbitrary HTTP 404 is not. */
export function isDeploymentNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
    && error.response.data?.error?.code === "CAMPAIGN_DEPLOYMENT_NOT_FOUND";
}

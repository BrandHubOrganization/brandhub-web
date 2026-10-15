import { describe, expect, it } from "vitest";
import { isDeploymentNotFound } from "./deploymentErrors";

describe("deployment absence", () => {
  const error = (status: number, code?: string) => ({ isAxiosError: true, response: { status, data: { error: { code } } } });
  it("accepts only the explicit missing-deployment code with HTTP 404", () => {
    expect(isDeploymentNotFound(error(404, "CAMPAIGN_DEPLOYMENT_NOT_FOUND"))).toBe(true);
    expect(isDeploymentNotFound(error(404))).toBe(false);
    expect(isDeploymentNotFound(error(404, "CAMPAIGN_NOT_FOUND"))).toBe(false);
    expect(isDeploymentNotFound(error(401, "CAMPAIGN_DEPLOYMENT_NOT_FOUND"))).toBe(false);
    expect(isDeploymentNotFound(new Error("offline"))).toBe(false);
  });
});

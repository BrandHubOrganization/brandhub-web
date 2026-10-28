export function customerDriveReturnPath(
  workspace: string | null,
  candidate: string | null,
): string {
  if (!workspace || !/^[a-zA-Z0-9-]+$/.test(workspace)) return "/workspace";
  const dashboard = `/workspaces/${workspace}/dashboard`;
  const library = `/workspaces/${workspace}/library`;
  return candidate === dashboard ||
    candidate === library ||
    candidate === "/library"
    ? candidate
    : dashboard;
}

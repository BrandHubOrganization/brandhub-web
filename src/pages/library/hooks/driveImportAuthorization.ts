export const DRIVE_IMPORT_SCOPE =
  "https://www.googleapis.com/auth/drive.readonly";
interface TokenResponse {
  access_token?: string;
  scope?: string;
  error?: string;
}
interface GoogleOAuth {
  initTokenClient(options: {
    client_id: string;
    scope: string;
    include_granted_scopes: boolean;
    callback: (response: TokenResponse) => void;
    error_callback: (response: { type: string }) => void;
  }): { requestAccessToken(options: { prompt: string }): void };
}
function oauth(): GoogleOAuth | undefined {
  return (
    window as Window & { google?: { accounts?: { oauth2?: GoogleOAuth } } }
  ).google?.accounts?.oauth2;
}
let loading: Promise<void> | undefined;
export function loadDriveImportAuthorization(): Promise<void> {
  if (oauth()) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => fail(), 20_000);
    function fail() {
      clearTimeout(timer);
      script.remove();
      loading = undefined;
      reject(new Error("DRIVE_IMPORT_SDK_UNAVAILABLE"));
    }
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!oauth()) return fail();
      clearTimeout(timer);
      resolve();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
// Call synchronously from the submit event so the browser permits Google's popup.
export function requestDriveImportToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const api = oauth();
    if (!api) {
      reject(new Error("DRIVE_IMPORT_SDK_UNAVAILABLE"));
      return;
    }
    const client = api.initTokenClient({
      client_id: clientId,
      scope: DRIVE_IMPORT_SCOPE,
      include_granted_scopes: false,
      callback: (response) => {
        if (
          response.error ||
          !response.access_token ||
          !response.scope?.split(" ").includes(DRIVE_IMPORT_SCOPE)
        ) {
          reject(new Error("DRIVE_IMPORT_AUTH_REQUIRED"));
        } else resolve(response.access_token);
      },
      error_callback: (response) =>
        reject(
          new Error(
            response.type === "popup_closed"
              ? "DRIVE_IMPORT_CANCELLED"
              : "DRIVE_IMPORT_POPUP_FAILED",
          ),
        ),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}

export const DRIVE_IMPORT_SCOPE =
  "https://www.googleapis.com/auth/drive.readonly";

interface TokenResponse {
  access_token?: string;
  scope?: string;
  error?: string;
  expires_in?: number;
}

interface GoogleOAuth {
  initTokenClient(options: {
    client_id: string;
    scope: string;
    include_granted_scopes: boolean;
    hint?: string;
    callback: (response: TokenResponse) => void;
    error_callback: (response: { type: string }) => void;
  }): { requestAccessToken(options?: { prompt?: string; hint?: string }): void };
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
  email?: string;
}

let cachedToken: CachedToken | null = null;

export function getCachedDriveImportToken(userEmail?: string): string | null {
  if (!cachedToken) return null;
  if (userEmail && cachedToken.email && cachedToken.email !== userEmail) {
    cachedToken = null;
    return null;
  }
  // Buffer 2 minutes before actual expiry
  if (Date.now() >= cachedToken.expiresAt - 120_000) {
    cachedToken = null;
    return null;
  }
  return cachedToken.accessToken;
}

export function clearCachedDriveImportToken(): void {
  cachedToken = null;
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
export function requestDriveImportToken(
  clientId: string,
  userEmail?: string,
): Promise<string> {
  // If we already have a valid token for this user/session, return immediately without popup
  const existing = getCachedDriveImportToken(userEmail);
  if (existing) {
    return Promise.resolve(existing);
  }

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
      hint: userEmail,
      callback: (response) => {
        if (
          response.error ||
          !response.access_token ||
          !response.scope?.split(" ").includes(DRIVE_IMPORT_SCOPE)
        ) {
          reject(new Error("DRIVE_IMPORT_AUTH_REQUIRED"));
        } else {
          const expiresIn = response.expires_in ?? 3599;
          cachedToken = {
            accessToken: response.access_token,
            expiresAt: Date.now() + expiresIn * 1000,
            email: userEmail,
          };
          resolve(response.access_token);
        }
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

    // If userEmail is provided, pass hint and leave prompt empty so Google reuses the active Google account
    // without forcing the account chooser or re-authentication if permission is already granted.
    if (userEmail) {
      client.requestAccessToken({ prompt: "", hint: userEmail });
    } else {
      client.requestAccessToken({ prompt: "" });
    }
  });
}

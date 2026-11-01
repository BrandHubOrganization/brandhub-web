import type {
  Ambassador,
  AmbassadorVideoJob,
  InstantIdSettings,
} from "@/pages/ai-studio/types/ambassador";

const STORAGE_KEY_PREFIX = "brandhub.ambassadors.v1";
const JOBS_KEY_PREFIX = "brandhub.ambassador.jobs.v1";

function getScopeKey(prefix: string): string {
  try {
    const wsId = window.localStorage.getItem("brandhub.currentWorkspaceId");
    if (wsId) return `${prefix}.${wsId}`;
    const rawUser = window.localStorage.getItem("brandhub_user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser) as { id?: string; agencyId?: string };
      if (parsed.agencyId) return `${prefix}.${parsed.agencyId}`;
      if (parsed.id) return `${prefix}.${parsed.id}`;
    }
  } catch {
    // ignore storage access errors
  }
  return prefix;
}

function readAmbassadors(): Ambassador[] {
  try {
    const raw = window.localStorage.getItem(getScopeKey(STORAGE_KEY_PREFIX));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Ambassador[]) : [];
  } catch {
    return [];
  }
}

function writeAmbassadors(items: Ambassador[]): void {
  try {
    window.localStorage.setItem(
      getScopeKey(STORAGE_KEY_PREFIX),
      JSON.stringify(items),
    );
  } catch {
    // ignore storage access errors
  }
}

function readJobs(): AmbassadorVideoJob[] {
  try {
    const raw = window.localStorage.getItem(getScopeKey(JOBS_KEY_PREFIX));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AmbassadorVideoJob[]) : [];
  } catch {
    return [];
  }
}

function writeJobs(items: AmbassadorVideoJob[]): void {
  try {
    window.localStorage.setItem(
      getScopeKey(JOBS_KEY_PREFIX),
      JSON.stringify(items),
    );
  } catch {
    // ignore storage access errors
  }
}

export async function getAmbassadors(): Promise<Ambassador[]> {
  return Promise.resolve(readAmbassadors());
}

export async function createAmbassador(
  name: string,
  faceImageUrl: string,
  instantIdSettings: InstantIdSettings,
): Promise<Ambassador> {
  const items = readAmbassadors();
  const newAmbassador: Ambassador = {
    id: `amb-${Date.now()}`,
    name,
    faceImageUrl,
    status: "TRAINING",
    createdAt: new Date().toISOString(),
    videosGenerated: 0,
    instantIdSettings,
  };
  items.push(newAmbassador);
  writeAmbassadors(items);
  return Promise.resolve({ ...newAmbassador });
}

export async function deleteAmbassador(id: string): Promise<void> {
  const items = readAmbassadors().filter((a) => a.id !== id);
  writeAmbassadors(items);
  return Promise.resolve();
}

export async function generateVideo(
  ambassadorId: string,
  prompt: string,
): Promise<AmbassadorVideoJob> {
  const jobs = readJobs();
  const job: AmbassadorVideoJob = {
    id: `job-${Date.now()}`,
    ambassadorId,
    prompt,
    status: "QUEUED",
    createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  writeJobs(jobs);

  const items = readAmbassadors().map((a) =>
    a.id === ambassadorId
      ? { ...a, videosGenerated: a.videosGenerated + 1 }
      : a,
  );
  writeAmbassadors(items);
  return Promise.resolve({ ...job });
}

export async function getVideoJobs(
  ambassadorId: string,
): Promise<AmbassadorVideoJob[]> {
  return Promise.resolve(
    readJobs().filter((j) => j.ambassadorId === ambassadorId),
  );
}

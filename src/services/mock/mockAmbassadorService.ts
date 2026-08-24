import type {
  Ambassador,
  AmbassadorVideoJob,
} from "@/pages/ai-studio/types/ambassador";

const MOCK_AMBASSADORS: Ambassador[] = [
  {
    id: "amb-1",
    name: "Minh Anh",
    faceImageUrl: "https://i.pravatar.cc/300?img=47",
    status: "READY",
    createdAt: "2026-07-01T00:00:00Z",
    videosGenerated: 12,
    modelId: "model-minh-anh-v2",
  },
  {
    id: "amb-2",
    name: "Quang Huy",
    faceImageUrl: "https://i.pravatar.cc/300?img=13",
    status: "READY",
    createdAt: "2026-07-20T00:00:00Z",
    videosGenerated: 5,
    modelId: "model-quang-huy-v1",
  },
  {
    id: "amb-3",
    name: "Thu Trang",
    faceImageUrl: "https://i.pravatar.cc/300?img=32",
    status: "TRAINING",
    createdAt: "2026-08-20T00:00:00Z",
    videosGenerated: 0,
  },
  {
    id: "amb-4",
    name: "Hoang Nam",
    faceImageUrl: "https://i.pravatar.cc/300?img=68",
    status: "FAILED",
    createdAt: "2026-08-15T00:00:00Z",
    videosGenerated: 0,
  },
];

const MOCK_VIDEO_JOBS: AmbassadorVideoJob[] = [];

export async function getAmbassadors(): Promise<Ambassador[]> {
  return Promise.resolve(MOCK_AMBASSADORS.map((a) => ({ ...a })));
}

export async function createAmbassador(
  name: string,
  faceImageUrl: string,
): Promise<Ambassador> {
  const newAmbassador: Ambassador = {
    id: `amb-${Date.now()}`,
    name,
    faceImageUrl,
    status: "TRAINING",
    createdAt: new Date().toISOString(),
    videosGenerated: 0,
  };
  MOCK_AMBASSADORS.push(newAmbassador);
  return Promise.resolve({ ...newAmbassador });
}

export async function deleteAmbassador(id: string): Promise<void> {
  const idx = MOCK_AMBASSADORS.findIndex((a) => a.id === id);
  if (idx !== -1) MOCK_AMBASSADORS.splice(idx, 1);
  return Promise.resolve();
}

export async function generateVideo(
  ambassadorId: string,
  prompt: string,
): Promise<AmbassadorVideoJob> {
  const job: AmbassadorVideoJob = {
    id: `job-${Date.now()}`,
    ambassadorId,
    prompt,
    status: "QUEUED",
    createdAt: new Date().toISOString(),
  };
  MOCK_VIDEO_JOBS.push(job);
  const ambassador = MOCK_AMBASSADORS.find((a) => a.id === ambassadorId);
  if (ambassador) ambassador.videosGenerated += 1;
  return Promise.resolve({ ...job });
}

export async function getVideoJobs(
  ambassadorId: string,
): Promise<AmbassadorVideoJob[]> {
  return Promise.resolve(
    MOCK_VIDEO_JOBS.filter((j) => j.ambassadorId === ambassadorId).map((j) => ({
      ...j,
    })),
  );
}

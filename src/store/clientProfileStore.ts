import { create } from "zustand";
import type { ClientProfile } from "@/types/clientProfile";
import { clientProfileService } from "@/services/clientProfileService";

// BA mới — 1 user có N ClientProfile, gắn theo từng workspace (không phải
// agency) qua client_profile_id trên WorkspaceMember. currentClientProfile
// = profile đang active cho workspace hiện tại, resolve bằng id, không còn
// bằng agencyId.
export interface ClientProfileState {
  currentClientProfile: ClientProfile | null;
  setCurrentClientProfile: (profile: ClientProfile | null) => void;
  fetchProfileById: (profileId: string) => Promise<void>;
  reset: () => void;
}

export const useClientProfileStore = create<ClientProfileState>((set) => ({
  currentClientProfile: null,

  setCurrentClientProfile: (profile) => set({ currentClientProfile: profile }),

  fetchProfileById: async (profileId) => {
    try {
      const { data } = await clientProfileService.getById(profileId);
      set({ currentClientProfile: data.data });
    } catch {
      set({ currentClientProfile: null });
    }
  },

  reset: () => set({ currentClientProfile: null }),
}));

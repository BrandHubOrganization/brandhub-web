import { create } from "zustand";
import type { ClientProfile } from "@/types/clientProfile";
import { clientProfileService } from "@/services/clientProfileService";

export interface ClientProfileState {
  currentClientProfile: ClientProfile | null;
  setCurrentClientProfile: (profile: ClientProfile | null) => void;
  fetchMyProfile: (agencyId: string) => Promise<void>;
  reset: () => void;
}

export const useClientProfileStore = create<ClientProfileState>((set) => ({
  currentClientProfile: null,

  setCurrentClientProfile: (profile) => set({ currentClientProfile: profile }),

  fetchMyProfile: async (agencyId) => {
    try {
      const { data } = await clientProfileService.getMyProfile(agencyId);
      set({ currentClientProfile: data.data });
    } catch {
      set({ currentClientProfile: null });
    }
  },

  reset: () => set({ currentClientProfile: null }),
}));

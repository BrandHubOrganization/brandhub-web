import { create } from "zustand";
import type { Agency } from "@/types/agency";
import { agencyService } from "@/services/agencyService";

export interface AgencyState {
  currentAgencyId: string | null;
  setCurrentAgencyId: (agencyId: string | null) => void;
  agencyList: Agency[];
  setAgencyList: (list: Agency[]) => void;
  fetchAgencies: () => Promise<void>;
}

const STORAGE_KEY = "brandhub_current_agency_id";

export const useAgencyStore = create<AgencyState>((set) => ({
  currentAgencyId: localStorage.getItem(STORAGE_KEY),
  agencyList: [],

  setCurrentAgencyId: (agencyId) => {
    if (agencyId) localStorage.setItem(STORAGE_KEY, agencyId);
    else localStorage.removeItem(STORAGE_KEY);
    set({ currentAgencyId: agencyId });
  },

  setAgencyList: (list) => set({ agencyList: list }),

  fetchAgencies: async () => {
    try {
      const { data } = await agencyService.list();
      set({ agencyList: data.data });
    } catch {
      set({ agencyList: [] });
    }
  },
}));

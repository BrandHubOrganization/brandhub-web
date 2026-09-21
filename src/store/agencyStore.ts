import { create } from "zustand";

export interface AgencyState {
  currentAgencyId: string | null;
  setCurrentAgencyId: (agencyId: string | null) => void;
}

const STORAGE_KEY = "brandhub_current_agency_id";

export const useAgencyStore = create<AgencyState>((set) => ({
  currentAgencyId: localStorage.getItem(STORAGE_KEY),

  setCurrentAgencyId: (agencyId) => {
    if (agencyId) localStorage.setItem(STORAGE_KEY, agencyId);
    else localStorage.removeItem(STORAGE_KEY);
    set({ currentAgencyId: agencyId });
  },
}));

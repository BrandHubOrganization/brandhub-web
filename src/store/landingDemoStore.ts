import { create } from "zustand";

interface LandingDemoState {
  activePage: number;
  requestId: number;
  /** Feature card / external click: changes the tab AND asks CinematicHero to scroll into view. */
  goToPage: (pageIndex: number) => void;
  /** In-hero nav (sidebar/dock/auto-demo cycle): changes the tab, no scroll side-effect. */
  setPage: (pageIndex: number) => void;
}

/**
 * Bridges Feature cards -> CinematicHero MacBook demo tab. `requestId`
 * increments only on goToPage so consecutive clicks on the same
 * pageIndex still re-trigger the scroll effect in CinematicHero, and so
 * in-hero navigation (which must NOT scroll the page) can update the
 * tab via setPage without bumping it.
 */
export const useLandingDemoStore = create<LandingDemoState>()((set) => ({
  activePage: 0,
  requestId: 0,
  goToPage: (pageIndex) =>
    set((s) => ({ activePage: pageIndex, requestId: s.requestId + 1 })),
  setPage: (pageIndex) => set({ activePage: pageIndex }),
}));

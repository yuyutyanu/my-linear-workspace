import { create } from 'zustand';

type AppState = {
  visits: number;
  incrementVisits: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  visits: 0,
  incrementVisits: () => set((state) => ({ visits: state.visits + 1 })),
}));

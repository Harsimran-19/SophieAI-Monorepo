import { create } from "zustand"

interface UIState {
  leftPanelKey: number
  incrementLeftPanelKey: () => void
}

export const useUIState = create<UIState>()((set) => ({
  leftPanelKey: 0,
  incrementLeftPanelKey: () =>
    set((state) => ({
      leftPanelKey: state.leftPanelKey + 1,
    })),
}))

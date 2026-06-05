import { create } from 'zustand'
import type { ImageMode, GeneratedImageData } from '@/lib/ai/types'

interface AIStudioState {
  activeMode: ImageMode
  isGenerating: boolean
  generationProgress: string
  currentResults: GeneratedImageData[]
  preselectedProductId: string | null
  preselectedProductName: string | null

  setActiveMode: (mode: ImageMode) => void
  startGeneration: (progress?: string) => void
  completeGeneration: (results: GeneratedImageData[]) => void
  failGeneration: () => void
  clearResults: () => void
  setPreselectedProduct: (id: string | null, name: string | null) => void
}

export const useAIStudioStore = create<AIStudioState>()((set) => ({
  activeMode: 'ENHANCE',
  isGenerating: false,
  generationProgress: '',
  currentResults: [],
  preselectedProductId: null,
  preselectedProductName: null,

  setActiveMode: (mode) => set({ activeMode: mode }),

  startGeneration: (progress = 'Generating...') =>
    set({ isGenerating: true, generationProgress: progress, currentResults: [] }),

  completeGeneration: (results) =>
    set({ isGenerating: false, generationProgress: '', currentResults: results }),

  failGeneration: () =>
    set({ isGenerating: false, generationProgress: '' }),

  clearResults: () => set({ currentResults: [] }),

  setPreselectedProduct: (id, name) =>
    set({ preselectedProductId: id, preselectedProductName: name }),
}))

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { ParsedResume } from "@/types/resumeParsed"

import { useUIState } from "./useUIStore"

interface ResumeState {
  resumeData: ParsedResume | null
  unsavedChanges: boolean
  setResumeData: (data: ParsedResume) => void
  updateResumeData: (data: ParsedResume) => void
  updateSection: (
    sectionType: keyof ParsedResume,
    newData: ParsedResume[keyof ParsedResume]["data"]
  ) => void
  clearResumeData: () => void
  silentApply: (
    section: keyof ParsedResume,
    entryId: string,
    updater: <T extends { description: string[] }>(entry: T) => T
  ) => void
  applyBulletPoint: (
    sectionId: string,
    entryId: string,
    bullet: { original: string; refined: string }
  ) => void
}

const initialState: ParsedResume = {
  Personal: { type: "Personal", data: [] }, // Changed from PersonalEntry
  Education: { type: "Education", data: [] },
  Experience: { type: "Experience", data: [] },
  Projects: { type: "Projects", data: [] },
  Certificates: { type: "Certificates", data: [] },
  Awards: { type: "Awards", data: [] },
}

const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumeData: initialState,
      unsavedChanges: false,
      setResumeData: (data) => {
        const serializedData = JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
        set({ resumeData: serializedData, unsavedChanges: false })
      },
      updateResumeData: (data) => {
        const serializedData = JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
        set({ resumeData: serializedData, unsavedChanges: true })
      },
      updateSection: (sectionType, newData) =>
        set((state) => {
          if (!state.resumeData) return state

          return {
            resumeData: {
              ...state.resumeData,
              [sectionType]: {
                type: sectionType,
                data: newData,
              },
            },
            unsavedChanges: true,
          }
        }),
      clearResumeData: () => set({ resumeData: null, unsavedChanges: false }),
      silentApply: (section, entryId, updater) => {
        const current = structuredClone(get().resumeData)
        if (!current) return

        const updated = {
          ...current,
          [section]: {
            ...current[section],
            data: current[section].data.map((entry) => {
              if (entry.id === entryId && "description" in entry) {
                return updater(entry as { description: string[] })
              }
              return entry
            }),
          },
        }

        localStorage.setItem(
          "resume-storage",
          JSON.stringify(updated, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
        useUIState.getState().incrementLeftPanelKey()
      },
      applyBulletPoint: (sectionId, entryId, bullet) => {
        console.log("🔄 Store: Starting bullet point update:", {
          sectionId,
          entryId,
          bullet,
        })

        const current = get().resumeData
        if (!current) {
          console.warn("⚠️ Store: No resume data found")
          return
        }

        const updatedResumeData = structuredClone(current)
        const section = updatedResumeData[sectionId as keyof ParsedResume]

        if (!section || !section.data) {
          console.warn("⚠️ Store: Section or data not found:", { sectionId })
          return
        }

        // Find entry by matching any of the entry's text content
        if (sectionId === "Experience" || sectionId === "Projects") {
          section.data = section.data.map((entry) => {
            if ("description" in entry && Array.isArray(entry.description)) {
              // Check if this entry contains the original text
              const hasMatchingDescription = entry.description.some(
                (desc) => desc === bullet.original
              )

              if (hasMatchingDescription) {
                const updated = {
                  ...entry,
                  description: entry.description.map((desc) =>
                    desc === bullet.original ? bullet.refined : desc
                  ),
                }
                console.log("✏️ Store: Updated entry:", updated)
                return updated
              }
            }
            return entry
          }) as typeof section.data
        }

        console.log("💾 Store: Setting new state")
        set({ resumeData: updatedResumeData, unsavedChanges: true })
      },
    }),
    {
      name: "resume-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null

          // Convert string back to BigInt when retrieving
          const data = JSON.parse(str)
          const convertBigInt = <T>(obj: T): T => {
            if (!obj) return obj
            if (Array.isArray(obj)) {
              return obj.map(convertBigInt) as T
            }
            if (typeof obj === "object") {
              Object.entries(obj as Record<string, unknown>).forEach(
                ([key, value]) => {
                  if (key === "id" && typeof value === "string") {
                    ;(obj as Record<string, unknown>)[key] = BigInt(value)
                  } else if (typeof value === "object") {
                    ;(obj as Record<string, unknown>)[key] =
                      convertBigInt(value)
                  }
                }
              )
            }
            return obj
          }
          return convertBigInt(data)
        },
        setItem: (name, value) => {
          // Convert BigInt to string before storing
          const serialized = JSON.stringify(value, (key, val) =>
            typeof val === "bigint" ? val.toString() : val
          )
          localStorage.setItem(name, serialized)
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)

if (typeof window !== "undefined") {
  const savedState = localStorage.getItem("resume-storage")
  if (savedState) {
    useResumeStore.setState(JSON.parse(savedState))
  }
}

export default useResumeStore

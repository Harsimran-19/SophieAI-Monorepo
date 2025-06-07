"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { fetchResumeById } from "@/actions/resumes/fetchResumeById"
import { updateResume } from "@/actions/resumes/updateResume"

import type { ResumeStatus } from "@/types/resume"
import type { ResumeData } from "@/types/resume-content"

import { useToast } from "@/components/ui/use-toast"

interface UseResumeState {
  draftData: ResumeData | null
  liveData: ResumeData | null
  resumeStatus: ResumeStatus | null
  loading: boolean
  saving: boolean
  error: string | null
}

interface UseResumeResult extends UseResumeState {
  setDraftData: (data: ResumeData) => void
  saveDraft: () => Promise<void>
  publish: () => Promise<void>
  refresh: () => Promise<void>
}

const initialState: UseResumeState = {
  draftData: null,
  liveData: null,
  resumeStatus: null,
  loading: true,
  saving: false,
  error: null,
}

// Debounce time for auto-save (2 seconds)
const AUTOSAVE_DELAY = 2000

export function useResume(resumeId: string): UseResumeResult {
  const [state, setState] = useState<UseResumeState>(initialState)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedContentRef = useRef<string>("")
  const isAutoSavingRef = useRef(false)

  // Memoize draftData to avoid unnecessary re-renders
  const draftData = state.draftData

  // Load resume data
  const loadResume = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const resume = await fetchResumeById(resumeId)

      if (!resume) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load resume",
        }))
        return
      }

      // Initialize lastSavedContent
      lastSavedContentRef.current = JSON.stringify(resume.content)

      // Batch state updates
      setState((prev) => ({
        ...prev,
        draftData: resume.content,
        liveData: resume.content,
        resumeStatus: resume.status,
        loading: false,
        error: null,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "An unexpected error occurred while loading the resume",
      }))
    }
  }, [resumeId])

  // Initial load
  useEffect(() => {
    loadResume()
  }, [loadResume])

  // Silent auto-save function
  const performAutoSave = useCallback(
    async (content: ResumeData) => {
      try {
        isAutoSavingRef.current = true
        const result = await updateResume({
          id: resumeId,
          content,
          status: "Draft",
        })

        if (result.error) {
          return
        }

        // Update lastSavedContent on successful save
        lastSavedContentRef.current = JSON.stringify(content)
      } catch (err) {
        // Silent fail for auto-save
      } finally {
        isAutoSavingRef.current = false
      }
    },
    [resumeId]
  )

  // Handle draft data updates with debounced auto-save
  const setDraftData = useCallback(
    (data: ResumeData) => {
      setState((prev) => ({ ...prev, draftData: data }))

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set new timer for auto-save
      autoSaveTimerRef.current = setTimeout(() => {
        const currentContent = JSON.stringify(data)
        if (
          currentContent !== lastSavedContentRef.current &&
          !isAutoSavingRef.current
        ) {
          performAutoSave(data)
        }
      }, AUTOSAVE_DELAY)
    },
    [performAutoSave]
  )

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  // Manual save draft version
  const saveDraft = useCallback(async () => {
    if (!draftData || state.saving) return

    setState((prev) => ({ ...prev, saving: true, error: null }))

    try {
      const result = await updateResume({
        id: resumeId,
        content: draftData,
        status: "Draft",
      })

      if (result.error) {
        setState((prev) => ({
          ...prev,
          saving: false,
          error: result.error.message,
        }))
        toast({
          title: "Save failed",
          description: result.error.message,
          variant: "destructive",
        })
        throw result.error
      }

      // Update lastSavedContent
      lastSavedContentRef.current = JSON.stringify(draftData)

      setState((prev) => ({
        ...prev,
        liveData: draftData,
        resumeStatus: "Draft",
        saving: false,
        error: null,
      }))

      // Show success toast only for manual saves
      toast({
        title: "Success",
        description: "Resume saved successfully",
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the draft"
      setState((prev) => ({
        ...prev,
        saving: false,
        error: errorMessage,
      }))
      throw err
    }
  }, [resumeId, draftData, state.saving, toast])

  // Publish resume with optimized state updates and transitions
  const publish = useCallback(async () => {
    if (!draftData) return

    startTransition(async () => {
      try {
        setState((prev) => ({ ...prev, saving: true, error: null }))
        const result = await updateResume({
          id: resumeId,
          content: draftData,
          status: "Active",
        })

        if (result.error) {
          // Batch error state updates
          setState((prev) => ({
            ...prev,
            saving: false,
            error: result.error.message,
          }))
          toast({
            title: "Publish failed",
            description: result.error.message,
            variant: "destructive",
          })
          return
        }

        // Batch success state updates
        setState((prev) => ({
          ...prev,
          liveData: draftData,
          resumeStatus: "Active",
          saving: false,
          error: null,
        }))

        toast({
          title: "Success",
          description: "Resume published successfully",
        })
      } catch (err) {
        const errorMessage =
          "An unexpected error occurred while publishing the resume"
        // Batch error state updates
        setState((prev) => ({
          ...prev,
          saving: false,
          error: errorMessage,
        }))
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    })
  }, [resumeId, draftData, toast])

  return {
    ...state,
    setDraftData,
    saveDraft,
    publish,
    refresh: loadResume,
  }
}

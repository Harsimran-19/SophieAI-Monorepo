import type { ResumeStatus } from "@/types/resume"
import type { ResumeData } from "@/types/resume-content"

import { createClient } from "@/lib/supabase/client"

interface FetchResumeResult {
  data: {
    id: string
    status: ResumeStatus
    content: ResumeData
    created_at: Date
    updated_at: Date
  } | null
  error: Error | null
}

export async function fetchResumeById(
  resumeId: string
): Promise<FetchResumeResult> {
  const supabase = createClient()

  try {
    // Input validation
    if (!resumeId?.trim()) {
      return {
        data: null,
        error: new Error("Resume ID is required"),
      }
    }

    // Fetch resume with all necessary fields
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .select("id, status, content, created_at, updated_at")
      .eq("id", resumeId)
      .single()

    // Handle database error
    if (dbError) {
      console.error("Database error:", dbError)
      return {
        data: null,
        error: new Error("Failed to fetch resume"),
      }
    }

    // Handle not found case
    if (!resume) {
      return {
        data: null,
        error: new Error("Resume not found"),
      }
    }

    // Validate resume content
    if (!resume.content) {
      console.error("Invalid resume content for ID:", resumeId)
      return {
        data: null,
        error: new Error("Invalid resume content"),
      }
    }

    return {
      data: {
        id: resume.id,
        status: resume.status,
        content: resume.content as ResumeData,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
      error: null,
    }
  } catch (err) {
    // Log unexpected errors
    console.error("Unexpected error in fetchResumeById:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to fetch resume"),
    }
  }
}
